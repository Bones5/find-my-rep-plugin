<?php
/**
 * Tests for plugin-owned test postcode configuration.
 *
 * @package FindMyRep
 */

use PHPUnit\Framework\TestCase;

class TestPostcodeRecipientEmailsTest extends TestCase {
    private $plugin;

    protected function setUp(): void {
        parent::setUp();

        global $test_options;
        $test_options = array();
        $this->plugin = new Find_My_Rep_Plugin();
    }

    public function test_sanitize_test_postcode_normalizes_case_and_spacing() {
        $this->assertSame('ZZ999ZZ', $this->plugin->sanitize_test_postcode(' zz99 9zz '));
    }

    public function test_test_postcode_response_is_built_from_rep_type_email_settings() {
        global $test_options;
        $test_options['find_my_rep_test_postcode'] = 'ZZ999ZZ';
        $test_options['find_my_rep_test_mp_email'] = 'mp@example.com';
        $test_options['find_my_rep_test_ms_email'] = 'ms@example.com';
        $test_options['find_my_rep_test_pcc_email'] = 'pcc@example.com';
        $test_options['find_my_rep_test_councillor_email'] = 'councillor@example.com';

        $method = new ReflectionMethod(Find_My_Rep_Plugin::class, 'get_test_postcode_response');
        $method->setAccessible(true);
        $data = $method->invoke($this->plugin, 'zz99 9zz');

        $this->assertSame('mp@example.com', $data['mp']['email']);
        $this->assertSame('Test MP', $data['mp']['name']);
        $this->assertSame('Test Constituency', $data['mp']['constituency']);
        $this->assertSame('ms@example.com', $data['mss'][0]['email']);
        $this->assertSame('Test Senedd Constituency', $data['mss'][0]['constituency']);
        $this->assertSame('pcc@example.com', $data['pcc']['email']);
        $this->assertSame('Test Police Force', $data['pcc']['force']);
        $this->assertSame('councillor@example.com', $data['councillors'][0]['email']);
        $this->assertSame('Test Ward', $data['councillors'][0]['ward']);
        $this->assertSame('TEST-COUNCIL', $data['areaInfo']['localAuthority']['code']);
    }

    public function test_blank_email_omits_that_representative_type() {
        global $test_options;
        $test_options['find_my_rep_test_postcode'] = 'ZZ999ZZ';
        $test_options['find_my_rep_test_mp_email'] = 'mp@example.com';
        $test_options['find_my_rep_test_ms_email'] = '';
        $test_options['find_my_rep_test_pcc_email'] = '';
        $test_options['find_my_rep_test_councillor_email'] = '';

        $method = new ReflectionMethod(Find_My_Rep_Plugin::class, 'get_test_postcode_response');
        $method->setAccessible(true);
        $data = $method->invoke($this->plugin, 'ZZ999ZZ');

        $this->assertNotNull($data['mp']);
        $this->assertSame(array(), $data['mss']);
        $this->assertNull($data['pcc']);
        $this->assertSame(array(), $data['councillors']);
    }

    public function test_configured_test_postcode_bypasses_api_lookup() {
        global $test_options, $test_wp_remote_get_calls;
        $test_options['find_my_rep_test_postcode'] = 'ZZ999ZZ';
        $test_options['find_my_rep_test_mp_email'] = 'mp@example.com';
        $test_wp_remote_get_calls = array();

        $method = new ReflectionMethod(Find_My_Rep_Plugin::class, 'get_representatives_for_postcode');
        $method->setAccessible(true);
        $result = $method->invoke($this->plugin, 'ZZ99 9ZZ');

        $this->assertTrue($result['success']);
        $this->assertSame('mp@example.com', $result['data']['mp']['email']);
        $this->assertSame(array(), $test_wp_remote_get_calls);
    }
}