<?php
/*
Name: Mirtil Products
Description: Base Product Lists
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_mirtil_products extends lumise_addons {

    function __construct() {
		
        global $lumise;

        $this->access_corejs('lumise_addon_mirtil_products');

        $this->add_component(
            array(
                "mirtil_products" => array(
                    "label" => "Product",
                    "icon" => "lumise-icon-screen-smartphone",
                    "load" => "mirtil_products",
                    "class" => "lumise-x-thumbn",
                    "content" => $this->render_xitems(
                        array(
                            "component" => "mirtil_products",
                            "search" => false,
                            "category" => false,
                        )
                    )
                )
            )
        );

        $lumise->add_action('editor-header', array(&$this, 'editor_header'));
        $lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
        
        /*
		*	Action ajax
		*/
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
    }

    public function ajax_action($comp) {

        global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'mirtil_products') {
            var_dump($lumise->lib->get_products());
            exit;
            // echo $lumise->lib->x_items('cliparts');
        }
    }

    public function editor_header() {
        // Loading CSS in Editor Header
		if (!$this->is_backend()) {	
			echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/mirtil_product.css?ver=1').'" type="text/css" media="all" />';
		}
    }
    
    public function editor_footer() {
        // Loading JavaScript in Editor Footer	
        if (!$this->is_backend()) {
            echo '<script type="text/javascript" src="'.$this->get_url('assets/js/mirtil_product.js?ver=1').'"></script>';
        }
    }

    static function active() {
        global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (!in_array('mirtil_products', $comps))
            array_unshift($comps, 'mirtil_products');
            
        $lumise->set_option('components', implode(',', $comps));
    }

    static function deactive() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (in_array('mirtil_products', $comps))
			unset($comps[array_search('mirtil_products', $comps)]);
		
		$lumise->set_option('components', implode(',', $comps));
	}

}