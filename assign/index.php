<?php
/*
Name: Assign
Description: Assign templates, cliparts for a product base
Version: 1.0
Compatible: 1.7.5
*/

class lumise_addon_assign extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		
		$lumise->add_filter('process-section-products', array(&$this, 'insert_product_fields'));
		$lumise->add_action('process-fields', array(&$this, 'process_fields'));
		$lumise->add_action('x_items', array(&$this, 'x_items'));
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));

		
	}

	public function editor_footer() {
		
		global $lumise;
		
		if (!$this->is_backend()) {	
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/script.js?ver=1').'"></script>';
		}
	}
	
	public function insert_product_fields($args) {
		
		$field_1 = array(
			'type' => 'trace',
			'label' => 'Assign templates',
			'assign' => 'templates',
			'content' => array(&$this, 'field_templates')
		);
		
		$field_2 = array(
			'type' => 'trace',
			'label' => 'Assign cliparts',
			'assign' => 'cliparts',
			'content' => array(&$this, 'field_cliparts')
		);
		
		if (isset($args['tabs'])) {
			array_push($args['tabs'][array_keys($args['tabs'])[0]], $field_1);
			array_push($args['tabs'][array_keys($args['tabs'])[0]], $field_2);
		} else {
			array_push($args[array_keys($args)[0]], $field_1);
			array_push($args[array_keys($args)[0]], $field_2);
		}
		
		return $args;
		
	}
	
	public function field_templates($args) {

		global $lumise;
		
		$id = $_GET['id'];
		$assign = $lumise->get_option('assign-templates-'.$id);

		if ($assign == null)
			$assign = array();
		else $assign = json_decode(urldecode($assign), true);
		
		$lumise->views->field_categories(array(
			"name" => "__assign_templates", 
			"cate_type" => "templates",
			"value" => $assign
		));
		
	}
	
	public function field_cliparts($args) {

		global $lumise;
		
		$id = $_GET['id'];
		$assign = $lumise->get_option('assign-cliparts-'.$id);

		if ($assign == null)
			$assign = array();
		else $assign = json_decode(urldecode($assign), true);
		
		$lumise->views->field_categories(array(
			"name" => "__assign_cliparts", 
			"cate_type" => "cliparts",
			"value" => $assign
		));
		
	}
	
	public function process_fields($section, $id) {
		
		global $lumise;
		
		if ($section == 'product') {
			if (isset($_POST['__assign_cliparts'])) {
				$lumise->set_option('assign-cliparts-'.$id, array_map(function($v) {return (int)$v;}, array_filter($_POST['__assign_cliparts'])));
			}	
			if (isset($_POST['__assign_templates'])) {
				$lumise->set_option('assign-templates-'.$id, array_map(function($v) {return (int)$v;}, array_filter($_POST['__assign_templates'])));
			}	
		}
		
	}
	
	public function x_items($type) {
		
		global $lumise;
		
		if (isset($_POST['ajax']) && $_POST['ajax'] == 'backend')
			return;
			
		if ($type == 'templates' || $type == 'cliparts') {
			
			$assign = $lumise->get_option('assign-'.$type.'-'.$_POST['product_base']);
			
			if ($assign == null)
				$assign = array();
			else $assign = json_decode(urldecode($assign), true);
			
			if (count($assign) > 0) {
				$this->re_x_items($type, $assign);
			}
			
		}
		
	}
	
	public function re_x_items($type, $cates) {
		
		global $lumise;
		
		$category = htmlspecialchars(isset($_POST['category']) ? $_POST['category'] : 0);
		$index = (int)htmlspecialchars(isset($_POST['index']) ? $_POST['index'] : 0);
		$q = htmlspecialchars(isset($_POST['q']) ? $_POST['q'] : '');
		$limit = (int)htmlspecialchars(isset($_POST['limit']) ? $_POST['limit'] : 48);
		$cate_name = '';
		
		$query = sprintf(
			"SELECT `id`, `name`, `parent`, `thumbnail_url` as `thumbnail` FROM `%s` WHERE `%s`.`author`='%s' AND `type`='%s' %s ORDER BY `order` ASC",
            $lumise->lib->sql_esc($lumise->db->prefix."categories"),
            $lumise->lib->sql_esc($lumise->db->prefix."categories"),
            $lumise->vendor_id,
           $lumise->lib->sql_esc($type),
			" AND `id` IN (".implode(',', $cates).") AND `active` = 1 "
        );
        
		$categories = $lumise->db->rawQuery($query);

		if (!in_array($category, $cates)) {
			$category = $cates;
			$parents = array(array(
				"id" => "",
				"name" => $lumise->lang('All categories')
			));
		} else $parents = $lumise->lib->get_category_parents($category);
		
		foreach ($categories as $key => $val) {
			$categories[$key]['name'] = $lumise->lang($val['name']);
		}
		
		header('Content-Type: application/json');
		
		$xitems = $lumise->lib->get_xitems($category, $q, $index, $type, $limit);
		
		$items = $xitems[0];
		$total = $xitems[1];
		
		echo json_encode(array(
			"category" => is_array($category) ? 0 : $category,
			"category_name" => $lumise->lang($cate_name),
			"category_parents" => $parents,
			"categories" => $categories,
			"categories_full" => '',
			"items" => $items,
			"q" => $q,
			"total" => $total,
			"index" => $index,
			"page" => 1,
			"limit" => $limit
		));
		
		exit;
		
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