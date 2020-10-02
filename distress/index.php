<?php
/*
Name: Distress Effect
Description: Distress effect addon, make a mask over content design
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_distress extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_distress');
		
		/*
		*	Add new component, show in left menu of editor and can config in Lumise -> Settings -> Editor
		*/
		
		$this->add_component(array(
			"distress" => array(
				"label" => "Distress",
				"icon" => "lumisex-erlenmeyer-flask-bubbles",
				"load" => "distress",
				"class" => "lumise-x-thumbn",
				"content" => $this->render_xitems(array(
					"component" => "distress",
					"search" => false,
					"category" => false,
					"preview" => false,
					"price" => true
				))
			)
		));
		
		/*
		*	Add new left menu in backend	
		*/
		
		$lumise->add_filter('admin_menus', array(&$this, 'admin_menus'));
		
		/*
		*	Display Lumise page in backend
		*/
		
		$lumise->add_filter('admin_page', array(&$this, 'admin_page'));
		
		/*
		*	Register new folder uploads
		*/
		
		$lumise->add_filter('upload_folders', array(&$this, 'upload_folders'));
		
		/*
		*	Insert your code like css, js into header or footer
		*/
		
		$lumise->add_action('editor-header', array(&$this, 'editor_header'));
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		
		/*
		*	Action ajax
		*/
		
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
		
		/*
		*	Add role for manage component Backgrounds (Wordpress Platform)
		*/
		
		if ($lumise->connector->platform == 'woocommerce') {
			$role = get_role('administrator');
			$role->add_cap('lumise_read_distressings');
			$role->add_cap('lumise_edit_distressings');
			//hash : 16c5d76e6fcc163644405bd320b9c01f
			$role->add_cap('lumise_edit_distresss');
		}
		
	}
	
	public function admin_menus($args) {
		
		global $lumise;
		
		$position = 4;
		
		$new_menu = array(
			"distressings" => array(
				'title' => $lumise->lang('Distressing'),
				'icon'  => '<i class="fa fa-magic"></i>',
				'child' => array(
					'distressings'   => array(
						'type'   => '',
						'title'  => $lumise->lang('All Distresses'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=distressings',
						'hidden' => false,
					),
					'distressing' => array(
						'type'   => '',
						'title'  => $lumise->lang('Add New Distress'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=distressing',
						'hidden' => false,
					)
				),
				'capability' => 'lumise_read_distressings'
			)
		);
		
		return array_slice($args, 0, $position, true) + 
			   $new_menu + 
			   array_slice($args, $position, count($args) - 1, true);
			   
	}
	
	public function admin_page($path, $page) {
		
		if ($page == 'distressing')
			return dirname(__FILE__).DS.'distressing.php';
		else if ($page == 'distressings')
			return dirname(__FILE__).DS.'distressings.php';
		else return $path;
		
	}
	
	public function upload_folders($args) {
		array_push($args, 'distress');
		return $args;
	}
	
	public function editor_header() {
		
	}
	
	public function editor_footer() {
		
		if (!$this->is_backend()) 
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/distress.js?ver=1').'"></script>';
		
	}
	
	public function ajax_action($comp) {
		
		global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'distress') {
			$lumise->lib->x_items('distress');
		}
	}
	
	/*
		Actions on active or deactive this addon
	*/
	
	static function active() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (!in_array('distress', $comps))
			array_push($comps, 'distress');
		
		$lumise->set_option('components', implode(',', $comps));
		
		$lumise->db->rawQuery("CREATE TABLE  IF NOT EXISTS `".$lumise->db->prefix."distress` (
			`id` int(11) NOT NULL,
			`name` varchar(255) CHARACTER SET utf8 NOT NULL,
			`upload` text CHARACTER SET utf8,
			`thumbnail_url` text CHARACTER SET utf8,
			`price` float DEFAULT '0',
			`featured` int(1) DEFAULT NULL,
			`active` int(1) DEFAULT NULL,
			`author` int(11) DEFAULT NULL,
			`order` int(1) DEFAULT NULL,
			`tags` varchar(255) CHARACTER SET utf8 NOT NULL,
			`use_count` int(11) DEFAULT NULL,
			`created` datetime DEFAULT NULL,
			`updated` datetime DEFAULT NULL
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;");
		
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."distress` ADD PRIMARY KEY (`id`);");
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."distress` CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT;");
		
	}
	
	static function deactive() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (in_array('distress', $comps))
			unset($comps[array_search('distress', $comps)]);
		
		$lumise->set_option('components', implode(',', $comps));
		
	}
	
}