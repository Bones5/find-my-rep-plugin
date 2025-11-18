<?php
/**
 * Tests for Find_My_Rep_Email_Service class
 *
 * @package FindMyRep
 */

use PHPUnit\Framework\TestCase;

/**
 * Email Service Test Case
 */
class EmailServiceTest extends TestCase {
    
    /**
     * Test instance
     *
     * @var Find_My_Rep_Email_Service
     */
    private $service;
    
    /**
     * Set up test
     */
    protected function setUp(): void {
        parent::setUp();
        $this->service = new Find_My_Rep_Email_Service('test');
        
        // Reset global test variables
        global $test_options, $test_wp_remote_response, $test_wp_mail_calls, $test_upload_dir;
        $test_options = array();
        $test_wp_remote_response = null;
        $test_wp_mail_calls = array();
        $test_upload_dir = sys_get_temp_dir() . '/wp-uploads-test-' . uniqid();
    }
    
    /**
     * Tear down test
     */
    protected function tearDown(): void {
        parent::tearDown();
        
        // Clean up test upload directory
        global $test_upload_dir;
        if (isset($test_upload_dir) && file_exists($test_upload_dir)) {
            $files = glob($test_upload_dir . '/*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
            rmdir($test_upload_dir);
        }
    }
    
    /**
     * Test render_template replaces placeholders correctly
     */
    public function test_render_template_replaces_placeholders() {
        $template = 'Dear {{representative_name}}, You are the {{representative_title}}.';
        $placeholders = array(
            '{{representative_name}}' => 'John Smith',
            '{{representative_title}}' => 'Member of Parliament',
        );
        
        $result = $this->service->render_template($template, $placeholders);
        
        $this->assertEquals('Dear John Smith, You are the Member of Parliament.', $result);
    }
    
    /**
     * Test render_template handles multiple occurrences of same placeholder
     */
    public function test_render_template_handles_multiple_occurrences() {
        $template = '{{representative_name}} is great. I like {{representative_name}}.';
        $placeholders = array(
            '{{representative_name}}' => 'Jane Doe',
        );
        
        $result = $this->service->render_template($template, $placeholders);
        
        $this->assertEquals('Jane Doe is great. I like Jane Doe.', $result);
    }
    
    /**
     * Test render_template uses empty string for missing title
     */
    public function test_render_template_missing_title() {
        $template = 'Dear {{representative_name}}, {{representative_title}}';
        $placeholders = array(
            '{{representative_name}}' => 'John Smith',
            // title is not provided
        );
        
        $result = $this->service->render_template($template, $placeholders);
        
        $this->assertEquals('Dear John Smith, ', $result);
    }
    
    /**
     * Test render_template ignores unknown placeholders
     */
    public function test_render_template_unknown_placeholder() {
        $template = 'Dear {{representative_name}}, {{unknown_placeholder}}';
        $placeholders = array(
            '{{representative_name}}' => 'John Smith',
        );
        
        $result = $this->service->render_template($template, $placeholders);
        
        $this->assertEquals('Dear John Smith, {{unknown_placeholder}}', $result);
    }
    
    /**
     * Test send_letter with test transport logs to file
     */
    public function test_send_letter_test_transport() {
        $result = $this->service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertTrue($result['success']);
        $this->assertStringContainsString('logged to test file', $result['message']);
        
        // Verify log file was created
        global $test_upload_dir;
        $log_file = $test_upload_dir . '/find-my-rep-test-mails.log';
        $this->assertFileExists($log_file);
        
        // Verify log content
        $log_content = file_get_contents($log_file);
        $this->assertStringContainsString('From: sender@example.com', $log_content);
        $this->assertStringContainsString('To: recipient@example.com', $log_content);
        $this->assertStringContainsString('Subject: Test Subject', $log_content);
        $this->assertStringContainsString('Test content', $log_content);
    }
    
    /**
     * Test send_letter with resend transport fails when API key is missing
     */
    public function test_send_letter_resend_missing_api_key() {
        $service = new Find_My_Rep_Email_Service('resend');
        
        global $test_options;
        $test_options['find_my_rep_resend_api_key'] = '';
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('API key not configured', $result['message']);
    }
    
    /**
     * Test send_letter with resend transport handles successful response
     */
    public function test_send_letter_resend_success() {
        $service = new Find_My_Rep_Email_Service('resend');
        
        global $test_options, $test_wp_remote_response;
        $test_options['find_my_rep_resend_api_key'] = 'test_api_key';
        $test_wp_remote_response = array(
            'response' => array('code' => 200),
            'body' => '{"id":"test-email-id"}'
        );
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertTrue($result['success']);
        $this->assertStringContainsString('sent successfully', $result['message']);
    }
    
    /**
     * Test send_letter with resend transport handles non-200 response
     */
    public function test_send_letter_resend_non_200_response() {
        $service = new Find_My_Rep_Email_Service('resend');
        
        global $test_options, $test_wp_remote_response;
        $test_options['find_my_rep_resend_api_key'] = 'test_api_key';
        $test_wp_remote_response = array(
            'response' => array('code' => 400),
            'body' => '{"error":"Invalid request"}'
        );
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('400', $result['message']);
    }
    
    /**
     * Test send_letter with resend transport handles WP_Error
     */
    public function test_send_letter_resend_wp_error() {
        $service = new Find_My_Rep_Email_Service('resend');
        
        global $test_options, $test_wp_remote_response;
        $test_options['find_my_rep_resend_api_key'] = 'test_api_key';
        $test_wp_remote_response = new WP_Error('Network error');
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Network error', $result['message']);
    }
    
    /**
     * Test send_letter with smtp transport
     */
    public function test_send_letter_smtp_transport() {
        $service = new Find_My_Rep_Email_Service('smtp');
        
        global $test_wp_mail_calls;
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertTrue($result['success']);
        $this->assertStringContainsString('SMTP', $result['message']);
        
        // Verify wp_mail was called
        $this->assertCount(1, $test_wp_mail_calls);
        $call = $test_wp_mail_calls[0];
        $this->assertEquals('recipient@example.com', $call['to']);
        $this->assertEquals('Test Subject', $call['subject']);
        $this->assertEquals('Test content', $call['message']);
        
        // Check headers contain Reply-To and From
        $headers_string = is_array($call['headers']) ? implode("\n", $call['headers']) : $call['headers'];
        $this->assertStringContainsString('Reply-To: sender@example.com', $headers_string);
        $this->assertStringContainsString('From: sender@example.com', $headers_string);
    }
    
    /**
     * Test get_transport returns correct transport
     */
    public function test_get_transport() {
        $service_resend = new Find_My_Rep_Email_Service('resend');
        $this->assertEquals('resend', $service_resend->get_transport());
        
        $service_smtp = new Find_My_Rep_Email_Service('smtp');
        $this->assertEquals('smtp', $service_smtp->get_transport());
        
        $service_test = new Find_My_Rep_Email_Service('test');
        $this->assertEquals('test', $service_test->get_transport());
    }
    
    /**
     * Test send_letter with unknown transport
     */
    public function test_send_letter_unknown_transport() {
        $service = new Find_My_Rep_Email_Service('unknown');
        
        $result = $service->send_letter(
            'sender@example.com',
            'recipient@example.com',
            'Test Subject',
            'Test content'
        );
        
        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Unknown transport mode', $result['message']);
    }
}
