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
        
        global $test_transients, $test_wp_remote_get_response;
        $test_transients = array();
        $test_wp_remote_get_response = null;
        
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
    
    public function test_is_rate_limited_blocks_after_three_attempts() {
        $method = $this->reflection->getMethod('is_rate_limited');
        $method->setAccessible(true);
        
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertFalse($method->invoke($this->plugin, 'test@example.com'));
        $this->assertTrue($method->invoke($this->plugin, 'test@example.com'));
    }

    public function test_verified_representatives_use_authoritative_server_email() {
        global $test_wp_remote_get_response;

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

        $method = $this->reflection->getMethod('get_verified_representatives');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'CF10 1AA',
            array(
                array(
                    'type' => 'MP',
                    'id' => 1,
                    'name' => 'Jane Representative',
                    'email' => 'attacker@example.com',
                ),
            )
        );

        $this->assertTrue($result['success']);
        $this->assertSame('jane.official@example.org', $result['representatives'][0]['email']);
    }

    public function test_verified_representatives_reject_tampered_selection() {
        global $test_wp_remote_get_response;

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

        $method = $this->reflection->getMethod('get_verified_representatives');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'CF10 1AA',
            array(
                array(
                    'type' => 'MP',
                    'id' => 999,
                    'name' => 'Injected Recipient',
                    'email' => 'attacker@example.com',
                ),
            )
        );

        $this->assertFalse($result['success']);
        $this->assertSame(
            'Selected representatives could not be verified. Please search by postcode again and try again.',
            $result['message']
        );
    }
}
