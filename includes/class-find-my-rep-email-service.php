<?php
/**
 * Email Service for Find My Rep Plugin
 * 
 * Handles email template rendering and sending with support for multiple transport modes.
 *
 * @package FindMyRep
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Find My Rep Email Service
 */
class Find_My_Rep_Email_Service {
    
    /**
     * Transport mode (resend|smtp|test)
     *
     * @var string
     */
    private $transport;
    
    /**
     * Constructor
     *
     * @param string $transport Transport mode (resend|smtp|test). Default 'resend'.
     */
    public function __construct($transport = 'resend') {
        $this->transport = $transport;
    }
    
    /**
     * Render email template with placeholders replaced
     *
     * @param string $template      Template content with placeholders
     * @param array  $placeholders  Associative array of placeholder => value pairs
     * @return string Rendered template
     */
    public function render_template($template, $placeholders) {
        // Ensure all expected placeholders exist, default to empty string if missing
        $defaults = array(
            '{{representative_name}}' => '',
            '{{representative_title}}' => '',
        );
        
        // Merge with provided placeholders, provided values take precedence
        $placeholders = array_merge($defaults, $placeholders);
        
        // Use strtr for efficient placeholder replacement
        return strtr($template, $placeholders);
    }
    
    /**
     * Send letter to a representative
     *
     * @param string $sender_email      Sender's email address
     * @param string $recipient_email   Representative's email address
     * @param string $subject           Email subject
     * @param string $content           Email content
     * @param array  $headers           Optional. Email headers. Default empty array.
     * @return array Array with 'success' (bool) and 'message' (string) keys
     */
    public function send_letter($sender_email, $recipient_email, $subject, $content, $headers = array()) {
        switch ($this->transport) {
            case 'resend':
                return $this->send_via_resend($sender_email, $recipient_email, $subject, $content);
            
            case 'smtp':
                return $this->send_via_smtp($sender_email, $recipient_email, $subject, $content, $headers);
            
            case 'test':
                return $this->send_via_test($sender_email, $recipient_email, $subject, $content);
            
            default:
                return array(
                    'success' => false,
                    'message' => sprintf(__('Unknown transport mode: %s', 'find-my-rep'), $this->transport)
                );
        }
    }
    
    /**
     * Send email via Resend API
     *
     * @param string $sender_email      Sender's email address
     * @param string $recipient_email   Representative's email address
     * @param string $subject           Email subject
     * @param string $content           Email content
     * @return array Array with 'success' (bool) and 'message' (string) keys
     */
    private function send_via_resend($sender_email, $recipient_email, $subject, $content) {
        $resend_api_key = get_option('find_my_rep_resend_api_key', '');
        
        if (empty($resend_api_key)) {
            return array(
                'success' => false,
                'message' => __('Resend API key not configured.', 'find-my-rep')
            );
        }
        
        $response = wp_remote_post('https://api.resend.com/emails', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $resend_api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'from' => $sender_email,
                'to' => $recipient_email,
                'subject' => $subject,
                'text' => $content,
                'reply_to' => $sender_email,
            )),
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code === 200) {
            return array(
                'success' => true,
                'message' => __('Email sent successfully via Resend.', 'find-my-rep')
            );
        } else {
            $body = wp_remote_retrieve_body($response);
            return array(
                'success' => false,
                'message' => sprintf(__('Resend API error (HTTP %d): %s', 'find-my-rep'), $response_code, $body)
            );
        }
    }
    
    /**
     * Send email via SMTP (using WordPress wp_mail)
     *
     * @param string $sender_email      Sender's email address
     * @param string $recipient_email   Representative's email address
     * @param string $subject           Email subject
     * @param string $content           Email content
     * @param array  $headers           Email headers
     * @return array Array with 'success' (bool) and 'message' (string) keys
     */
    private function send_via_smtp($sender_email, $recipient_email, $subject, $content, $headers = array()) {
        // Add reply-to header if not already present
        $has_reply_to = false;
        foreach ($headers as $header) {
            if (stripos($header, 'reply-to:') === 0) {
                $has_reply_to = true;
                break;
            }
        }
        
        if (!$has_reply_to) {
            $headers[] = 'Reply-To: ' . $sender_email;
        }
        
        // Add from header
        $headers[] = 'From: ' . $sender_email;
        
        $result = wp_mail($recipient_email, $subject, $content, $headers);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => __('Email sent successfully via SMTP.', 'find-my-rep')
            );
        } else {
            return array(
                'success' => false,
                'message' => __('Failed to send email via SMTP.', 'find-my-rep')
            );
        }
    }
    
    /**
     * Send email via test transport (logs to file instead of sending)
     *
     * @param string $sender_email      Sender's email address
     * @param string $recipient_email   Representative's email address
     * @param string $subject           Email subject
     * @param string $content           Email content
     * @return array Array with 'success' (bool) and 'message' (string) keys
     */
    private function send_via_test($sender_email, $recipient_email, $subject, $content) {
        $upload_dir = wp_upload_dir();
        $log_file = $upload_dir['basedir'] . '/find-my-rep-test-mails.log';
        
        // Ensure uploads directory exists and is writable
        if (!file_exists($upload_dir['basedir'])) {
            return array(
                'success' => false,
                'message' => __('Uploads directory does not exist.', 'find-my-rep')
            );
        }
        
        if (!is_writable($upload_dir['basedir'])) {
            return array(
                'success' => false,
                'message' => __('Uploads directory is not writable.', 'find-my-rep')
            );
        }
        
        // Format email data
        $timestamp = current_time('mysql');
        $log_entry = sprintf(
            "[%s]\nFrom: %s\nTo: %s\nSubject: %s\n\n%s\n\n%s\n\n",
            $timestamp,
            $sender_email,
            $recipient_email,
            $subject,
            $content,
            str_repeat('-', 80)
        );
        
        // Append to log file
        $result = file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
        
        if ($result !== false) {
            return array(
                'success' => true,
                'message' => sprintf(__('Email logged to test file: %s', 'find-my-rep'), $log_file)
            );
        } else {
            return array(
                'success' => false,
                'message' => __('Failed to write to test log file.', 'find-my-rep')
            );
        }
    }
    
    /**
     * Get current transport mode
     *
     * @return string
     */
    public function get_transport() {
        return $this->transport;
    }
}
