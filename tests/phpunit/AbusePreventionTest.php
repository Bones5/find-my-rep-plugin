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
        
        global $test_transients;
        $test_transients = array();
        
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
            '1'
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
            '1'
        );
        
        $this->assertSame(
            'Please remove excessive links before sending your message.',
            $result
        );
    }

    public function test_validate_letter_request_requires_robot_confirmation() {
        $method = $this->reflection->getMethod('validate_letter_request');
        $method->setAccessible(true);

        $result = $method->invoke(
            $this->plugin,
            'Test User',
            'test@example.com',
            'Please support this issue.',
            '0'
        );

        $this->assertSame(
            'Please confirm you are not a robot before sending.',
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
}
