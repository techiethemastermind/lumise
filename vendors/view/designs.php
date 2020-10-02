<?php

global $lumise_router, $lumise, $lumise_helper, $lumise_admin;

include (LUMISE_CORE_PATH.DS.'..'.DS.'admin'.DS.'admin.php');

$main_url = dokan_get_navigation_url('designs');

$title = "templates";
$prefix = 'templates_';
$currency = isset($lumise->cfg->settings['currency']) ? $lumise->cfg->settings['currency'] : '';

// Action Form
if (isset($_POST['action_submit']) && !empty($_POST['action_submit'])) {

	$data_action = isset($_POST['action']) ? $_POST['action'] : '';
	$val = isset($_POST['id_action']) ? $_POST['id_action'] : '';
	$val = explode(',', $val);
	
	$lumise_admin->check_caps('templates');

	foreach ($val as $value) {

		$dt = $lumise_admin->get_row_id($value, 'templates');
		
		switch ($data_action) {

			case 'active':
				$data = array(
					'active' => 1
				);
				$dt = $lumise_admin->edit_row( $value, $data, 'templates' );
				break;
			case 'deactive':
				$data = array(
					'active' => 0
				);
				$dt = $lumise_admin->edit_row( $value, $data, 'templates' );
				break;
			case 'delete':

				$arr = array("id","item_id");
				$cate_reference = $lumise_admin->get_rows_custom($arr, 'categories_reference', $orderby = 'id', $order='asc');

				foreach ($cate_reference as $vals) {
					if ($vals['item_id'] == $value) {
						$lumise_admin->delete_row($vals['id'], 'categories_reference');
					}
				}

				$arr = array("id","item_id");
				$tag_reference = $lumise_admin->get_rows_custom($arr, 'tags_reference', $orderby = 'id', $order='asc');

				foreach ($tag_reference as $vals) {
					if ($vals['item_id'] == $value) {
						$lumise_admin->delete_row($vals['id'], 'tags_reference');
					}
				}

				$tar_file = realpath($lumise->cfg->upload_path).DS;
				if (!empty($dt['upload'])) {
					if (file_exists($tar_file.$dt['upload'])) {
						unlink($tar_file.$dt['upload']);
						unlink(str_replace(array($lumise->cfg->upload_url, '/'), array($lumise->cfg->upload_path, DS), $dt['screenshot']));
					}
				}
				
				$lumise_admin->delete_row($value, 'templates');

				break;
			default:
				break;

		}

	}

}

// Search Form
$data_search = '';
if (isset($_GET['search_template']) && !empty($_GET['search_template'])) {
	
	$data_search = isset($_GET['search']) ? esc_html($_GET['search']) : '';

	if (empty($data_search)) {
		$errors = 'Please Insert Key Word';
		$_SESSION[$prefix.'data_search'] = '';
	} else {
		$_SESSION[$prefix.'data_search'] = 	$data_search;
	}

}

if (!empty($_SESSION[$prefix.'data_search'])) {
	$data_search = '%'.$_SESSION[$prefix.'data_search'].'%';
}

if (isset($_GET['categories'])) {
	$_SESSION[$prefix.'category'] = $_GET['categories'];
}


$per_page = 20;

$default_filter = array();

$orderby  = 'created';
$ordering = 'desc';
$dt_order = 'created_desc';
$dt_category = isset($_SESSION[$prefix.'category']) ? $_SESSION[$prefix.'category'] : '';

// Get row pagination
$current_page = isset($_GET['tpage']) ? $_GET['tpage'] : 1;

$where = array("tmpl.author = '".get_current_user_id()."'");

if (!empty($data_search))
    array_push($where, "tmpl.name LIKE '$data_search' OR tmpl.tags LIKE '$data_search'");
if (!empty($dt_category))
    array_push($where, "cate.category_id = '$dt_category'");
if ($dt_order == 'featured')
	array_push($where, "tmpl.featured = '1'");
else if ($dt_order == 'active')
	array_push($where, "tmpl.active = '1'");
else if ($dt_order == 'deactive')
	array_push($where, "tmpl.active <> '1'");

$select = "SELECT SQL_CALC_FOUND_ROWS tmpl.* FROM {$lumise->db->prefix}templates tmpl ";

$query = array(
	($dt_category !== '') ? "LEFT JOIN {$lumise->db->prefix}categories_reference cate ON cate.item_id = tmpl.id" : '',
	count($where) > 0 ? "WHERE ".implode(' AND ', $where) : "",
	"GROUP BY tmpl.id"
);

$start = ( $current_page - 1 ) *  $per_page;
array_push($query, "ORDER BY ".$orderby." ".$ordering);
array_push($query, "LIMIT ".$start.",".$per_page);

$templates = $lumise->db->rawQuery($select.implode(' ', $query));
$total_records = $lumise->db->rawQuery("SELECT FOUND_ROWS() AS count");
    
if (count($total_records) > 0 && isset($total_records[0]['count'])) {
	$total_records = $total_records[0]['count'];
} else $total_records = 0;

$config = array(
	'current_page'  => $current_page,
	'total_record'  => $total_records,
	'total_page'    => ceil($total_records/$per_page),
	    'limit'         => $per_page,
    'link_full'     => $main_url.'?tpage={page}',
    'link_first'    => $main_url,
);

$lumise_pagination->init($config);


?>
<div class="dokan-dashboard-wrap">
    <?php

        /**
         *  dokan_dashboard_content_before hook
         *
         *  @hooked get_dashboard_side_navigation
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_before' );
    ?>

    <div class="dokan-dashboard-content dokan-product-listing">

        <?php

            /**
             *  dokan_dashboard_content_before hook
             *
             *  @hooked show_seller_dashboard_notice
             *
             *  @since 2.4
             */
            do_action( 'dokan_help_content_inside_before' );
        ?>
		<?php $lumise->views->header_message(); ?> 
        <article class="dokan-product-listing-area">

            <div class="product-listing-top dokan-clearfix">
				<span class="dokan-add-product-link">
                    <a href="<?php echo dokan_get_navigation_url('design'); ?>" class="dokan-btn dokan-btn-theme">
                    	<i class="fa fa-star">&nbsp;</i>
                        <?php echo $lumise->lang('Add new design'); ?>                 
                    </a>
				</span>
				<?php
					$lumise_page = isset($_GET['lumise-page']) ? $_GET['lumise-page'] : '';
					echo $lumise_helper->breadcrumb($lumise_page);
				?>
             </div>
			<div class="lumise_option">
				<form action="<?php echo esc_url($main_url); ?>" method="get" class="dokan-form-inline dokan-w6 dokan-product-date-filter">
					<div class="dokan-form-group">
						<select name="categories" class="dokan-form-control" data-action="submit" style="width:150px">
							<option value="">-- <?php echo $lumise->lang('Categories'); ?> --</option>
							<?php
								$cates = $lumise_admin->get_categories('templates');
								foreach ($cates as $cate) {
									echo '<option '.(
										$dt_category==$cate['id'] ? 
										'selected' : 
										''
									);
									echo ' value="'.$cate['id'].'">'.str_repeat('&mdash;', $cate['lv']).' '.$cate['name'].'</option>';
								}
							?>
						</select>
					</div>
					<button type="submit" name="product_listing_filter" value="ok" class="dokan-btn dokan-btn-theme"><?php echo $lumise->lang('Filter'); ?></button>
				</form>
				<form action="<?php echo esc_url($main_url); ?>" method="get" class="dokan-form-inline dokan-w6 dokan-product-search-form">
					<button type="submit" name="product_listing_search" value="1" class="dokan-btn dokan-btn-theme"><?php echo $lumise->lang('Search'); ?></button>
					<div class="dokan-form-group">
						<input type="search" name="search" class="dokan-form-control" placeholder="<?php echo $lumise->lang('Search ...'); ?>" value="<?php echo (isset($_SESSION[$prefix.'data_search']) ? $_SESSION[$prefix.'data_search'] : ''); ?>">
					</div>
					<input type="hidden" name="search_template" value="1" />
				</form>
			</div>
			
		<?php if (count($templates) > 0) { ?>
			<form id="product-filter" method="POST" class="dokan-form-inline">
				<div class="dokan-form-group">
	                <label for="bulk-design-action-selector" class="screen-reader-text">
	                	<?php echo $lumise->lang('Select bulk action'); ?>
	                </label>
	                <select name="status" id="bulk-design-action-selector" class="dokan-form-control chosen">
	                        <option class="bulk-design-status" value="-1"><?php echo $lumise->lang('Bulk Actions'); ?></option>
	                        <option class="bulk-design-status" value="delete"><?php echo $lumise->lang('Delete Permanently'); ?></option>
	                </select>
	            </div>
                <div class="dokan-form-group">
                    <input type="hidden" id="security" name="security" value="<?php echo lumise_secure::create_nonce('LUMISE-SECURITY'); ?>">                         
                    <input type="submit" name="bulk_design_status_change" class="dokan-btn dokan-btn-theme" value="Apply">
                </div>
				<div class="lumise_wrap_table">
					<table class="lumise_table lumise_templates">
						<thead>
							<tr>
								<th class="lumise_check" width="50">
									<label for="cb-select-all"></label>
									<input id="cb-select-all" class="dokan-checkbox" type="checkbox">
								</th>
								<th><?php echo $lumise->lang('Name'); ?></th>
								<th><?php echo $lumise->lang('Screenshot'); ?></th>
								<th><?php echo $lumise->lang('Categories'); ?></th>
								<th><?php echo $lumise->lang('Created'); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php
	
								if ( is_array($templates) && count($templates) > 0 ) {
	
									foreach ($templates as $value) { ?>
	
										<tr>
											<td class="lumise_check" width="50">
												<div class="lumise_checkbox">
													<input type="checkbox" name="bulk_designs[]" class="cb-select-items dokan-checkbox" value="<?php if(isset($value['id'])) echo esc_attr($value['id']); ?>" class="action" id="<?php if(isset($value['id'])) echo esc_attr($value['id']); ?>">
													<label for="<?php if(isset($value['id'])) echo esc_attr($value['id']); ?>"><em class="check"></em></label>
												</div>
											</td>
											<td class="lumise-resource-title">
												<a href="<?php echo dokan_get_navigation_url('design'); ?>?id=<?php if(isset($value['id'])) echo esc_attr($value['id']); ?>" class="name"><?php if(isset($value['name'])) echo esc_html($value['name']); ?></a>
											</td>
											<td><?php if(isset($value['screenshot'])) echo '<img height="120" src="'.esc_url($value['screenshot']).'" />'; ?></td>
											<td>
												<?php
													$value['id'] = isset($value['id']) ? $value['id'] : '';
													$dt = $lumise_admin->get_category_item($value['id'], 'templates');
													$dt_name = array();
	
													foreach ($dt as $val) {
														$dt_name[] = $val['name'];
													}
													echo esc_html(implode(', ', $dt_name));
												?>
											</td>
											<td>
												<?php echo date('M d, Y h:i a', strtotime($value['created'])); ?>
											</td>
										</tr>
	
									<?php }
	
								}
	
							?>
						</tbody>
					</table>
				</div>
			</form>
			<div class="dokan-pagination-container">
				<div class="dokan-pagination">
					<?php echo $lumise_pagination->pagination_html(); ?>
				</div>
			</div>

		<?php } else {
					if ($total_records > 0) {
						echo '<p class="no-data">'.$lumise->lang('Apologies, but no results were found.').'</p>';
						$_SESSION[$prefix.'data_search'] = '';
						echo '<a href="'.esc_url($lumise->cfg->admin_url).'lumise-page=templates" class="btn-back"><i class="fa fa-reply" aria-hidden="true"></i>'.$lumise->lang('Back To Lists').'</a>';
					}
					else echo '<p class="no-data">'.$lumise->lang('No data. Please add template.').'</p>';
			}?>
            
        </article>

         <?php

            /**
             *  dokan_dashboard_content_inside_after hook
             *
             *  @since 2.4
             */
            do_action( 'dokan_dashboard_content_inside_after' );
        ?>


    </div><!-- .dokan-dashboard-content -->

    <?php

        /**
         *  dokan_dashboard_content_after hook
         *
         *  @since 2.4
         */
        do_action( 'dokan_dashboard_content_after' );
    ?>

</div><!-- .dokan-dashboard-wrap -->