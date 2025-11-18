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
        $asset_file_path = FIND_MY_REP_PLUGIN_DIR . 'build/index.tsx.asset.php';
        if (!file_exists($asset_file_path)) {
            return;
        }
        $asset_file = include($asset_file_path);
        
        // Register block script
        wp_register_script(
            'find-my-rep-block-editor',
            FIND_MY_REP_PLUGIN_URL . 'build/index.tsx.js',
            $asset_file['dependencies'],
            $asset_file['version']
        );
        
        // Register block styles
        wp_register_style(
            'find-my-rep-block-style',
            FIND_MY_REP_PLUGIN_URL . 'build/style.css',
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
        
        // Load asset file for dependencies and version
        $frontend_asset_file_path = FIND_MY_REP_PLUGIN_DIR . 'build/frontend.tsx.asset.php';
        $frontend_asset_file = file_exists($frontend_asset_file_path) ? include($frontend_asset_file_path) : array('dependencies' => array(), 'version' => FIND_MY_REP_VERSION);
        
        // Enqueue frontend script
        wp_enqueue_script(
            'find-my-rep-frontend',
            FIND_MY_REP_PLUGIN_URL . 'build/frontend.tsx.js',
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
        <div class="find-my-rep-container" id="<?php echo esc_attr($block_id); ?>"></div>
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
        $value = get_option('find_my_rep_api_url', '');
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
        $api_url = get_option('find_my_rep_api_url', '');
        
        if (empty($api_url)) {
            wp_send_json_error(array('message' => __('API URL not configured.', 'find-my-rep')));
            return;
        }
        
        // Make API request to get representatives
        $response = wp_remote_get($api_url . '/' . urlencode($postcode));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => __('Failed to fetch representatives.', 'find-my-rep')));
            return;
        }
        
        // Check HTTP response code
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            wp_send_json_error(array('message' => sprintf(__('API request failed with status code: %d', 'find-my-rep'), $response_code)));
            return;
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        // Check for JSON decode errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array('message' => __('Invalid response from API.', 'find-my-rep')));
            return;
        }
        
        if (empty($data)) {
            wp_send_json_error(array('message' => __('No representatives found for this postcode.', 'find-my-rep')));
            return;
        }
        
        // Transform new API format to internal format
        $transformed_data = $this->transform_api_response($data);
        
        wp_send_json_success($transformed_data);
    }
    
    /**
     * Transform new API response format to internal format
     */
    private function transform_api_response($data) {
        // Check if data is already in old format (backwards compatibility)
        if (isset($data['representatives']) && is_array($data['representatives'])) {
            return $data;
        }
        
        // Transform new format to internal format
        $representatives = array();
        $geographic_info = array();
        
        // Extract area information from areaInfo
        if (isset($data['areaInfo'])) {
            $area_info = $data['areaInfo'];
            
            if (isset($area_info['localAuthority']['name'])) {
                $geographic_info['area'] = $area_info['localAuthority']['name'];
            }
            
            if (isset($area_info['ward']['name'])) {
                $geographic_info['ward'] = $area_info['ward']['name'];
            }
            
            if (isset($area_info['constituency']['name'])) {
                $geographic_info['westminster_constituency'] = $area_info['constituency']['name'];
            }
        }
        
        // Transform MP
        if (isset($data['mp']) && !empty($data['mp'])) {
            $mp = $data['mp'];
            if (isset($mp['name']) && isset($mp['email']) && isset($mp['constituency'])) {
                $representatives[] = array(
                    'name' => $mp['name'],
                    'email' => $mp['email'],
                    'title' => 'Member of Parliament for ' . $mp['constituency'],
                    'type' => 'MP'
                );
            }
        }
        
        // Transform MS (Member of the Senedd)
        if (isset($data['ms']) && !empty($data['ms'])) {
            $ms = $data['ms'];
            if (isset($ms['name']) && isset($ms['email']) && isset($ms['constituency'])) {
                $representatives[] = array(
                    'name' => $ms['name'],
                    'email' => $ms['email'],
                    'title' => 'Member of the Senedd for ' . $ms['constituency'],
                    'type' => 'MS'
                );
            }
        }
        
        // Transform PCC (Police and Crime Commissioner)
        if (isset($data['pcc']) && !empty($data['pcc'])) {
            $pcc = $data['pcc'];
            if (isset($pcc['name']) && isset($pcc['email'])) {
                $representatives[] = array(
                    'name' => $pcc['name'],
                    'email' => $pcc['email'],
                    'title' => 'Police and Crime Commissioner',
                    'type' => 'PCC'
                );
            }
        }
        
        // Transform Councillors
        if (isset($data['councillors']) && !empty($data['councillors']) && is_array($data['councillors'])) {
            foreach ($data['councillors'] as $councillor) {
                if (isset($councillor['name']) && isset($councillor['email']) && isset($councillor['ward'])) {
                    $representatives[] = array(
                        'name' => $councillor['name'],
                        'email' => $councillor['email'],
                        'title' => 'Councillor for ' . $councillor['ward'],
                        'type' => 'Councillor'
                    );
                }
            }
        }
        
        return array(
            'geographic_info' => $geographic_info,
            'representatives' => $representatives
        );
    }
    
    /**
     * AJAX handler to send letter
     */
    public function ajax_send_letter() {
        check_ajax_referer('find_my_rep_nonce', 'nonce');
        
        $sender_name = sanitize_text_field($_POST['sender_name']);
        $sender_email = sanitize_email($_POST['sender_email']);
        $letter_content = sanitize_textarea_field($_POST['letter_content']);
        $representatives = json_decode(stripslashes($_POST['representatives']), true);
        
        // Validate that representatives were parsed correctly
        if (!is_array($representatives) || empty($representatives)) {
            wp_send_json_error(array('message' => __('Invalid representatives data.', 'find-my-rep')));
            return;
        }
        
        // Get email service instance
        $email_service = $this->get_email_service();
        
        $sent_count = 0;
        $errors = array();
        
        foreach ($representatives as $rep) {
            // Prepare placeholders for template rendering
            $placeholders = array(
                '{{representative_name}}' => isset($rep['name']) ? $rep['name'] : '',
                '{{representative_title}}' => isset($rep['title']) ? $rep['title'] : '',
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
}

// Initialize the plugin
new Find_My_Rep_Plugin();
