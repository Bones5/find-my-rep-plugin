<?php
/**
 * Tests for the send-letter AJAX handler.
 *
 * @package FindMyRep
 */

use PHPUnit\Framework\TestCase;

class AjaxSendLetterTest extends TestCase {
    protected function setUp(): void {
        parent::setUp();

        global $test_json_response, $test_options, $test_transients, $test_upload_dir;
        $test_json_response = null;
        $test_transients = array();
        $test_upload_dir = sys_get_temp_dir() . '/wp-uploads-test-' . uniqid();
        $test_options = array(
            'find_my_rep_email_transport' => 'test',
            'find_my_rep_test_postcode' => 'ZZ999ZZ',
            'find_my_rep_test_mp_email' => 'mp@example.com',
        );
        $_POST = array();
        $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    }

    protected function tearDown(): void {
        global $test_upload_dir;

        if (isset($test_upload_dir) && file_exists($test_upload_dir)) {
            foreach (glob($test_upload_dir . '/*') as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
            rmdir($test_upload_dir);
        }

        $_POST = array();
        parent::tearDown();
    }

    public function test_welsh_apostrophes_are_unslashed_before_sending(): void {
        $plugin = new Find_My_Rep_Plugin();
        $block_id = 'welsh-letter-block';
        $types = array('MP');
        $sign_method = new ReflectionMethod($plugin, 'sign_representative_types');
        $sign_method->setAccessible(true);

        $_POST = array(
            'sender_name' => 'Test User',
            'sender_email' => 'test@example.com',
            'sender_address' => "1 Stryd y Bont\nCaerdydd",
            'subject' => 'Neges Gymraeg',
            'letter_content' => "Annwyl {{representative_name}},\n\nMae\\'n bwysig gweithredu.",
            'question_response' => '',
            'postcode' => 'ZZ99 9ZZ',
            'website_url' => '',
            'representatives' => addslashes(wp_json_encode(array(array('type' => 'MP', 'id' => 90001)))),
            'representative_types' => addslashes(wp_json_encode($types)),
            'representative_types_signature' => $sign_method->invoke($plugin, $types, $block_id),
            'block_id' => $block_id,
        );

        $plugin->ajax_send_letter();

        global $test_json_response, $test_upload_dir;
        $this->assertTrue($test_json_response['success']);

        $mail = file_get_contents($test_upload_dir . '/find-my-rep-test-mails.log');
        $this->assertStringContainsString("Mae'n bwysig gweithredu.", $mail);
        $this->assertStringNotContainsString("Mae\\'n bwysig gweithredu.", $mail);
    }
}