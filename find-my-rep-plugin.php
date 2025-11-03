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
        
        ob_start();
        ?>
        <div class="find-my-rep-container" id="<?php echo esc_attr($block_id); ?>">
            <div class="find-my-rep-step step-postcode">
                <h3><?php esc_html_e('Find Your Representatives', 'find-my-rep'); ?></h3>
                <label for="postcode-input">
                    <?php esc_html_e('Enter your postcode:', 'find-my-rep'); ?>
                </label>
                <input type="text" id="postcode-input" class="postcode-input" placeholder="e.g. SW1A 1AA" />
                <button class="button button-primary find-reps-btn">
                    <?php esc_html_e('Find Representatives', 'find-my-rep'); ?>
                </button>
                <div class="error-message" style="display:none;"></div>
            </div>
            
            <div class="find-my-rep-step step-select" style="display:none;">
                <h3><?php esc_html_e('Select Representatives to Contact', 'find-my-rep'); ?></h3>
                <div class="representatives-list"></div>
                <button class="button button-primary continue-btn">
                    <?php esc_html_e('Continue', 'find-my-rep'); ?>
                </button>
            </div>
            
            <div class="find-my-rep-step step-letter" style="display:none;">
                <h3><?php esc_html_e('Review and Edit Your Letter', 'find-my-rep'); ?></h3>
                <div class="letter-fields">
                    <label for="sender-name">
                        <?php esc_html_e('Your Name:', 'find-my-rep'); ?>
                    </label>
                    <input type="text" id="sender-name" class="sender-name" required />
                    
                    <label for="sender-email">
                        <?php esc_html_e('Your Email:', 'find-my-rep'); ?>
                    </label>
                    <input type="email" id="sender-email" class="sender-email" required />
                </div>
                <textarea class="letter-content" rows="15"></textarea>
                <button class="button button-primary send-btn">
                    <?php esc_html_e('Send Letters', 'find-my-rep'); ?>
                </button>
                <div class="success-message" style="display:none;"></div>
            </div>
            
            <div class="loading-spinner" style="display:none;">
                <span class="spinner is-active"></span>
            </div>
        </div>
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
        
        wp_send_json_success($data);
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
        $resend_api_key = get_option('find_my_rep_resend_api_key', '');
        
        if (empty($resend_api_key)) {
            wp_send_json_error(array('message' => __('Resend API key not configured.', 'find-my-rep')));
            return;
        }
        
        // Validate that representatives were parsed correctly
        if (!is_array($representatives) || empty($representatives)) {
            wp_send_json_error(array('message' => __('Invalid representatives data.', 'find-my-rep')));
            return;
        }
        
        $sent_count = 0;
        $errors = array();
        
        foreach ($representatives as $rep) {
            // Replace placeholders in letter
            $personalized_letter = str_replace(
                array('{{representative_name}}', '{{representative_title}}'),
                array($rep['name'], $rep['title']),
                $letter_content
            );
            
            // Send email via Resend API
            $response = wp_remote_post('https://api.resend.com/emails', array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $resend_api_key,
                    'Content-Type' => 'application/json',
                ),
                'body' => json_encode(array(
                    'from' => $sender_email,
                    'to' => $rep['email'],
                    'subject' => 'Letter from constituent',
                    'text' => $personalized_letter,
                    'reply_to' => $sender_email,
                )),
            ));
            
            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $sent_count++;
            } else {
                $errors[] = sprintf(__('Failed to send to %s', 'find-my-rep'), $rep['name']);
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
