<?php
/**
 *  Dokan Dashboard Template
 *
 *  Dokan Main Dahsboard template for Fron-end
 *
 *  @since 2.4
 *
 *  @package dokan
 */
 
				
global $lumise_router, $lumise, $lumise_helper, $lumise_admin;

$lumise->set_vendor((string)get_current_user_id());

include (LUMISE_CORE_PATH.DS.'..'.DS.'admin'.DS.'admin.php');
				
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

    <div class="dokan-dashboard-content">

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

        <article class="help-content-area">
			<?php
			
			$section = 'template';
			$id = isset($_GET['id']) ? $_GET['id'] : 0;
			
			if ($id !== 0 && !lumise_check_permission_design($id)) {
			
			?>
				<div class="lumise_message err">
					<em class="lumise_err">
						<i class="fa fa-times"></i> 
						<?php echo $lumise->lang('Sorry, You do not have permission to edit this design.'); ?>
						<a href="<?php echo dokan_get_navigation_url('design'); ?>">
	                    	<?php echo $lumise->lang('Add new design'); ?>                 
	                    </a>
					</em>
				</div>
			<?php	
			} else {
				
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
						'numberic' => 'float',
						'desc' => $lumise->lang('Enter price for this design.')
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
						'desc' => $lumise->lang('Example: tag1, tag2, tag3 ...'),
					),
					array(
						'type' => 'upload',
						'file' => 'design',
						'name' => 'upload',
						'path' => 'templates'.DS.date('Y').DS.date('m').DS,
						'thumbn' => 'screenshot',
						'label' => $lumise->lang('Upload design file'),
						'desc' => $lumise->lang('Upload the exported template file *.LUMI or your completed design under *.PNG.').'<br>'.$lumise->lang('You can download the LUMI file via menu "File" > Save As File, or press Ctrl+Shift+S')
					)
				), 'templates');
			
			?>
			
			<div class="lumise_wrapper" id="lumise-<?php echo esc_attr($section); ?>-page">
				<div class="lumise_content">
					<?php 
						if ($id === 0) {
							echo '<h3>'.$lumise->lang('Add new design').'</h3>';
						} else {
					?>
						<a href="<?php echo dokan_get_navigation_url('design'); ?>" class="dokan-btn dokan-btn-theme dokan-add-new-product">
	                    	<i class="fa fa-star">&nbsp;</i>
	                        <?php echo $lumise->lang('Add new design'); ?>                 
	                    </a>
						<h3><?php echo $lumise->lang('Edit design'); ?></h3>
					<?php } ?>
					<form action="<?php echo dokan_get_navigation_url('design').'?lumise-page='.esc_attr($section.(isset($_GET['id']) ? '&id='.$_GET['id'] : '')); ?>" id="lumise-<?php echo $section; ?>-form" method="post" class="lumise_form" enctype="multipart/form-data">
			
						<?php $lumise->views->header_message(); ?>
						<?php $lumise->views->tabs_render($fields); ?>
			
						<div class="lumise_form_group lumise_form_submit">
							<input type="submit" value="<?php echo $lumise->lang('Save Design'); ?>"/>
							<input type="hidden" name="do" value="action" />
							<a class="lumise_cancel" href="<?php echo dokan_get_navigation_url('designs'); ?>">
								<?php echo $lumise->lang('Cancel'); ?>
							</a>
							<input type="hidden" name="redirect" value="<?php echo urlencode(dokan_get_navigation_url('design')); ?>">
							<input type="hidden" name="lumise-section" value="<?php echo esc_attr($section); ?>">
						</div>
					</form>
				</div>
			</div>
			<script type="text/javascript">
				
				var lumise_upload_url = '<?php echo esc_url($lumise->cfg->upload_url); ?>',
					lumise_assets_url = '<?php echo esc_url($lumise->cfg->assets_url); ?>';
					
			</script>
			
			<?php } ?>
			
        </article><!-- .dashboard-content-area -->

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
<script type="text/javascript">
	<?php $lumise->set_vendor(''); ?>
	window.LumiseDesign = {
		url : "<?php echo htmlspecialchars_decode($lumise->cfg->url); ?>",
		admin_url : "<?php echo htmlspecialchars_decode($lumise->cfg->admin_url); ?>",
		ajax : "<?php echo htmlspecialchars_decode($lumise->cfg->ajax_url); ?>",
		assets : "<?php echo esc_url($lumise->cfg->assets_url); ?>",
		nonce : "<?php echo lumise_secure::create_nonce('LUMISE_NONCE') ?>",
	}
</script>
<script type="text/javascript" src="<?php echo esc_url($lumise->cfg->upload_url); ?>addons/vendors/assets/js/script.js"></script>