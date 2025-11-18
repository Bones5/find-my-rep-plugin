<?php
/**
 * PHPUnit bootstrap file for Find My Rep Plugin tests
 *
 * @package FindMyRep
 */

// Define test environment
define('FIND_MY_REP_TESTS_DIR', __DIR__);

// Mock WordPress functions for testing
if (!function_exists('__')) {
    function __($text, $domain = 'default') {
        return $text;
    }
}

if (!function_exists('esc_html__')) {
    function esc_html__($text, $domain = 'default') {
        return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('sprintf')) {
    // sprintf is a native PHP function, no need to mock
}

if (!function_exists('get_option')) {
    function get_option($option, $default = false) {
        global $test_options;
        return isset($test_options[$option]) ? $test_options[$option] : $default;
    }
}

if (!function_exists('wp_remote_post')) {
    function wp_remote_post($url, $args = array()) {
        global $test_wp_remote_response;
        return isset($test_wp_remote_response) ? $test_wp_remote_response : array('body' => '', 'response' => array('code' => 200));
    }
}

if (!function_exists('is_wp_error')) {
    function is_wp_error($thing) {
        return ($thing instanceof WP_Error);
    }
}

if (!function_exists('wp_remote_retrieve_response_code')) {
    function wp_remote_retrieve_response_code($response) {
        return isset($response['response']['code']) ? $response['response']['code'] : 200;
    }
}

if (!function_exists('wp_remote_retrieve_body')) {
    function wp_remote_retrieve_body($response) {
        return isset($response['body']) ? $response['body'] : '';
    }
}

if (!function_exists('wp_mail')) {
    function wp_mail($to, $subject, $message, $headers = '', $attachments = array()) {
        global $test_wp_mail_calls;
        if (!isset($test_wp_mail_calls)) {
            $test_wp_mail_calls = array();
        }
        $test_wp_mail_calls[] = array(
            'to' => $to,
            'subject' => $subject,
            'message' => $message,
            'headers' => $headers,
            'attachments' => $attachments
        );
        return true;
    }
}

if (!function_exists('wp_upload_dir')) {
    function wp_upload_dir() {
        global $test_upload_dir;
        if (!isset($test_upload_dir)) {
            $test_upload_dir = sys_get_temp_dir() . '/wp-uploads';
        }
        if (!file_exists($test_upload_dir)) {
            mkdir($test_upload_dir, 0777, true);
        }
        return array(
            'basedir' => $test_upload_dir,
            'baseurl' => 'http://example.com/wp-content/uploads',
        );
    }
}

if (!function_exists('current_time')) {
    function current_time($type = 'mysql') {
        if ($type === 'mysql') {
            return date('Y-m-d H:i:s');
        }
        return time();
    }
}

if (!defined('ABSPATH')) {
    define('ABSPATH', '/tmp/wordpress/');
}

if (!defined('WP_CONTENT_DIR')) {
    define('WP_CONTENT_DIR', ABSPATH . 'wp-content');
}

// Simple WP_Error class for testing
if (!class_exists('WP_Error')) {
    class WP_Error {
        private $message;
        
        public function __construct($message) {
            $this->message = $message;
        }
        
        public function get_error_message() {
            return $this->message;
        }
    }
}

// Load the email service class
require_once dirname(dirname(__DIR__)) . '/includes/class-find-my-rep-email-service.php';

// Load Composer autoloader
require_once dirname(dirname(__DIR__)) . '/vendor/autoload.php';
