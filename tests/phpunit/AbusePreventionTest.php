<?php
/**
 * Tests for abuse prevention safeguards in Find_My_Rep_Plugin
 *
 * @package FindMyRep
 */

use PHPUnit\Framework\TestCase;

class AbusePreventionTest extends TestCase {
    /**
     * Plugin instance
     *
     * @var Find_My_Rep_Plugin
     */
    private $plugin;
    
    /**
     * Reflection helper
     *
     * @var ReflectionClass
     */
    private $reflection;
    
    protected function setUp(): void {
        parent::setUp();
        
        global $test_transients, $test_wp_remote_get_response, $test_wp_remote_get_calls;
        $test_transients = array();
        $test_wp_remote_get_response = null;
        $test_wp_remote_get_calls = array();
        $_POST = array();
        
        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        $this->plugin = new Find_My_Rep_Plugin();
        $this->reflection = new ReflectionClass($this->plugin);
    }
    
    public function test_validate_letter_request_rejects_abusive_language() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);
        
        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'You should go die for this decision.',
            ''
        );
        
        $this->assertSame(
            'Please remove abusive or threatening language before sending your message.',
            $result
        );
    }
    
    public function test_validate_letter_request_rejects_excessive_links() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);
        
        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please read https://example.com/one https://example.com/two https://example.com/three',
            ''
        );
        
        $this->assertSame(
            'Please remove excessive links before sending your message.',
            $result
        );
    }

    public function test_validate_letter_request_rejects_filled_honeypot() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please support this issue.',
            'http://spam.example.com'
        );

        $this->assertSame(
            'Spam detected.',
            $result
        );
    }

    public function test_validate_letter_request_rejects_abusive_sender_email() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'fuck@example.com',
            'Please support this issue.',
            ''
        );

        $this->assertSame(
            'Please remove abusive or threatening language before sending your message.',
            $result
        );
    }

    public function test_validate_letter_request_passes_with_empty_honeypot() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please support this issue.',
            ''
        );

        $this->assertSame('', $result);
    }

    public function test_validate_letter_request_allows_empty_question_response() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please support this issue.',
            '',
            ''
        );

        $this->assertSame('', $result);
    }

    public function test_validate_letter_request_rejects_abusive_question_response() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please support this issue.',
            '',
            'You should go die.'
        );

        $this->assertSame(
            'Please remove abusive or threatening language before sending your message.',
            $result
        );
    }
    
    public function test_is_rate_limited_blocks_after_three_attempts() {
        $method = $this->reflection->getMethod('is_rate_limited');
        $method->setAccessible(true);
        
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertTrue($method->invoke($this->plugin, 'test@example.com'));
    }

    public function test_is_rate_limited_uses_email_consistently_across_ip_changes() {
        $method = $this->reflection->getMethod('is_rate_limited');
        $method->setAccessible(true);

        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));

        $_SERVER['REMOTE_ADDR'] = '10.0.0.5';
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));

        $_SERVER['REMOTE_ADDR'] = '192.168.0.10';
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));

        $_SERVER['REMOTE_ADDR'] = '203.0.113.8';
        $this->assertTrue($method->invoke($this->plugin, 'test@example.com'));
    }

    public function test_get_representatives_for_postcode_uses_cached_lookup() {
        global $test_wp_remote_get_response, $test_wp_remote_get_calls;

        $test_wp_remote_get_response = array(
            'body' => json_encode(array(
                'postcode' => 'CF10 1AA',
                'mp' => array(
                    'id' => 1,
                    'name' => 'Jane Representative',
                    'email' => 'jane.official@example.org',
                    'party' => 'Test Party',
                    'constituency' => 'Cardiff Test',
                ),
            )),
            'response' => array('code' => 200),
        );

        $method = $this->reflection->getMethod('get_representatives_for_postcode');
        $method->setAccessible(true);

        $first_result = $method->invoke($this->plugin, 'CF10 1AA');
        $second_result = $method->invoke($this->plugin, 'CF10 1AA');

        $this->assertTrue($first_result['success']);
        $this->assertTrue($second_result['success']);
        $this->assertCount(1, $test_wp_remote_get_calls);
    }

    public function test_configured_representatives_include_only_selected_types() {
        global $test_wp_remote_get_response;

        $test_wp_remote_get_response = array(
            'body' => json_encode(array(
                'postcode' => 'CF10 1AA',
                'mp' => array(
                    'id' => 1,
                    'name' => 'Jane MP',
                    'email' => 'mp@example.org',
                ),
                'mss' => array(
                    array(
                        'id' => 2,
                        'name' => 'Morgan MS',
                        'email' => 'ms@example.org',
                    ),
                ),
            )),
            'response' => array('code' => 200),
        );

        $method = $this->reflection->getMethod('get_configured_representatives');
        $method->setAccessible(true);
        $result = $method->invoke($this->plugin, 'CF10 1AA', array('MS'));

        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['representatives']);
        $this->assertSame('MS', $result['representatives'][0]['type']);
        $this->assertSame('ms@example.org', $result['representatives'][0]['email']);
    }

    public function test_submitted_representative_types_reject_tampered_configuration() {
        $_POST['representative_types'] = json_encode(array('MP', 'PCC'));
        $_POST['representative_types_signature'] = 'invalid-signature';
        $_POST['block_id'] = 'test-block';

        $method = $this->reflection->getMethod('get_submitted_representative_types');
        $method->setAccessible(true);
        $result = $method->invoke($this->plugin);

        $this->assertFalse($result['success']);
        $this->assertSame(
            'The configured representatives could not be verified. Please reload the page and try again.',
            $result['message']
        );
    }

    public function test_submitted_representative_types_accept_valid_signature() {
        $types = array('MP', 'Councillor');
        $block_id = 'test-block';
        $sign_method = $this->reflection->getMethod('sign_representative_types');
        $sign_method->setAccessible(true);

        $_POST['representative_types'] = json_encode($types);
        $_POST['representative_types_signature'] = $sign_method->invoke($this->plugin, $types, $block_id);
        $_POST['block_id'] = $block_id;

        $method = $this->reflection->getMethod('get_submitted_representative_types');
        $method->setAccessible(true);
        $result = $method->invoke($this->plugin);

        $this->assertTrue($result['success']);
        $this->assertSame($types, $result['types']);
    }
}
