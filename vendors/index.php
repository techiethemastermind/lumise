<?php
/*
Name: Vendors 
Description: Intergration with Dokan e-commerce marketplace, including launcher pad for vendors
Version: 1.0
Compatible: 1.7.5
Platform: woocommerce
*/

class lumise_addon_vendors extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		$this->active_launcher = $lumise->get_option('active_launcher', '1');
	
		$lumise->add_action('ajax', array($this, 'ajax'));
		$lumise->add_action('addon-ajax', array($this, 'ajax_action'));
		
		$lumise->add_filter('capabilities', array($this, 'capabilities'), 11);
		$lumise->add_filter('new-section', array($this, 'new_design'), 11);
		
		$lumise->add_filter('process-section-products', array($this, 'insert_product_fields'));
		$lumise->add_action('process-fields', array($this, 'process_fields'));
		
		if ($this->active_launcher == '1') {
			add_shortcode( 'lumise_launcher', array($this, 'shortcode'));
		}
		
		add_action( 'admin_notices', array($this, 'notices') );
		add_action( 'wp_enqueue_scripts', array($this, 'enqueue_scripts') );
		
		include( dirname(__FILE__).DS.'includes'.DS.'actions.php' );
		
	}
	
	public function enqueue_scripts() {
		if (!is_admin()) {
			wp_enqueue_style( 'lumise-addon-vendors-icons', esc_url($this->get_url().'/assets/css/icons/styles.css?version='.LUMISE) );
			wp_enqueue_style( 'lumise-addon-vendors-launcher', esc_url($this->get_url().'/assets/css/launcher.css?version='.LUMISE) );
			wp_enqueue_style( 'lumise-addon-vendors-launcher', esc_url($this->get_url().'/assets/css/launcher.css?version='.LUMISE) );
			wp_enqueue_style( 'lumise-addon-vendors', esc_url($this->get_url().'/assets/css/style.css?version='.LUMISE) );
		}
	}
	
	public function notices() {
		
		global $lumise;
		
		$key = $lumise->get_option('purchase_key');
		$key_valid = ($key === null || empty($key) || strlen($key) != 36 || count(explode('-', $key)) != 5) ? false : true;
	
		if ($key_valid) {
			echo '<div class="wp-notice error" style="margin: 15px 0"><p>'.$lumise->lang('You\'ve installed addon Vendors for Lumise, but you have not verified the license yet').'. <a href="'.admin_url('?page=lumise&lumise-page=license').'">'.$lumise->lang('Enter your license now').'</a></p></div>';
		}
	}
	
	public function settings() {
		
		global $lumise;
		
		return array(
			array(
				'type' => 'toggle',
				'name' => 'active_launcher',
				'desc' => $lumise->lang('Activate the design launcher, use the shortcode [lumise_launcher] in your custom page').'<br><br>'.$lumise->lang('Design Launcher is the launcher pad for vendors can upload their .PNG design quickly').'<br><br>'.$lumise->lang('If you got the error 404 on launcher page, go to settings -> permarlinks and save it'),
				'label' => 'Design launcher',
				'default' => 'yes'
			)
		);
		
	}
	
	public function ajax() {
		
		global $lumise;
		
		if (
			$lumise->esc('action') == 'templates' &&
			$lumise->esc('ajax') == 'backend' &&
			!is_admin()
		) {
			$uid = (string)get_current_user_id();
			$lumise->set_vendor($uid);
		}
	}
	
	public function ajax_action() {
		
		if (
			isset($_POST['component']) && 
			$_POST['component'] == 'upload-design' && 
			count(array_keys($_FILES)) > 0
		) {
			
			global $lumise; 
		
			$path = $lumise->cfg->upload_path.'user_data'.DS;
			$time = time();
			$result = array();
			$check = $lumise->check_upload($time);
		
			if ($check !== 1) {
				echo '{"error": "'.$check.'"}';
				exit;
			}
			
			foreach ($_FILES as $name => $file) {
				$file_name = date('Y', $time).DS.date('m', $time).DS.$lumise->generate_id().'.txt';
				if (move_uploaded_file($file["tmp_name"], $path.$file_name)) {
					$result[$name] = $file_name;
				}
			}
			
			if (
				count(array_keys($result)) === count(array_keys($_FILES))
			)
				echo '{"success": "'.urlencode(json_encode($result)).'"}';
			else 
				echo '{"error": "could not upload"}';
			
		};
		
		if (
			$this->active_launcher == '1' &&
			isset($_POST['addon']) &&
			$_POST['addon'] == 'vendors' &&
			isset($_POST['launcher_fn'])
		) {
			include(dirname(__FILE__).DS.'includes'.DS.'launcher.php');
			global $launcher;
			if( is_callable(array(&$launcher, 'ajax_'.$_POST['launcher_fn'])))
				return call_user_func(array(&$launcher, 'ajax_'.$_POST['launcher_fn']));
		}
	
	}
	
	public function new_design($data, $name) {
		
		if ($name == 'templates') {
			$data['author'] = get_current_user_id();
		}
		
		return $data;
	}
	
	public function insert_product_fields($args) {
		
		global $lumise;
		
		$id = isset($_GET['id']) ? $_GET['id'] : 0;
		$p = $lumise->db->rawQuery("SELECT `price` FROM {$lumise->db->prefix}products WHERE `id` = ".$id);
		$price = 0;
		
		if (count($p) > 0)
			$price = $p[0]['price'];
			
		$field = array(
			'type' => 'trace',
			'name' => 'price',
			'label' => $lumise->lang('Price Base'),
			'default' => '10',
			'content' => '<input type="text" value="'.$price.'" name="price_base" />',
			'desc' => $lumise->lang('Use for Design Launcher (it will be calculated with the vendor\'s price)')
		);
		
		if (isset($args['tabs'])) {
			array_splice($args['tabs'][array_keys($args['tabs'])[0]], 1, 0, array($field));
		} else {
			array_splice($args[array_keys($args)[0]], 1, 0, array($field));
		}
		
		return $args;
	}
	
	public function process_fields($section, $id) {
		
		global $lumise;
		
		if ($section == 'product') {
			$lumise->lib->edit_row($id, array(
				"price" => (Float)$_POST['price_base']
			), 'products');	
		}
		
	}
	
	public function shortcode() {
		
		ob_start();
		include(dirname(__FILE__).DS.'view'.DS.'launcher.php');
		$content = ob_get_contents();
		ob_end_clean();
		return $content;
	}
		
	static function active() {
		
		@flush_rewrite_rules();
		
	}
	
}