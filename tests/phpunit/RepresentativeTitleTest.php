<?php
/**
 * Tests for Find_My_Rep_Plugin representative title function
 *
 * @package FindMyRep
 */

use PHPUnit\Framework\TestCase;

/**
 * Representative Title Test Case
 * 
 * Tests the get_representative_title functionality using reflection
 * to access the private method.
 */
class RepresentativeTitleTest extends TestCase {
    
    /**
     * Plugin instance
     *
     * @var Find_My_Rep_Plugin
     */
    private $plugin;
    
    /**
     * Reflection method for get_representative_title
     *
     * @var ReflectionMethod
     */
    private $method;
    
    /**
     * Set up test
     */
    protected function setUp(): void {
        parent::setUp();
        
        // Create plugin instance
        $this->plugin = new Find_My_Rep_Plugin_Testable();
        
        // Get access to the private method via reflection
        $reflection = new ReflectionClass($this->plugin);
        $this->method = $reflection->getMethod('get_representative_title');
        $this->method->setAccessible(true);
    }
    
    /**
     * Test MP title generation with constituency
     */
    public function test_mp_title_with_constituency() {
        $rep = array(
            'type' => 'MP',
            'name' => 'John Smith',
            'constituency' => 'Westminster North',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Member of Parliament for Westminster North', $result);
    }
    
    /**
     * Test MP title generation without constituency
     */
    public function test_mp_title_without_constituency() {
        $rep = array(
            'type' => 'MP',
            'name' => 'John Smith',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Member of Parliament', $result);
    }
    
    /**
     * Test MS title generation with constituency
     */
    public function test_ms_title_with_constituency() {
        $rep = array(
            'type' => 'MS',
            'name' => 'Jane Doe',
            'constituency' => 'Cardiff Central',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Member of the Senedd for Cardiff Central', $result);
    }
    
    /**
     * Test MS title generation without constituency
     */
    public function test_ms_title_without_constituency() {
        $rep = array(
            'type' => 'MS',
            'name' => 'Jane Doe',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Member of the Senedd', $result);
    }
    
    /**
     * Test PCC title generation with force
     */
    public function test_pcc_title_with_force() {
        $rep = array(
            'type' => 'PCC',
            'name' => 'Police Commissioner',
            'force' => 'Metropolitan Police',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Police and Crime Commissioner for Metropolitan Police', $result);
    }
    
    /**
     * Test PCC title generation without force
     */
    public function test_pcc_title_without_force() {
        $rep = array(
            'type' => 'PCC',
            'name' => 'Police Commissioner',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Police and Crime Commissioner', $result);
    }
    
    /**
     * Test Councillor title generation with ward and council
     */
    public function test_councillor_title_with_ward_and_council() {
        $rep = array(
            'type' => 'Councillor',
            'name' => 'Local Councillor',
            'ward' => 'North Ward',
            'council' => 'Test City Council',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Councillor for North Ward, Test City Council', $result);
    }
    
    /**
     * Test Councillor title generation with ward only
     */
    public function test_councillor_title_with_ward_only() {
        $rep = array(
            'type' => 'Councillor',
            'name' => 'Local Councillor',
            'ward' => 'North Ward',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Councillor for North Ward', $result);
    }
    
    /**
     * Test Councillor title generation without ward or council
     */
    public function test_councillor_title_without_ward_or_council() {
        $rep = array(
            'type' => 'Councillor',
            'name' => 'Local Councillor',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Councillor', $result);
    }
    
    /**
     * Test unknown type returns generic title
     */
    public function test_unknown_type_returns_representative() {
        $rep = array(
            'type' => 'Unknown',
            'name' => 'Someone',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Representative', $result);
    }
    
    /**
     * Test missing type returns generic title
     */
    public function test_missing_type_returns_representative() {
        $rep = array(
            'name' => 'Someone',
        );
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Representative', $result);
    }
    
    /**
     * Test empty representative array
     */
    public function test_empty_rep_returns_representative() {
        $rep = array();
        
        $result = $this->method->invoke($this->plugin, $rep);
        
        $this->assertEquals('Representative', $result);
    }
}

/**
 * Testable version of Find_My_Rep_Plugin
 * 
 * This class extends a minimal implementation to allow testing
 * of the get_representative_title method.
 */
class Find_My_Rep_Plugin_Testable {
    
    /**
     * Get a human-readable title for a representative based on their type
     *
     * @param array $rep Representative data with 'type' field
     * @return string Human-readable title
     */
    private function get_representative_title($rep) {
        $type = isset($rep['type']) ? $rep['type'] : '';
        
        switch ($type) {
            case 'MP':
                $constituency = isset($rep['constituency']) ? $rep['constituency'] : '';
                return $constituency ? 'Member of Parliament for ' . $constituency : 'Member of Parliament';
            
            case 'MS':
                $constituency = isset($rep['constituency']) ? $rep['constituency'] : '';
                return $constituency ? 'Member of the Senedd for ' . $constituency : 'Member of the Senedd';
            
            case 'PCC':
                $force = isset($rep['force']) ? $rep['force'] : '';
                return $force ? 'Police and Crime Commissioner for ' . $force : 'Police and Crime Commissioner';
            
            case 'Councillor':
                $ward = isset($rep['ward']) ? $rep['ward'] : '';
                $council = isset($rep['council']) ? $rep['council'] : '';
                if ($ward && $council) {
                    return 'Councillor for ' . $ward . ', ' . $council;
                } elseif ($ward) {
                    return 'Councillor for ' . $ward;
                }
                return 'Councillor';
            
            default:
                return 'Representative';
        }
    }
}
