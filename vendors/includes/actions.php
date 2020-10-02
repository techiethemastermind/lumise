<?php
	
add_action('init', 'lumise_dokan_init', 10);	
add_action('lumise_woo_capabilities', 'lumise_woo_capabilities', 10, 2);	
add_action('dokan_product_edit_after_inventory_variants', 'lumise_dokan_render_product_edit_template', 86, 2);	
add_action('dokan_product_updated', 'lumise_dokan_product_updated', 99, 2);	
add_filter('dokan_get_dashboard_nav', 'lumise_dokan_get_dashboard_nav', 99, 1);
add_action( 'dokan_load_custom_template', 'lumise_dokan_load_template' );
add_filter( 'dokan_query_var_filter', 'lumise_dokan_load_document_menu' );

function lumise_dokan_init() {
	
	global $lumise;
	
	if (isset($_POST['lumise-section']) && $_POST['lumise-section'] == 'template' && !is_admin()) {
		
		$lumise->set_vendor((string)get_current_user_id());
		
		global $lumise_router, $lumise, $lumise_helper, $lumise_admin;
		
		include (LUMISE_CORE_PATH.DS.'..'.DS.'admin'.DS.'admin.php');
	
		$section = 'template';
		$id = isset($_GET['id']) ? $_GET['id'] : 0;
		$uid = get_current_user_id();
		
		$fields = $lumise_admin->process_data(array(
			array(
				'type' => 'input',
				'name' => 'name',
				'label' => $lumise->lang('Name'),
				'required' => true,
				'default' => 'Untitled'
			),
			array(
				'type' => 'input',
				'name' => 'price',
				'label' => $lumise->lang('Price'),
				'default' => 0,
				'numberic' => 'float'
			),
			array(
				'type' => 'categories',
				'cate_type' => 'templates',
				'name' => 'categories',
				'label' => $lumise->lang('Categories'),
				'id' => $id,
				'create_new' => false,
				'db' => false
			),
			array(
				'type' => 'tags',
				'tag_type' => 'templates',
				'name' => 'tags',
				'label' => $lumise->lang('Tags'),
				'id' => $id,
			),
			array(
				'type' => 'upload',
				'file' => 'design',
				'name' => 'upload',
				'path' => 'templates'.DS.date('Y').DS.date('m').DS,
				'thumbn' => 'screenshot',
				'label' => $lumise->lang('Upload template file'),
			),
			array(
				'type' => 'hidden',
				'name' => 'featured',
				'label' => $lumise->lang('Featured'),
				'default' => 'no',
				'value' => null
			),
			array(
				'type' => 'hidden',
				'name' => 'active',
				'label' => $lumise->lang('Active'),
				'default' => 'no',
				'value' => null
			),
			array(
				'type' => 'hidden',
				'name' => 'order',
				'type_input' => 'number',
				'label' => $lumise->lang('Order'),
				'default' => 0
			),
		), 'templates');
		
	}
	
	if (
		isset($_POST['bulk_design_status_change']) && 
		isset($_POST['status']) && 
		isset($_POST['security'])
	) {
		if (
			$_POST['status'] == 'delete' && 
			lumise_secure::check_nonce('LUMISE-SECURITY', $_POST['security'])
		) {
			
			$ids = $_POST['bulk_designs'];
			$uid = get_current_user_id();
			
			$count = 0;
			
			if (is_array($ids) && count($ids) > 0) {
				foreach ($ids as $id) {
					
					$check = $lumise->db->rawQuery(
						sprintf("SELECT `*` FROM `%stemplates` WHERE `id`=%d", $lumise->db->prefix, $id)
					);
					
					if (count($check) > 0 && $check[0]['author'] == $uid) {
						
						$lumise->db->rawQuery(
							sprintf("DELETE FROM `%stemplates` WHERE `id`=%d", $lumise->db->prefix, $id)
						);
						
						unlink($lumise->cfg->upload_path.$check[0]['upload']);
						unlink(str_replace(array($lumise->cfg->upload_url, '/'), array($lumise->cfg->upload_path, DS), $check[0]['screenshot']));
						$count++;
						
					}
					
				}
				
				if ($count > 0) {
					$lumise_msg = array('status' => 'success', 'msg' => 'successfully deleted '.$count.' items');
					$lumise->connector->set_session('lumise_msg', $lumise_msg);
				}
			}
			
			$lumise->redirect(urldecode(dokan_get_navigation_url('designs')));
					
		} else {
			$lumise->redirect(urldecode(dokan_get_navigation_url('designs')));
		}
	}
		
}

function lumise_dokan_render_product_edit_template() {

	include dirname(__FILE__).DS.'..'.DS.'view'.DS.'product.php';
	
}

function lumise_woo_capabilities($cap = '', $_cap = '') {
	
	global $lumise;
			
	if (
		(
			$_cap == 'lumise_can_upload' ||
			$_cap == 'lumise_edit_templates'
		) &&
		isset($_POST['lumise-section']) &&
		$_POST['lumise-section'] == 'template'
	) {
		if (!isset($_GET['id']) || empty($_GET['id'])) {
			return $_cap;
		} else {
			
			if (lumise_check_permission_design($_GET['id'])) {
				return $_cap;
			} else {
				return $cap;
			}
			
		}
	}
	
	return $cap;
	
}

function lumise_check_permission_design($id = 0) {
	
	global $lumise;
	
	$uid = get_current_user_id();
	
	$check = sprintf("SELECT * FROM `%s` WHERE `id`=%d", $lumise->db->prefix.'templates', $id);
	$check = $lumise->db->rawQuery($check);
	
	if (
		count($check) > 0 &&
		$check[0]['author'] == $uid
	) {
		return true;
	} else return false;
	
}

function lumise_dokan_product_updated($post_id, $postdata) {
	global $lumise_woo;
	// $_POST['lumise_design_template']
	// Kiem tra permission cua template co thuoc current user 
	
	$lumise_woo->woo_process_product_meta_fields_save($post_id, $postdata);
	
}

function lumise_dokan_get_dashboard_nav($urls) {
	
	global $lumise;
	
	$urls['designs'] = array(
        'title'      => $lumise->lang('Designs'),
        'icon'       => '<i class="fa fa-star"></i>',
        'url'        => dokan_get_navigation_url('designs'),
        'pos'        => 31,
        'permission' => 'dokan_view_overview_menu'
    );
    
    $urls['launcher'] = array(
        'title'      => $lumise->lang('Launcher'),
        'icon'       => '<i class="fa fa-send"></i>',
        'url'        => dokan_get_navigation_url('design-launcher'),
        'pos'        => 32,
        'permission' => 'dokan_view_overview_menu'
    );
        
	return $urls;
	
}

function lumise_dokan_load_template( $query_vars ) {
	
	if ( isset( $query_vars['designs'] ) ) {
        include dirname(__FILE__).DS.'..'.DS.'view'.DS.'designs.php';
    } else if ( isset( $query_vars['design'] ) ) {
        include dirname(__FILE__).DS.'..'.DS.'view'.DS.'design.php';
    } else if ( isset( $query_vars['design-launcher'] ) ) {
        include dirname(__FILE__).DS.'..'.DS.'view'.DS.'launcher.php';
    }
}

function lumise_dokan_load_document_menu( $query_vars ) {
	
    $query_vars['designs'] = 'designs';
    $query_vars['design'] = 'design';
    $query_vars['design-launcher'] = 'design-launcher';
    
    return $query_vars;
    
}
