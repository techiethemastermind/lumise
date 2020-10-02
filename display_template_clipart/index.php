<?php
/*
Name: Display template and clipart
Description: Display template and clipart on page
Version: 1.0
Compatible: 1.7.5
*/

class lumise_addon_display_template_clipart extends lumise_addons {
	
	function __construct() {

		global $lumise;

		// header menu
		$lumise->add_action('header_lumise_php', array(&$this, 'header_lumise_php_addon'));
		
		// add js
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		$lumise->add_action('footer_lumise_php', array(&$this, 'editor_footer_php'));
		
		// Access core js via your JS function name 
		$this->access_corejs('lumise_addon_display_template_clipart_js');

		// register shortcode
		if($lumise->connector->platform == 'woocommerce'){
			add_shortcode('lumise_template_clipart_list', array(&$this, 'lumise_lumise_template_clipart_list'));
		}

		// ajax
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));

		// $lumise->add_filter('list-products-after', array(&$this, 'list_products_after'));
	}

	public function ajax_action($comp) {
		
		global $lumise;

		if (isset($_POST['ajax']) && $_POST['ajax'] == 'frontend' && isset($_POST['action']) && $_POST['action'] == 'addon' && isset($_POST['component']) && $_POST['component'] == 'clipart_templates_shortcode_html' ) {

			if(isset($_REQUEST['per_page'])){
				$args['per_page'] = intval($_REQUEST['per_page']);
			}
			if(isset($_REQUEST['left_column'])){
				$args['left_column'] = $_REQUEST['left_column'];
			}
			if(isset($_REQUEST['columns'])){
				$args['columns'] = intval($_REQUEST['columns']);
			}
			if(isset($_REQUEST['search'])){
				$args['search'] = $_REQUEST['search'];
			}
			echo $this->lumise_lumise_template_clipart_list($args, '');
		}

		if (isset($_POST['ajax']) && $_POST['ajax'] == 'frontend' && isset($_POST['action']) && $_POST['action'] == 'addon' && isset($_POST['component']) && $_POST['component'] == 'clipart_templates_shortcode' && isset($_POST['id']) && isset($_POST['resource']) && ($_POST['resource'] == 'cliparts' || $_POST['resource'] == 'templates') ) {
			$type = '';
			if($_POST['resource'] == 'cliparts'){
				$type = 'image';
			}
			if($_POST['resource'] == 'templates'){
				$type = 'template';
			}

			$query = "SELECT SQL_CALC_FOUND_ROWS item.*, '".$_POST['resource']."' as resource  FROM {$lumise->db->prefix}".$_POST['resource']." item WHERE item.author='' AND item.active = 1  AND item.id = ".intval($_POST['id'])." ";

			// $queryTemplates = "SELECT SQL_CALC_FOUND_ROWS item.*, 'templates' as resource  FROM lumise_templates item WHERE item.author='' AND item.active = 1  GROUP BY item.id ORDER BY `item`.`order` DESC, `item`.`created` DESC LIMIT 0, 48";

			$item = $lumise->db->rawQuery($query);

			if(empty($item) || count($item) != 1){
				echo json_encode(array('status' => 0, 'message' => 'Not found item'));
				die();
			}
			
			if($_POST['resource'] == 'cliparts'){
				$result = array(array(
					'cates' => '',
					'id' => strval($_POST['id']),
					'name' => $item[0]['name'],
					'price' => floatval($item[0]['price']),
					'resource' => $_POST['resource'],
					'resource_id' => intval($item[0]['id']),
					'tags' => '',
					'type' => $type,
					'url' =>  $item[0]['upload']
				));
			}

			if($_POST['resource'] == 'templates'){
				$result = array(array(
					'cates' => '',
					'id' => strval($_POST['id']),
					'name' => $item[0]['name'],
					'screenshot' => $item[0]['screenshot'],
					'price' => floatval($item[0]['price']),
					'tags' => '',
					'type' => $type,
					'url' =>  $item[0]['upload']
				));
			}
			echo json_encode(array('status' => 1, 'message' => $result));
			die();
		}

		if (isset($_POST['ajax']) && $_POST['ajax'] == 'frontend' && isset($_POST['action']) && $_POST['action'] == 'addon' && isset($_POST['component']) && $_POST['component'] == 'get_lumise_tc' ) {
			$result = array();

			$filter = array();
			$cate_id = intval($_REQUEST['cate_id']);
			$cate_type = $_REQUEST['cate_type'];
			$search = $_REQUEST['search'];
			$c_page = intval($_REQUEST['c_page']);
			$limit = intval($_REQUEST['limit']);

			if ($cate_id != 0) {
				$filter['cate_id'] = $cate_id;
			}
			if ($cate_type != '') {
				$filter['cate_type'] = $cate_type;
			}
			if ($search != '') {
				$filter['search'] = $search;
			}
			if ($c_page != 0) {
				$filter['c_page'] = $c_page;
			}
			if ($limit != 0) {
				$filter['limit'] = $limit;
			}
			$listoftc = $this->getListOfTemplateClipart($filter);

			echo json_encode(array('status' => 1, 'message' => $listoftc));
			die();
		}
	}

	public function header_lumise_php_addon(){
		global $lumise;

		$addon_design_lib = false;
		$actives = $lumise->get_option('active_addons');
		if ($actives !== null && !empty($actives)){
		    $actives = (Array)@json_decode($actives);
		}

		if (!is_array($actives)){
		    $actives = array();
		}
		foreach ($actives as $key => $value) {
		    if($key == 'display_template_clipart' && $value == 1){
		        echo "<li><a href=".$lumise->cfg->url.'design-library.php'.">".$lumise->lang('Design library')."</a></li>";
		    }
		}
	}

	public function editor_footer_php(){
		global $lumise;

		if($lumise->connector->platform == 'php' && !$this->is_backend() && strpos($_SERVER['REQUEST_URI'], 'design-library.php') !== false){
			$this->editor_file();
		}
	}

	public function editor_footer() {

		if(!$this->is_backend()) {
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/edit_design_addon.js?ver=1').'"></script>';
		}
	}

	public function settings() {
		global $lumise;
		
		return array(
			array(
				'type' => 'input',
				'name' => 'tutorial_shortcode_lumise_template_clipart',
				'desc' => 'Ex : <font color="red">[lumise_template_clipart_list per_page="30" left_column="true" columns="4" search="true"]</font><br/><br/>per_page : '.$lumise->lang('* Display number on per pages').'<br/>left_column : '.$lumise->lang('* Display list Cliparts and Templates').'<br/>columns : '.$lumise->lang('* Column much be even number').'<br/>search : '.$lumise->lang('* Display search area')."<style>.lumise_form_submit, input[name=".'"tutorial_shortcode_lumise_template_clipart"'."]{display: none !important;}</style>",
				'label' => 'Tutorial Shortcode'
			)
		);
	}

	public function lumise_lumise_template_clipart_list($args, $content){
		global $lumise;
		
		// add css & js
		if($lumise->connector->platform == 'woocommerce'){
			$this->editor_file();
		}
		
		$listofctc = $this->getListOfCategoriesTemplateClipart();

		$cateTemplates = $this->filterData($listofctc, 'templates');
		$cateCliparts = $this->filterData($listofctc, 'cliparts');

		ob_start();
	?>
		<input type="hidden" name="lumise_shortcode_per_page" value="<?php echo (isset($args['per_page']) && intval($args['per_page'])) ? intval($args['per_page']) : '10' ?>">
		<input type="hidden" name="lumise_shortcode_columns" value="<?php echo (isset($args['columns']) && intval($args['columns'])) ? intval($args['columns']) : '4' ?>">
	<div id="lumise_template_clipart_shortcode" class="lumise-addon-shortcode-tc-container-fluid">
 		<div class="lumise-addon-shortcode-tc-row">
			<?php if(isset($args['left_column']) && $args['left_column'] == 'true') : ?>
 			<div class="lumise_shortcode-tc-categories lumise-addon-shortcode-tc-col-md-3">
 				<div class="lumise_addon_tc_tabs">
 					<ul>
 						<li class="lumise_addon_tc_tabs_title active" data-tab="clipart">Cliparts</li>
 						<li class="lumise_addon_tc_tabs_title "data-tab="template" >Templates</li>
 					</ul>
 					<div class="data-tab-content-clipart active">
 						<div class="bigsize">
 							<ul>
 							<?php 
 								echo '<li class="lumise-addon-shortcode-list-cliparts" data-type="cliparts" data-cat="0"><span data-type="cliparts" data-cat="0" class="list_name">All</span></li>';
 								foreach ($cateCliparts as $indexCateTemplate => $valueCateTemplate) {
 									echo '<li class="lumise-addon-shortcode-list-cliparts" data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'"><span data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'" class="list_name">'.$valueCateTemplate['name'].'</span>';
 									$this->dequy_list($valueCateTemplate, 'clipart_list');
 									echo '</li>';
 								}
 							?>
 							</ul>
 						</div>
 					</div>
 					<div class="data-tab-content-template">
 						<ul>
 							<?php 
 								echo '<li class="lumise-addon-shortcode-list-templates" data-type="templates" data-cat="0"><span data-type="templates" data-cat="0" class="list_name">All</span></li>';
 								foreach ($cateTemplates as $indexCateTemplate => $valueCateTemplate) {
 									echo '<li class="lumise-addon-shortcode-list-templates" data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'"><span data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'" class="list_name">'.$valueCateTemplate['name'].'</span>';
 									$this->dequy_list($valueCateTemplate, 'template_list');
 									echo '</li>';
 								}
 							?>
 						</ul>
 					</div>
 				</div>
 			</div>
			<?php endif; ?>
 			<div class="lumise_shortcode-tc-listing lumise-addon-shortcode-tc-col-md-<?php echo (isset($args['left_column']) && $args['left_column'] == 'true') ? '9' : '12' ?>">
 				<input type="hidden" id="cate_id">
 				<input type="hidden" id="cate_type">

				<?php if(isset($args['left_column']) && $args['left_column'] == 'false') : ?>
				<div class="lumise_addon_tc_tabs lumise-addon-shortcode-tc-nav lumise-addon-shortcode-tc-col-md-6">
					<ul>
						<li class="lumise_addon_tc_tabs_title" data-tab="clipart">Cliparts</li>
						<li class="lumise_addon_tc_tabs_title "data-tab="template" >Templates</li>
					</ul>
 					<div class="data-tab-content-clipart">
 						<div class="bigsize">
 							<ul>
 							<?php 
 								echo '<li class="lumise-addon-shortcode-list-cliparts" data-type="cliparts" data-cat="0"><span data-type="cliparts" data-cat="0" class="list_name">All</span></li>';
 								foreach ($cateCliparts as $indexCateTemplate => $valueCateTemplate) {
 									echo '<li class="lumise-addon-shortcode-list-cliparts" data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'"><span data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'" class="list_name">'.$valueCateTemplate['name'].'</span>';
 									$this->dequy_list($valueCateTemplate, 'clipart_list');
 									echo '</li>';
 								}
 							?>
 							</ul>
 						</div>
 					</div>
 					<div class="data-tab-content-template">
 						<ul>
 							<?php 
 								echo '<li class="lumise-addon-shortcode-list-templates" data-type="templates" data-cat="0"><span data-type="templates" data-cat="0" class="list_name">All</span></li>';
 								foreach ($cateTemplates as $indexCateTemplate => $valueCateTemplate) {
 									echo '<li class="lumise-addon-shortcode-list-templates" data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'"><span data-type="'.$valueCateTemplate['type'].'" data-cat="'.$valueCateTemplate['id'].'" class="list_name">'.$valueCateTemplate['name'].'</span>';
 									$this->dequy_list($valueCateTemplate, 'template_list');
 									echo '</li>';
 								}
 							?>
 						</ul>
 					</div>
 				</div>
			<?php endif; ?>
 			<?php if(isset($args['search']) && $args['search'] == 'true') : ?>
 				<div class="lumise-addon-shortcode-tc-search lumise-addon-shortcode-tc-col-md-6"><input id="search_adon" type="text" placeholder="Search"></div>
 			<?php endif; ?>
 				<div class="lumise-addon-shortcode-tc-list"></div>
 				<div class="lumise-addon-shortcode-tc-pagination"></div>
 			</div>

 		</div>
 	</div>
	<?php 
		$content = ob_get_contents();
		ob_clean();
		ob_end_flush();

		return $content;
	}

	public function dequy_list($valueCateTemplate, $type = ''){
		if(isset($valueCateTemplate['child'])){
			echo '<span data-cat="'.$valueCateTemplate['id'].'" class="list_icon"><svg style="width: 14px;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512.011 512.011" style="enable-background:new 0 0 512.011 512.011;" xml:space="preserve"><g><g><path d="M505.755,123.592c-8.341-8.341-21.824-8.341-30.165,0L256.005,343.176L36.421,123.592c-8.341-8.341-21.824-8.341-30.165,0s-8.341,21.824,0,30.165l234.667,234.667c4.16,4.16,9.621,6.251,15.083,6.251c5.462,0,10.923-2.091,15.083-6.251l234.667-234.667C514.096,145.416,514.096,131.933,505.755,123.592z"/></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></span>';
			echo '<ul data-id="child_'.$valueCateTemplate['id'].'" class="hidden_submenu">';
			foreach ($valueCateTemplate['child'] as $key => $value) {
				if($type == 'clipart_list'){
					echo '<li class="lumise-addon-shortcode-list-cliparts" data-type="'.$value['type'].'" data-cat="'.$value['id'].'"><span data-type="'.$value['type'].'" data-cat="'.$value['id'].'" class="list_name">'.$value['name'].'</span>';
				}
				if($type == 'template_list'){
					echo '<li class="lumise-addon-shortcode-list-templates" data-type="'.$value['type'].'" data-cat="'.$value['id'].'"><span data-type="'.$value['type'].'" data-cat="'.$value['id'].'" class="list_name">'.$value['name'].'</span>';
				}
				$this->dequy_list($value, $type);
				echo "</li>";
			}
			echo '</ul>';
		}
		return false;
	}

	public function getListOfTemplateClipart($filter){
		global $lumise;

		$listofData = array();
		$limit = 10;
		$c_page = 0;
		$tableDefault = $lumise->lib->sql_esc($lumise->db->prefix."cliparts");
		$defaultSelect = "id, thumbnail_url, created, 'cliparts' as type";
		$nameSearch = '';

		if (isset($filter['cate_type']) && $filter['cate_type'] == 'templates') {
			$tableDefault = $lumise->lib->sql_esc($lumise->db->prefix."templates");
			$defaultSelect = "id, screenshot, created, 'templates' as type";
		}

		$queryFilter = " WHERE ";
		if(isset($filter['cate_id']) && isset($filter['cate_type']) && ($filter['cate_type'] == 'cliparts' || $filter['cate_type'] == 'templates')){
			if ($filter['cate_type'] == 'templates') {

				$table1 = $lumise->lib->sql_esc($lumise->db->prefix."templates");
				$defaultSelect = " ".$table1.".id, ".$table1.".screenshot, ".$table1.".created, 'templates' as type ";
				$tableDefault = $table1.' INNER JOIN '.$lumise->db->prefix.'categories_reference ON '.$lumise->db->prefix.'categories_reference.item_id = '.$table1.'.id ';
				$queryFilter .= ' '.$lumise->db->prefix.'categories_reference.category_id =  '.$filter['cate_id'].' AND '.$lumise->db->prefix.'categories_reference.type = "'.$filter['cate_type'].'" AND ';

			}

			if ($filter['cate_type'] == 'cliparts') {

				$table1 = $lumise->lib->sql_esc($lumise->db->prefix."cliparts");
				$defaultSelect = " ".$table1.".id, ".$table1.".thumbnail_url, ".$table1.".created, 'cliparts' as type ";
				$tableDefault = $table1.' INNER JOIN '.$lumise->db->prefix.'categories_reference ON '.$lumise->db->prefix.'categories_reference.item_id = '.$table1.'.id ';
				$queryFilter .= ' '.$lumise->db->prefix.'categories_reference.category_id =  '.$filter['cate_id'].' AND '.$lumise->db->prefix.'categories_reference.type = "'.$filter['cate_type'].'" AND ';

			}
		}
		if(isset($filter['search']) && $filter['search'] != ''){
			$queryFilter .= "name like '%s' ";
			$nameSearch = $filter['search'];
			$listFilter = $gr_cate = $gr_tag = array();

			// search type
			$typeSearch = "cliparts";
			if (isset($filter['cate_type']) && $filter['cate_type'] == 'templates') {
				$typeSearch = "templates";
			}

			// search cate
			$searchCate = "SELECT GROUP_CONCAT(".$lumise->db->prefix."categories_reference.item_id) AS gr_cate FROM ".$lumise->db->prefix."categories_reference INNER JOIN ".$lumise->db->prefix."categories ON ".$lumise->db->prefix."categories_reference.category_id = ".$lumise->db->prefix."categories.id WHERE ".$lumise->db->prefix."categories.name LIKE '%s' AND ".$lumise->db->prefix."categories.active = 1 AND ".$lumise->db->prefix."categories_reference.type = '".$typeSearch."' ";
			$querySearchCate = sprintf($searchCate, $lumise->lib->sql_esc($nameSearch));
			$excuteSearchCate = $lumise->db->rawQuery($querySearchCate);

			if(isset($excuteSearchCate[0]) && isset($excuteSearchCate[0]['gr_cate']) && $excuteSearchCate[0]['gr_cate'] != '' && $excuteSearchCate[0]['gr_cate'] != NULL ){
				$gr_cate = explode(',', $excuteSearchCate[0]['gr_cate']);
			}

			// search tag
			$searchCate = "SELECT GROUP_CONCAT(".$lumise->db->prefix."tags_reference.item_id) AS gr_tag FROM ".$lumise->db->prefix."tags_reference INNER JOIN ".$lumise->db->prefix."tags ON ".$lumise->db->prefix."tags_reference.tag_id = ".$lumise->db->prefix."tags.id WHERE ".$lumise->db->prefix."tags.name LIKE '%s' AND ".$lumise->db->prefix."tags_reference.type = '".$typeSearch."' ";
			$querySearchCate = sprintf($searchCate, $lumise->lib->sql_esc($nameSearch));
			$excuteSearchCate = $lumise->db->rawQuery($querySearchCate);

			if(isset($excuteSearchCate[0]) && isset($excuteSearchCate[0]['gr_tag']) && $excuteSearchCate[0]['gr_tag'] != '' && $excuteSearchCate[0]['gr_tag'] != NULL ){
				$gr_tag = explode(',', $excuteSearchCate[0]['gr_tag']);
			}

			foreach ($gr_cate as $index => $detailID) {
				if(!in_array($detailID, $listFilter)){
					$listFilter[] = $detailID;
				}
			}

			foreach ($gr_tag as $index => $detailID) {
				if(!in_array($detailID, $listFilter)){
					$listFilter[] = $detailID;
				}
			}

			if(!empty($listFilter)){
				$table = $tableDefault;
				if(isset($table1)){
					$table = $table1;
				}
				$queryFilter.= ' OR '.$table.'.id IN('.implode(',', $listFilter).') AND ';
			} else {
				$queryFilter.= ' AND ';
			}

		}
		if(isset($filter['limit']) && $filter['limit']){
			$limit = $filter['limit'];
		}
		if(isset($filter['c_page']) && $filter['c_page']){
			$c_page = $filter['c_page'];
		}

		// get list 
		$query = sprintf(
			"SELECT ".$defaultSelect." FROM ".$tableDefault." ".$queryFilter." active=1 LIMIT ".$c_page*$limit.",".$limit,
			$lumise->lib->sql_esc($nameSearch)
		);

		// var_dump($lumise->cfg);
		// die();
		// var_dump($query);
		// die();
		$showData = $lumise->db->rawQuery($query);

		// make data
		foreach ($showData as $indexShowData => $valueShowData) {
			$listofData['list'][] = $valueShowData;
		}

		// count total
		if(isset($table1)){
			$query = sprintf(
				"SELECT COUNT(".$table1.".id) as total FROM ".$tableDefault." ".$queryFilter." active=1 ",
				$lumise->lib->sql_esc($nameSearch)
			);
			// var_dump($query);
			$showData = $lumise->db->rawQuery($query);
		} else {
			$query = sprintf(
				"SELECT COUNT(id) as total FROM ".$tableDefault." ".$queryFilter." active=1 ",
				$lumise->lib->sql_esc($nameSearch)
			);
			// var_dump($query);
			$showData = $lumise->db->rawQuery($query);
		}
		
		$listofData['count_page'] = 0;
		$listofData['cpage'] = $c_page;
		if(isset($showData[0]['total'])){
			$listofData['count_page'] = ceil(intval($showData[0]['total'])/$limit);
		}

		$lumise->cfg->tool_url = site_url('/design-editor');

		$design_editor_url = '';
		if(strpos($lumise->cfg->tool_url, '?') !== false && substr($lumise->cfg->tool_url, -1) == '?'){
			$design_editor_url = $lumise->cfg->tool_url;
		}
		if(strpos($lumise->cfg->tool_url, '?') !== false && substr($lumise->cfg->tool_url, -1) != '?'){
			$design_editor_url = $lumise->cfg->tool_url.'&';
		}
		if(strpos($lumise->cfg->tool_url, '?') === false ){
			$design_editor_url = $lumise->cfg->tool_url.'?';
		}
		$listofData['design_editor_url'] = $design_editor_url; 
		return $listofData;
	}

	public function getListOfCategoriesTemplateClipart(){
		global $lumise;
		
		$listofData = array();

		// get list of clipart
		$query = sprintf(
			"SELECT id, name, parent, type FROM `%s` WHERE active=1",
            $lumise->lib->sql_esc($lumise->db->prefix."categories")
        );
		$categories = $lumise->db->rawQuery($query);

		// make data
		foreach ($categories as $indexCategories => $valueCategories) {
			$listofData[] = $valueCategories;
		}

		return $listofData;
	}

	public function date_compare($a, $b){
		$t1 = strtotime($a['created']);
		$t2 = strtotime($b['created']);
		return $t1 - $t2;
	}   

	public function filterData($filter = array(), $filtertype = ''){
		$filterReturn = array();

		foreach ($filter as $index => $detailFilter) {
			if(intval($detailFilter['parent']) == 0 && $detailFilter['type'] == $filtertype){
				$filterReturn[] = $detailFilter;
			}
		}

		foreach ($filterReturn as $key => $detailValue) {
			if($detailValue['type'] == $filtertype){
				$filterReturn[$key] = $this->dequytree($filter, $detailValue, $filtertype);
			}
		}

		return $filterReturn;
	}

	public function dequytree($filter, $parent, $filtertype){
		foreach ($filter as $index => $detailFilter) {
			if(intval($detailFilter['parent']) == intval($parent['id']) && $detailFilter['type'] == $filtertype){
				$detailFilter = $this->dequytree($filter, $detailFilter, $filtertype);
				$parent['child'][] = $detailFilter;
			}
		}
		// no child
		return $parent;
	}

	public function editor_file(){
		global $lumise;

		if(!$this->is_backend()){
			echo '<script type="text/javascript">
			var lumiseAddonDesign = { loading_gif : "'.$this->get_url('assets/images/loading.gif').'" };
			var LumiseDesign = {
				url : "'.htmlspecialchars_decode($lumise->cfg->url).'",
				admin_url : "'.htmlspecialchars_decode($lumise->cfg->admin_url).'",
				ajax : "'.htmlspecialchars_decode($lumise->cfg->admin_ajax_url).'",
				assets : "'.$lumise->cfg->assets_url.'",
				jquery : "'.$lumise->cfg->load_jquery.'",
				nonce : "'.lumise_secure::create_nonce("LUMISE_ADMIN").'",
				filter_ajax: function(ops) {
					return ops;
				}
			};</script>';
		}
		// add css
		if ( !$this->is_backend() && $lumise->connector->platform == 'woocommerce') {
			wp_enqueue_style( 'lumise-addon-template-clipart-base', $this->get_url('assets/css/base.css?ver=1'), false, '1.0', 'all');
			wp_enqueue_style( 'lumise-addon-template-clipart-style', $this->get_url('assets/css/style.css?ver=1'), false, '1.0', 'all');
		}
		if ( !$this->is_backend() && $lumise->connector->platform == 'php') {
			echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/base.css?ver=1').'">';
			echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/style.css?ver=1').'">';

		}

		// add js
		if(!$this->is_backend() && $lumise->connector->platform == 'woocommerce'){
			wp_enqueue_script( 'lumise_addon_shortcode_template_clipart_js', $this->get_url('assets/js/script.js?ver=1') );
			// wp_localize_script( 'lumise_addon_shortcode_template_clipart_js', 'my_ajax_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ),  'loading_gif' => $this->get_url('assets/images/loading.gif') ) );
		}
		if(!$this->is_backend() && $lumise->connector->platform == 'php'){
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/script.js?ver=1').'"></script>';
		}
	}
	
	/*
		Actions on active or deactive this addon
	*/
	
	static function active() {
		global $lumise;
	}
	
	static function deactive() {
		global $lumise;
	}
	
}