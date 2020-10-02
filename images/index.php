<?php
/*
Name: Images+
Description: Upload & manage images from backend, Setup APIs for free online images
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_images extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_advancedImages');
		
		$lumise->add_filter('editor_menus', array(&$this, 'editor_menus'));
		
		/*
		*	Insert your code like css, js into header and footer
		*/
		
		$lumise->add_action('editor-header', array(&$this, 'editor_header'));
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		
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
		
		
		$lumise->cfg->ex_settings(array(
			'internal_resources' => 'yes',
			'facebook_app' => '',
			'instagram_api' => '',
			'pixabay_api' => '',
			'unsplash_api' => '',
			'ex_activate' => ''
		));
		/*
		*	Action ajax
		*/
		
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
		
		/*
		*	Add role for manage component Backgrounds (Wordpress Platform)
		*/
		
		if ($lumise->connector->platform == 'woocommerce') {
			$role = get_role('administrator');
			$role->add_cap('lumise_read_images');
			$role->add_cap('lumise_edit_images');
		}
				
	}
	
	public function editor_menus($args) {
		
		global $lumise;
		
		$args['uploads']['content'] = (
			($lumise->connector->is_admin() || $lumise->cfg->settings['disable_resources'] != 1) 
			? '<header class="images-from-socials lumise_form_group">
				<button class="active" data-nav="xinternal">
					<i class="lumise-icon-layers"></i>
					<br>
					'.$lumise->lang('Library').'
				</button>
				<button data-nav="internal">
					<i class="lumise-icon-cloud-upload"></i>
					<br>
					'.$lumise->lang('Upload').'
				</button>
				<button data-nav="external">
					<i class="lumise-icon-globe"></i>
					<br>
					'.$lumise->lang('Free').'
				</button>
				<button data-nav="xexternal">
					<i class="lumise-icon-picture"></i>
					<br>
					'.$lumise->lang('Social').'
				</button>
			</header>' : ''
			).
			'<div data-tab="xinternal" class="active">'.
				$this->render_xitems(array(
					"component" => "images",
					"search" => true,
					"category" => true,
					"preview" => true,
					"price" => true
				)).'
			</div>
			<div data-tab="internal">
				<div id="lumise-upload-form">
					<i class="lumise-icon-cloud-upload"></i>
					<span>'.$lumise->lang('Click or drop images here').'</span>
					<input type="file" multiple="true" />
				</div>
				<div id="lumise-upload-list">
					<ul class="lumise-list-items"></ul>
				</div>
			</div>
			<div data-tab="external" id="lumise-external-images"></div>
			<div data-tab="xexternal" id="lumise-xexternal-images"></div>';
			
		return $args;
		
	}
	
	public function admin_menus($args) {
		
		global $lumise;
		
		$position = 4;
		
		$new_menu = array(
			"images" => array(
				'title' => $lumise->lang('Images'),
				'icon'  => '<i class="fa fa-image"></i>',
				'child' => array(
					'images'   => array(
						'type'   => '',
						'title'  => $lumise->lang('All Images'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=images',
						'hidden' => false,
					),
					'image' => array(
						'type'   => '',
						'title'  => $lumise->lang('Add New Image'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=image',
						'hidden' => false,
					),
					'categories' => array(
						'type'   => 'images',
						'title'  => $lumise->lang('Images Categories'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=categories&type=images',
						'hidden' => false,
					),
					'category' => array(
						'type'   => 'images',
						'title'  => $lumise->lang('Add New Category'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=category&type=images',
						'hidden' => true,
					),
					'tags' => array(
						'type'   => 'images',
						'title'  => $lumise->lang('Tags'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=tags&type=images',
						'hidden' => false,
					),
					'tag' => array(
						'type'   => 'images',
						'title'  => $lumise->lang('Add New Tag'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=tag&type=images',
						'hidden' => true,
					),
				),
				'capability' => 'lumise_read_images'
			)
		);
		
		return array_slice($args, 0, $position, true) + 
			   $new_menu + 
			   array_slice($args, $position, count($args) - 1, true);
			   
	}
	
	public function admin_page($path, $page) {
		
		if ($page == 'image')
			return dirname(__FILE__).DS.'image.php';
		else if ($page == 'images')
			return dirname(__FILE__).DS.'images.php';
		else return $path;
		
	}
	
	public function upload_folders($args) {
		array_push($args, 'images');
		return $args;
	}
	
	public function settings() {
		
		global $lumise;
		
		return array(
			array(
				'type' => 'toggle',
				'name' => 'internal_resources',
				'label' => $lumise->lang('Lumise service'),
				'desc' => $lumise->lang('Use Lumise server to load external images. If you have the APIs, switch off this and enter them in the fields below'),
				'default' => 'yes',
				'value' => 'yes'
			),
			array(
				'type' => 'checkboxes',
				'name' => 'ex_activate',
				'label' => $lumise->lang('Activate'),
				'options' => array(
					'fb' => 'Facebook',
					'in' => 'Instagram',
					'pi' => 'Pixabay',
					'un' => 'Unsplash'
				)
			),
			array(
				'type' => 'input',
				'name' => 'facebook_app',
				'label' => $lumise->lang('Facebook APP ID'),
				'desc' => '<a href="https://developers.facebook.com/apps/" target=_blank>Create a Facebook APP</a>'
			),
			array(
				'type' => 'input',
				'name' => 'instagram_api',
				'label' => $lumise->lang('Instagram API'),
				'desc' => '<a href="https://www.instagram.com/developer/clients/manage/" target=_blank>Create a Instagram APP</a>'
			),
			array(
				'type' => 'input',
				'name' => 'pixabay_api',
				'label' => $lumise->lang('Fixabay API'),
				'desc' => '<a href="https://pixabay.com/service/about/api/" target=_blank>Get the Fixabay API</a>'
			),
			array(
				'type' => 'input',
				'name' => 'unsplash_api',
				'label' => $lumise->lang('Unsplash API'),
				'desc' => '<a href="https://unsplash.com/developers" target=_blank>Get the Unsplash API</a>'
			)
		);
			
	}
	
	public function editor_header() {
		
		if (!$this->is_backend()) 
			echo '		<link rel="stylesheet" href="'.$this->get_url('assets/css/images.css?ver=1').'" type="text/css" media="all" />';
		
	}
	
	public function editor_footer() {
		
		global $lumise;
		
		if (!$this->is_backend()) {
			echo '<script type="text/javascript">var lumise_images_addon_cfg = {
				"external": "'.(isset($lumise->cfg->settings['internal_resources']) ? $lumise->cfg->settings['internal_resources'] : '').'",
				"api": {
					"actv": "'.(isset($lumise->cfg->settings['ex_activate']) ? $lumise->cfg->settings['ex_activate'] : '').'",
					"fb": "'.(isset($lumise->cfg->settings['facebook_app']) ? $lumise->cfg->settings['facebook_app'] : '').'",
					"in": "'.(isset($lumise->cfg->settings['instagram_api']) ? $lumise->cfg->settings['instagram_api'] : '').'",
					"pi": "'.(isset($lumise->cfg->settings['pixabay_api']) ? $lumise->cfg->settings['pixabay_api'] : '').'",
					"un": "'.(isset($lumise->cfg->settings['unsplash_api']) ? $lumise->cfg->settings['unsplash_api'] : '').'",
					"op": "'.(isset($lumise->cfg->settings['openclipart_api']) ? $lumise->cfg->settings['openclipart_api'] : '').'"
				}
			}</script>';
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/images.js?ver=1').'"></script>';
		}
	}
	
	public function ajax_action() {
		
		global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'images') {
			$lumise->lib->x_items('images');
		}
	}
	
	/*
		Actions on active or deactive this addon
	*/
	
	static function active() {
		
		global $lumise;
		
		$lumise->db->rawQuery("CREATE TABLE  IF NOT EXISTS `".$lumise->db->prefix."images` (
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
		
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."images` ADD PRIMARY KEY (`id`);");
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."images` CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT;");
		
	}
}