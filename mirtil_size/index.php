<?php
/*
Name: Mirtil Size
Description: Redesign Dashboard, Add addtional Features for only for Mirtil.com
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_mirtil_size extends lumise_addons {

    function __construct() {
		
        global $lumise;

        $this->access_corejs('lumise_addon_mirtilsize');

        $this->add_component(
            array(
                "mirtilsize" => array(
                    "label" => "Size",
                    "icon" => "lumisex-size",
                    "load" => "mirtilsize",
                    "class" => "lumise-x-thumbn",
                    "content" => $this->render_xitems(
                        array(
                            "component" => "mirtilsize",
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

        if (isset($_POST['component']) && $_POST['component'] == 'get_baseProducts') {
			$lumise_products = $lumise->db->rawQuery(
                "SELECT * FROM `{$lumise->db->prefix}products`"
            );

            $html = '<ul data-view="products" class="smooth">';

            foreach($lumise_products as $product) {
                $html .= '<li data-id="'. $product['id'] .'" data-current="false" data-name="'. $product['name'] .'" data-cms="'. $product['product'] .'">';
                $html .= '<span data-view="thumbn" data-start="Choose product">';
                $html .= '<img style="background:#transp" src="'. $product['thumbnail_url'] .'">';
                $html .= '</span>';
                $html .= '<span data-view="name">'. $product['name'] .'</span>';
                $html .= '<span data-view="price">'.$product['price'].'</span></li>';
            }

            $html .= '</ul>';

            echo $html;
		}
    }

    public function editor_header() {
        // Loading CSS in Editor Header
		if (!$this->is_backend()) {	
			echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/mirtilsize.css?ver=1').'" type="text/css" media="all" />';
        }
    }
    
    public function editor_footer() {
        // Loading JavaScript in Editor Footer	
		if (!$this->is_backend()) {
            echo '<script type="text/javascript" src="'.$this->get_url('assets/js/mirtilsize.js?ver=1').'"></script>';
        }
        
        // URL parsing for custom tab active
        if(isset($_GET['tab'])) {
            echo '<script>window.tab = "' . $_GET['tab'] . '"; </script>';
        }

        if(isset($_GET['cat'])) {
            echo '<script>window.cat = "' . $_GET['cat'] . '"; </script>';
        }

        if(isset($_GET['printing_id'])) {
            echo '<script>window.printing_id = "' . $_GET['printing_id'] . '"; </script>';
        }

        if(isset($_GET['type'])) {
            echo '<script>window.printing_price = "' . $_GET['type'] . '"; </script>';
        }

        if(isset($_GET['width'])) {
            echo '<script>window.width = "' . $_GET['width'] . '"; </script>';
        }

        if(isset($_GET['height'])) {
            echo '<script>window.height = "' . $_GET['height'] . '"; </script>';
        }

        if(isset($_GET['shape'])) {
            echo '<script>window.shape = "' . $_GET['shape'] . '"; </script>';
        }

        if(isset($_GET['premium'])) {
            echo '<script>window.premium = "' . $_GET['premium'] . '"; </script>';
        }

        if(isset($_GET['bg_color'])) {
            echo '<script>window.bg_color = "' . $_GET['bg_color'] . '"; </script>';
        }

        if(isset($_GET['qty'])) {
            echo '<script>window.qty = "' . $_GET['qty'] . '"; </script>';
        }

        if(isset($_GET['cart'])) {
            echo '<script>window.cart = true; </script>';
        }

        if(isset($_GET['cart'])) {
            echo '<script>window.product_cms = "' . $_GET['product_cms'] . '"; </script>';
        }

        if(isset($_GET['cart'])) {
            echo '<script>window.product_base = "' . $_GET['product_base'] . '"; </script>';
        }
    }

    static function active() {
        global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (!in_array('mirtilsize', $comps))
            array_unshift($comps, 'mirtilsize');
            
        $lumise->set_option('components', implode(',', $comps));
    }

    static function deactive() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (in_array('mirtilsize', $comps))
			unset($comps[array_search('mirtilsize', $comps)]);
		
		$lumise->set_option('components', implode(',', $comps));
	}

}