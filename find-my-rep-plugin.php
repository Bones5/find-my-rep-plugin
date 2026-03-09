<?php
/**
 * Plugin Name: Find My Rep
 * Plugin URI: https://github.com/Bones5/find-my-rep-plugin
 * Description: A WordPress plugin that creates a Gutenberg block for contacting local representatives via templated letters sent through Resend.
 * Version: 1.0.0
 * Author: Bones5
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: find-my-rep
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('FIND_MY_REP_VERSION', '1.0.0');
define('FIND_MY_REP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FIND_MY_REP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load email service class
require_once FIND_MY_REP_PLUGIN_DIR . 'includes/class-find-my-rep-email-service.php';

/**
 * Main plugin class
 */
class Find_My_Rep_Plugin {
    /**
     * Maximum number of letter submissions allowed within the rate limit window.
     */
    const RATE_LIMIT_MAX_ATTEMPTS = 3;
    
    /**
     * Rate limit window in seconds (10 minutes).
     */
    const RATE_LIMIT_WINDOW = 600;

    /**
     * Postcode lookup cache window in seconds (5 minutes).
     */
    const POSTCODE_CACHE_WINDOW = 300;
    
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'register_block'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_ajax_find_my_rep_get_representatives', array($this, 'ajax_get_representatives'));
        add_action('wp_ajax_nopriv_find_my_rep_get_representatives', array($this, 'ajax_get_representatives'));
        add_action('wp_ajax_find_my_rep_send_letter', array($this, 'ajax_send_letter'));
        add_action('wp_ajax_nopriv_find_my_rep_send_letter', array($this, 'ajax_send_letter'));
    }
    
    /**
     * Get email service instance
     *
     * @return Find_My_Rep_Email_Service
     */
    private function get_email_service() {
        // Get transport from option, default to 'resend'
        $transport = get_option('find_my_rep_email_transport', 'resend');
        
        // Allow filtering for development/testing purposes
        $transport = apply_filters('find_my_rep_email_transport', $transport);
        
        return new Find_My_Rep_Email_Service($transport);
    }
    
    /**
     * Register the Gutenberg block
     */
    public function register_block() {
        // Load asset file for dependencies and version
        $asset_file_path = FIND_MY_REP_PLUGIN_DIR . 'build/index.asset.php';
        if (!file_exists($asset_file_path)) {
            return;
        }
        $asset_file = include($asset_file_path);
        
        // Register block script
        wp_register_script(
            'find-my-rep-block-editor',
            FIND_MY_REP_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version']
        );
        
        // Register block styles (fallback to src/style.css during dev)
        $built_style_path = FIND_MY_REP_PLUGIN_DIR . 'build/style.css';
        $style_url = file_exists($built_style_path)
            ? FIND_MY_REP_PLUGIN_URL . 'build/style.css'
            : FIND_MY_REP_PLUGIN_URL . 'src/style.css';
        wp_register_style(
            'find-my-rep-block-style',
            $style_url,
            array(),
            FIND_MY_REP_VERSION
        );
        
        // Register the block
        register_block_type('find-my-rep/contact-block', array(
            'editor_script' => 'find-my-rep-block-editor',
            'style' => 'find-my-rep-block-style',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'blockId' => array(
                    'type' => 'string',
                    'default' => ''
                ),
                'letterTemplate' => array(
                    'type' => 'string',
                    'default' => ''
                )
            )
        ));
    }
    
    /**
     * Render the block on the frontend
     */
    public function render_block($attributes) {
        $block_id = !empty($attributes['blockId']) ? $attributes['blockId'] : 'block-' . uniqid();
        $letter_template = get_option('find_my_rep_letter_template', '');
        $per_block_template = !empty($attributes['letterTemplate']) ? $attributes['letterTemplate'] : '';
        
        // Load asset file for dependencies and version
        $frontend_asset_file_path = FIND_MY_REP_PLUGIN_DIR . 'build/frontend.asset.php';
        $frontend_asset_file = file_exists($frontend_asset_file_path) ? include($frontend_asset_file_path) : array('dependencies' => array(), 'version' => FIND_MY_REP_VERSION);
        
        // Enqueue frontend script
        wp_enqueue_script(
            'find-my-rep-frontend',
            FIND_MY_REP_PLUGIN_URL . 'build/frontend.js',
            $frontend_asset_file['dependencies'],
            $frontend_asset_file['version'],
            true
        );
        
        // Localize script with AJAX URL and nonce
        wp_localize_script('find-my-rep-frontend', 'findMyRepData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('find_my_rep_nonce'),
            'letterTemplate' => $letter_template
        ));
        
        // Return the container div - React will render the content
        ob_start();
        ?>
        <div class="find-my-rep-container" id="<?php echo esc_attr($block_id); ?>" data-letter-template="<?php echo esc_attr($per_block_template); ?>"></div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            __('Find My Rep Settings', 'find-my-rep'),
            __('Find My Rep', 'find-my-rep'),
            'manage_options',
            'find-my-rep-settings',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('find_my_rep_settings', 'find_my_rep_letter_template');
        register_setting('find_my_rep_settings', 'find_my_rep_resend_api_key');
        register_setting('find_my_rep_settings', 'find_my_rep_api_url');
        register_setting('find_my_rep_settings', 'find_my_rep_email_transport');
        
        add_settings_section(
            'find_my_rep_main_section',
            __('Plugin Settings', 'find-my-rep'),
            array($this, 'settings_section_callback'),
            'find-my-rep-settings'
        );
        
        add_settings_field(
            'find_my_rep_api_url',
            __('Representatives API URL', 'find-my-rep'),
            array($this, 'api_url_field_callback'),
            'find-my-rep-settings',
            'find_my_rep_main_section'
        );
        
        add_settings_field(
            'find_my_rep_resend_api_key',
            __('Resend API Key', 'find-my-rep'),
            array($this, 'resend_api_key_field_callback'),
            'find-my-rep-settings',
            'find_my_rep_main_section'
        );
        
        add_settings_field(
            'find_my_rep_letter_template',
            __('Letter Template', 'find-my-rep'),
            array($this, 'letter_template_field_callback'),
            'find-my-rep-settings',
            'find_my_rep_main_section'
        );
        
        add_settings_field(
            'find_my_rep_email_transport',
            __('Email Transport', 'find-my-rep'),
            array($this, 'email_transport_field_callback'),
            'find-my-rep-settings',
            'find_my_rep_main_section'
        );
    }
    
    /**
     * Settings section callback
     */
    public function settings_section_callback() {
        echo '<p>' . esc_html__('Configure the letter template and API settings for the Find My Rep plugin.', 'find-my-rep') . '</p>';
    }
    
    /**
     * API URL field callback
     */
    public function api_url_field_callback() {
        $value = get_option('find_my_rep_api_url', 'http://host.docker.internal:3000/api/reps');
        echo '<input type="url" name="find_my_rep_api_url" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">' . esc_html__('Enter the API endpoint URL to fetch representatives by postcode.', 'find-my-rep') . '</p>';
    }
    
    /**
     * Resend API key field callback
     */
    public function resend_api_key_field_callback() {
        $value = get_option('find_my_rep_resend_api_key', '');
        echo '<input type="password" name="find_my_rep_resend_api_key" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">' . esc_html__('Enter your Resend API key for sending emails.', 'find-my-rep') . '</p>';
    }
    
    /**
     * Letter template field callback
     */
    public function letter_template_field_callback() {
        $value = get_option('find_my_rep_letter_template', '');
        echo '<textarea name="find_my_rep_letter_template" rows="10" class="large-text">' . esc_textarea($value) . '</textarea>';
        echo '<p class="description">' . esc_html__('Enter the default letter template. Use {{representative_name}} and {{representative_title}} as placeholders.', 'find-my-rep') . '</p>';
    }
    
    /**
     * Email transport field callback
     */
    public function email_transport_field_callback() {
        $value = get_option('find_my_rep_email_transport', 'resend');
        ?>
        <select name="find_my_rep_email_transport" class="regular-text">
            <option value="resend" <?php selected($value, 'resend'); ?>><?php esc_html_e('Resend API', 'find-my-rep'); ?></option>
            <option value="smtp" <?php selected($value, 'smtp'); ?>><?php esc_html_e('SMTP (wp_mail)', 'find-my-rep'); ?></option>
            <option value="test" <?php selected($value, 'test'); ?>><?php esc_html_e('Test (Log to File)', 'find-my-rep'); ?></option>
        </select>
        <p class="description"><?php esc_html_e('Select the email transport method. Use "Test" for development to log emails to file.', 'find-my-rep'); ?></p>
        <?php
    }
    
    /**
     * Render admin page
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('find_my_rep_settings');
                do_settings_sections('find-my-rep-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * AJAX handler to get representatives
     */
    public function ajax_get_representatives() {
        check_ajax_referer('find_my_rep_nonce', 'nonce');
        
        $postcode = sanitize_text_field($_POST['postcode']);
        $result = $this->get_representatives_for_postcode($postcode);

        if (!$result['success']) {
            wp_send_json_error(array('message' => $result['message']));
            return;
        }

        wp_send_json_success($result['data']);
    }
    
    /**
     * AJAX handler to send letter
     */
    public function ajax_send_letter() {
        check_ajax_referer('find_my_rep_nonce', 'nonce');
        
        $sender_name = sanitize_text_field($_POST['sender_name']);
        $sender_email = sanitize_email($_POST['sender_email']);
        $letter_content = sanitize_textarea_field($_POST['letter_content']);
        $postcode = isset($_POST['postcode']) ? sanitize_text_field($_POST['postcode']) : '';
        $not_robot = isset($_POST['not_robot']) ? sanitize_text_field($_POST['not_robot']) : '0';
        $representatives = json_decode(stripslashes($_POST['representatives']), true);
        $validation_message = $this->validate_letter_request($sender_name, $sender_email, $letter_content, $not_robot);
        
        if ($validation_message) {
            wp_send_json_error(array('message' => $validation_message));
            return;
        }
        
        if ($this->is_rate_limited($sender_email)) {
            wp_send_json_error(array(
                'message' => __('Please wait a few minutes before sending more messages.', 'find-my-rep')
            ));
            return;
        }
        
        // Validate that representatives were parsed correctly
        if (!is_array($representatives) || empty($representatives)) {
            wp_send_json_error(array('message' => __('Invalid representatives data.', 'find-my-rep')));
            return;
        }

        $verified_selection = $this->get_verified_representatives($postcode, $representatives);
        if (!$verified_selection['success']) {
            wp_send_json_error(array('message' => $verified_selection['message']));
            return;
        }
        $representatives = $verified_selection['representatives'];
        
        // Get email service instance
        $email_service = $this->get_email_service();
        
        $sent_count = 0;
        $errors = array();
        
        foreach ($representatives as $rep) {
            // Build title based on representative type
            $title = $this->get_representative_title($rep);
            
            // Prepare placeholders for template rendering
            $placeholders = array(
                '{{representative_name}}' => isset($rep['name']) ? $rep['name'] : '',
                '{{representative_title}}' => $title,
            );
            
            // Render personalized letter
            $personalized_letter = $email_service->render_template($letter_content, $placeholders);
            
            // Send email
            $result = $email_service->send_letter(
                $sender_email,
                $rep['email'],
                'Letter from constituent',
                $personalized_letter
            );
            
            if ($result['success']) {
                $sent_count++;
            } else {
                $errors[] = sprintf(__('Failed to send to %s: %s', 'find-my-rep'), $rep['name'], $result['message']);
            }
        }
        
        $total_count = count($representatives);
        
        if ($sent_count === $total_count) {
            // All letters sent successfully
            wp_send_json_success(array(
                'message' => sprintf(__('Successfully sent %d letter(s).', 'find-my-rep'), $sent_count)
            ));
        } elseif ($sent_count > 0) {
            // Partial success - some sent, some failed
            wp_send_json_success(array(
                'message' => sprintf(__('Successfully sent %d of %d letter(s).', 'find-my-rep'), $sent_count, $total_count),
                'errors' => $errors,
                'partial' => true
            ));
        } else {
            // Complete failure
            wp_send_json_error(array(
                'message' => __('Failed to send any letters.', 'find-my-rep'),
                'errors' => $errors
            ));
        }
    }
    
    /**
     * Get a human-readable title for a representative based on their type
     *
     * @param array $rep Representative data with 'type' field
     * @return string Human-readable title
     */
    private function get_representative_title($rep) {
        $type = isset($rep['type']) ? $rep['type'] : '';
        
        switch ($type) {
            case 'MP':
                $constituency = isset($rep['constituency']) ? $rep['constituency'] : '';
                return $constituency ? 'Member of Parliament for ' . $constituency : 'Member of Parliament';
            
            case 'MS':
                $constituency = isset($rep['constituency']) ? $rep['constituency'] : '';
                return $constituency ? 'Member of the Senedd for ' . $constituency : 'Member of the Senedd';
            
            case 'PCC':
                $force = isset($rep['force']) ? $rep['force'] : '';
                return $force ? 'Police and Crime Commissioner for ' . $force : 'Police and Crime Commissioner';
            
            case 'Councillor':
                $ward = isset($rep['ward']) ? $rep['ward'] : '';
                $council = isset($rep['council']) ? $rep['council'] : '';
                if ($ward && $council) {
                    return 'Councillor for ' . $ward . ', ' . $council;
                } elseif ($ward) {
                    return 'Councillor for ' . $ward;
                }
                return 'Councillor';
            
            default:
                return 'Representative';
        }
    }
    
    /**
     * Validate a letter request before attempting delivery
     *
     * @param string $sender_name Sender name
     * @param string $sender_email Sender email
     * @param string $letter_content Letter content
     * @return string Empty string when valid, translated error message when invalid
     */
    private function validate_letter_request($sender_name, $sender_email, $letter_content, $not_robot = '0') {
        if (empty($sender_name) || empty($sender_email) || empty($letter_content)) {
            return __('Please fill in all fields.', 'find-my-rep');
        }
        
        if (!is_email($sender_email)) {
            return __('Please enter a valid email address.', 'find-my-rep');
        }

        if ($not_robot !== '1') {
            return __('Please confirm you are sending this message yourself before sending.', 'find-my-rep');
        }
        
        if (strlen($letter_content) > 5000) {
            return __('Please shorten your message before sending.', 'find-my-rep');
        }
        
        if (
            $this->contains_abusive_content($sender_name) ||
            $this->contains_abusive_content($sender_email) ||
            $this->contains_abusive_content($letter_content)
        ) {
            return __('Please remove abusive or threatening language before sending your message.', 'find-my-rep');
        }
        
        if ($this->contains_excessive_links($letter_content)) {
            return __('Please remove excessive links before sending your message.', 'find-my-rep');
        }
        
        return '';
    }

    /**
     * Fetch representatives for a postcode using the configured API endpoint.
     *
     * @param string $postcode Postcode to lookup.
     * @return array Array containing 'success' (bool) and either:
     *               - 'data' (array) with the postcode lookup response keys such as 'postcode', 'mp', 'ms', 'pcc', 'councillors', and 'areaInfo'
     *               - 'message' (string) on failure
     */
    private function get_representatives_for_postcode($postcode) {
        $postcode = trim((string) $postcode);

        if (empty($postcode)) {
            return array(
                'success' => false,
                'message' => __('Please search for your postcode again before sending.', 'find-my-rep'),
            );
        }

        $cached_lookup = $this->get_cached_postcode_lookup($postcode);
        if (!empty($cached_lookup)) {
            return array(
                'success' => true,
                'data' => $cached_lookup,
            );
        }

        $api_url = get_option('find_my_rep_api_url', 'http://host.docker.internal:3000/api/reps');

        // Build request URL safely (avoid double slashes)
        $request_url = rtrim($api_url, '/') . '/' . urlencode($postcode);

        // Make API request to get representatives
        $response = wp_remote_get($request_url);

        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => __('Failed to fetch representatives.', 'find-my-rep'),
            );
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code === 400) {
            return array(
                'success' => false,
                'message' => __('Invalid postcode format. Please enter a valid UK postcode.', 'find-my-rep'),
            );
        }

        if ($response_code === 404) {
            return array(
                'success' => false,
                'message' => __('This postcode is not in our coverage area.', 'find-my-rep'),
            );
        }

        if ($response_code < 200 || $response_code >= 300) {
            return array(
                'success' => false,
                'message' => sprintf(__('API request failed (HTTP %d). Please check the API URL in settings.', 'find-my-rep'), $response_code),
            );
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return array(
                'success' => false,
                'message' => __('Invalid response from API.', 'find-my-rep'),
            );
        }

        if (empty($data)) {
            return array(
                'success' => false,
                'message' => __('No representatives found for this postcode.', 'find-my-rep'),
            );
        }

        $has_reps = !empty($data['mp']) || !empty($data['ms']) || !empty($data['pcc']) || !empty($data['councillors']);
        if (!$has_reps) {
            return array(
                'success' => false,
                'message' => __('No representatives found for this postcode.', 'find-my-rep'),
            );
        }

        $this->cache_postcode_lookup($postcode, $data);

        return array(
            'success' => true,
            'data' => $data,
        );
    }

    /**
     * Get a cached postcode lookup response when available.
     *
     * @param string $postcode Postcode used to build the cache key.
     * @return array
     */
    private function get_cached_postcode_lookup($postcode) {
        if (!function_exists('get_transient')) {
            return array();
        }

        $cached_lookup = get_transient($this->get_postcode_cache_key($postcode));
        return is_array($cached_lookup) ? $cached_lookup : array();
    }

    /**
     * Cache a successful postcode lookup response.
     *
     * @param string $postcode Postcode used to build the cache key.
     * @param array  $data Successful postcode lookup response data.
     * @return void
     */
    private function cache_postcode_lookup($postcode, $data) {
        if (!function_exists('set_transient')) {
            return;
        }

        set_transient($this->get_postcode_cache_key($postcode), $data, self::POSTCODE_CACHE_WINDOW);
    }

    /**
     * Build the transient key used for postcode lookup caching.
     *
     * @param string $postcode Postcode used to build the cache key.
     * @return string
     */
    private function get_postcode_cache_key($postcode) {
        return 'find_my_rep_postcode_' . md5(strtolower(trim((string) $postcode)));
    }

    /**
     * Verify that submitted representatives match the server-side postcode lookup.
     *
     * @param string $postcode Postcode used to fetch representatives.
     * @param array  $representatives Representatives submitted by the client.
     * @return array Array containing 'success' (bool) and either 'representatives' (array) on success or 'message' (string) on failure.
     */
    private function get_verified_representatives($postcode, $representatives) {
        $lookup = $this->get_representatives_for_postcode($postcode);
        if (!$lookup['success']) {
            return $lookup;
        }

        $allowed_representatives = $this->flatten_representatives_response($lookup['data']);
        $allowed_map = array();
        foreach ($allowed_representatives as $representative) {
            $allowed_map[$this->get_representative_key($representative)] = $representative;
        }

        $verified = array();
        $seen = array();

        foreach ($representatives as $representative) {
            if (!is_array($representative) || !isset($representative['type']) || !isset($representative['id'])) {
                return array(
                    'success' => false,
                    'message' => __('Selected representatives could not be verified. Please search by postcode again and try again.', 'find-my-rep'),
                );
            }

            $key = $this->get_representative_key($representative);
            if (isset($seen[$key])) {
                continue;
            }

            if (!isset($allowed_map[$key])) {
                return array(
                    'success' => false,
                    'message' => __('Selected representatives could not be verified. Please search by postcode again and try again.', 'find-my-rep'),
                );
            }

            $verified[] = $allowed_map[$key];
            $seen[$key] = true;
        }

        if (empty($verified)) {
            return array(
                'success' => false,
                'message' => __('Selected representatives could not be verified. Please search by postcode again and try again.', 'find-my-rep'),
            );
        }

        return array(
            'success' => true,
            'representatives' => $verified,
        );
    }

    /**
     * Flatten the API response into the selectable representative structure used by the frontend.
     *
     * @param array $data Raw postcode lookup response containing representative keys such as 'mp', 'ms', 'pcc', and 'councillors'.
     * @return array
     */
    private function flatten_representatives_response($data) {
        $representatives = array();

        if (!empty($data['mp'])) {
            $data['mp']['type'] = 'MP';
            $representatives[] = $data['mp'];
        }

        if (!empty($data['ms'])) {
            $data['ms']['type'] = 'MS';
            $representatives[] = $data['ms'];
        }

        if (!empty($data['pcc'])) {
            $data['pcc']['type'] = 'PCC';
            $representatives[] = $data['pcc'];
        }

        if (!empty($data['councillors']) && is_array($data['councillors'])) {
            foreach ($data['councillors'] as $councillor) {
                if (!is_array($councillor)) {
                    continue;
                }
                $councillor['type'] = 'Councillor';
                $representatives[] = $councillor;
            }
        }

        return $representatives;
    }

    /**
     * Build a stable key for a representative.
     *
     * @param array $representative Representative data.
     * @return string Key in the format "type:id".
     */
    private function get_representative_key($representative) {
        $type = isset($representative['type']) ? sanitize_text_field($representative['type']) : '';
        $id = isset($representative['id']) ? (int) $representative['id'] : 0;

        return $type . ':' . $id;
    }
    
    /**
     * Check whether submitted content contains abusive language
     *
     * @param string $content Content to inspect
     * @return bool
     */
    private function contains_abusive_content($content) {
        $patterns = apply_filters('find_my_rep_blocked_message_patterns', array(
            '/\b(fuck|shit|cunt|bitch|bastard|asshole)\b/i',
            '/\b(kill yourself|kill you|go die|you should die|i will hurt you)\b/i',
        ));
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content) === 1) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check whether a message includes excessive links
     *
     * @param string $content Message content
     * @return bool
     */
    private function contains_excessive_links($content) {
        return preg_match_all('/(?:https?:\/\/|www\.)/i', $content) > 2;
    }
    
    /**
     * Apply a simple per-sender rate limit
     *
     * @param string $sender_email Sender email address
     * @return bool
     */
    private function is_rate_limited($sender_email) {
        if (!function_exists('get_transient') || !function_exists('set_transient')) {
            return false;
        }
        
        $rate_limit_key = $this->get_rate_limit_key($sender_email);
        $attempts = (int) get_transient($rate_limit_key);
        
        if ($attempts >= self::RATE_LIMIT_MAX_ATTEMPTS) {
            return true;
        }
        
        set_transient($rate_limit_key, $attempts + 1, self::RATE_LIMIT_WINDOW);
        return false;
    }
    
    /**
     * Build the transient key used for rate limiting using sender email only
     *
     * @param string $sender_email Sender email address
     * @return string
     */
    private function get_rate_limit_key($sender_email) {
        return 'find_my_rep_rate_' . md5(strtolower(trim((string) $sender_email)));
    }
}

// Initialize the plugin
new Find_My_Rep_Plugin();
