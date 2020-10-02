<?php
/*
Name: Backgrounds
Description: Change backgrounds for editor by your own upload images
Version: 1.0
Compatible: 1.7.4
*/

class lumise_addon_backgrounds extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_background');
		
		/*
		*	Add new component, show in left menu of editor and can config in Lumise -> Settings -> Editor
		*/
		
		$this->add_component(array(
			"backgrounds" => array(
				"label" => "Background",
				"icon" => "lumisex-easel",
				"load" => "backgrounds",
				"class" => "lumise-x-thumbn",
				"content" => ''
			)
		));

		$lumise->add_filter('editor_menus', array(&$this, 'editor_menus'));
		
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
		
		$lumise->add_action('editor-options', array(&$this, 'editor_options'));
		$lumise->add_action('editor-header', array(&$this, 'editor_header'));
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		
		/*
		*	Action ajax
		*/
		
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
		
		$lumise->add_action('after_field', array(&$this, 'after_field'));
		$lumise->add_action('process-fields', array(&$this, 'process_fields'));
		
		/*
		*	Add role for manage component Backgrounds (Wordpress Platform)
		*/
		
		if ($lumise->connector->platform == 'woocommerce') {
			$role = get_role('administrator');
			$role->add_cap('lumise_read_backgrounds');
			$role->add_cap('lumise_edit_backgrounds');
		}
		
	}

	public function editor_menus($args) {
		
		global $lumise;
		
		$args['backgrounds']['content'] = (
			($lumise->connector->is_admin() || $lumise->cfg->settings['disable_resources'] != 1)
			? '<header class="images-from-socials lumise_form_group">
				<button data-nav="colors" class="active">
					<i class="lumisex-paintbucket"></i>
					<br>
					'.$lumise->lang('Colors').'
				</button>
				<button data-nav="patterns">
					<i class="nxi nxi-pattern"></i>
					<br>
					'.$lumise->lang('Patterns').'
				</button>
				<button data-nav="textures">
					<i class="lumise-icon-picture"></i>
					<br>
					'.$lumise->lang('Images').'
				</button>
			</header>' : ''
			).
			'<div data-tab="colors" class="active">
				<div id="lumise-colors-list" class="smooth lumise-xitems-list nosearch nocategory"></div>
			</div>
			<div data-tab="patterns" class="">
				' . 
				$this->render_xitems(array(
					"component" => "backgrounds",
					"search" => false,
					"category" => false,
					"preview" => true,
					"price" => true
				))
			. '</div>
			<div data-tab="textures" class="">
				<div id="lumise-textures-list" class="smooth lumise-xitems-list nosearch nocategory"></div>
			</div>';
			
		return $args;
		
	}
	
	public function admin_menus($args) {
		
		global $lumise;
		
		$position = 3;
		
		$new_menu = array(
			"backgrounds" => array(
				'title' => $lumise->lang('Backgrounds'),
				'icon'  => '<i class="fa fa-object-group"></i>',
				'child' => array(
					'backgrounds'   => array(
						'type'   => '',
						'title'  => $lumise->lang('All Backgrounds'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=backgrounds',
						'hidden' => false,
					),
					'background' => array(
						'type'   => '',
						'title'  => $lumise->lang('Add New Background'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=background',
						'hidden' => false,
					),
					'categories' => array(
						'type'   => 'backgrounds',
						'title'  => $lumise->lang('Backgrounds Categories'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=categories&type=backgrounds',
						'hidden' => false,
					),
					'category' => array(
						'type'   => 'backgrounds',
						'title'  => $lumise->lang('Add New Category'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=category&type=backgrounds',
						'hidden' => true,
					),
					'tags' => array(
						'type'   => 'backgrounds',
						'title'  => $lumise->lang('Tags'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=tags&type=backgrounds',
						'hidden' => false,
					),
					'tag' => array(
						'type'   => 'backgrounds',
						'title'  => $lumise->lang('Add New Tag'),
						'link'   => $lumise->cfg->admin_url.'lumise-page=tag&type=backgrounds',
						'hidden' => true,
					),
				),
				'capability' => 'lumise_read_backgrounds'
			)
		);
		
		return array_slice($args, 0, $position, true) + 
			   $new_menu + 
			   array_slice($args, $position, count($args) - 1, true);
			   
	}
	
	public function admin_page($path, $page) {
		
		if ($page == 'background')
			return dirname(__FILE__).DS.'background.php';
		else if ($page == 'backgrounds')
			return dirname(__FILE__).DS.'backgrounds.php';
		else return $path;
		
	}
	
	public function upload_folders($args) {
		array_push($args, 'backgrounds');
		return $args;
	}
	
	public function editor_options() {
		
		global $lumise;
		
		echo '<li>
					<label>Background Image</label>
					<select id="lumise-addon-background-options">
						<option value="tile">Tile</option>
						<option value="fill">Fill</option>
						<option value="fit">Fit</option>
						<option value="stretch">Stretch</option>

					</select>
					<tip>
						<i></i>
						<text>'.
							$lumise->lang('Select the way how the background image addon display').
						'</text>
					</tip>
				</li>';
			
	}
	
	public function editor_header() {
		
		if ($this->is_backend()) {/*  ... */}
		
		echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/backgrounds.css?ver=1').'" type="text/css" media="all" />';
		echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/spectrum.css?ver=1').'" type="text/css" media="all" />';
		
	}
	
	public function editor_footer() {
		
		if (!$this->is_backend()){ 
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/backgrounds.js?ver=1').'"></script>';
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/spectrum.js?ver=1').'"></script>';
		}
		else echo '<script type="text/javascript" src="'.$this->get_url('assets/js/backgrounds-backend.js?ver=1').'"></script>';
		
	}
	
	public function ajax_action($comp) {
		
		global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'backgrounds') {
			$_POST['category'] = '463';
			$lumise->lib->x_items('backgrounds');
		}

		if (isset($_POST['component']) && $_POST['component'] == 'textures') {
			$_POST['category'] = '464';
			$lumise->lib->x_items('backgrounds');
		}
		
		if (isset($_POST['component']) && $_POST['component'] == 'get_backgrounds') {
			echo $lumise->get_option('backgrounds-product-'.$lumise->lib->esc('id'));
		}
		
	}
	
	public function after_field($args) {
		
		if ($args['type'] == 'stages') {
			
			global $lumise;
			
			$id = $_GET['id'];
			$backgrounds = $lumise->get_option('backgrounds-product-'.$id);

			if ($backgrounds == null)
				$backgrounds = array();
			else $backgrounds = json_decode(urldecode($backgrounds));
			
			echo '<h3 style="margin:30px 0 10px; float: left; width: 100%; font-weight: 500; font-size=14px;">Select backgrounds</h3>';
			echo '<div id="lumise-background-product" class="xitems">';
			if (count($backgrounds) > 0) {
				foreach ($backgrounds as $bg) {
					echo '<span>';
					echo '<img height="34" data-id="'.$bg->id.'" data-price="'.str_replace('"', '%22', $bg->price).'" data-upload="'.str_replace('"', '%22', $bg->upload).'" src="'.str_replace('"', '%22', $bg->thumbn).'" />';
					echo '<i class="fa fa-times" data-func="delete"></i>';
					echo '</span>';
				}
			}
			echo '<button data-func="load" data-btn><i data-func="load" class="fa fa-plus"></i></button>';
			echo '<input type="hidden" name="backgrounds-product" value="'.(urlencode(json_encode($backgrounds))).'" />';
			echo '</div>';
		}
	}
	
	public function process_fields($section, $id) {
		
		global $lumise;
		
		if ($section == 'product') {
			$lumise->set_option('backgrounds-product-'.$id, $_POST['backgrounds-product']);	
		}
		
	}
	
	/*
		Actions on active or deactive this addon
	*/
	
	static function active() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (!in_array('backgrounds', $comps))
			array_push($comps, 'backgrounds');
		
		$lumise->set_option('components', implode(',', $comps));
		
		$lumise->db->rawQuery("CREATE TABLE  IF NOT EXISTS `".$lumise->db->prefix."backgrounds` (
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
		
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."backgrounds` ADD PRIMARY KEY (`id`);");
		$lumise->db->rawQuery("ALTER TABLE `".$lumise->db->prefix."backgrounds` CHANGE `id` `id` INT(11) NOT NULL AUTO_INCREMENT;");
		
	}
	
	static function deactive() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);

		if (in_array('backgrounds', $comps))
			unset($comps[array_search('backgrounds', $comps)]);
		
		$lumise->set_option('components', implode(',', $comps));
		
	}
	
}