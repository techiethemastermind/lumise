<?php
	
	global $lumise;
	global $wpdb;
			
	$id = get_the_ID();
	$ops = array();
	$js_cfg = array();
	
?>
<div class="dokan-other-options dokan-edit-row dokan-clearfix ">
    <div class="dokan-section-heading" data-togglehandler="dokan_other_options">
        <h2>
	        <i class="fa fa-cog" aria-hidden="true"></i> 
	        <?php echo $lumise->lang('Custom Design'); ?>
	    </h2>
        <p><?php echo $lumise->lang('Set the customize options'); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fa fa-sort-desc fa-flip-vertical" aria-hidden="true" style="margin-top: 9px;"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>
    <div id="lumise_product_data" class="dokan-section-content">
	<?php
		
		$ops['inline_edit'] = false;
		$ops['lumise_product_base'] = (INT)get_post_meta($id, 'lumise_product_base', true );
		$ops['lumise_design_template'] = get_post_meta($id, 'lumise_design_template', true );
		$ops['lumise_customize'] = get_post_meta($id, 'lumise_customize', true );
		$ops['lumise_disable_add_cart'] = get_post_meta($id, 'lumise_disable_add_cart', true );
			
		if (!empty($ops['lumise_product_base'])) {
			
			$query = "SELECT `name`,`stages`,`attributes` FROM `{$lumise->db->prefix}products` WHERE `id`={$ops['lumise_product_base']}";
			$data = $wpdb->get_results($query);
			
			if (isset($data[0]) && isset($data[0]->stages)) {
		    	
		    	$color = $lumise->lib->get_color($data[0]->attributes);
		    	
		    	$js_cfg['current_data'] = array(
					'id' => $ops['lumise_product_base'],
					'name' => $data[0]->name,
					'color' => $color,
					'stages' => $data[0]->stages,
				);
				
				$stage = $lumise->lib->dejson($data[0]->stages);
				
			}
		}
		
		if (!empty($ops['lumise_design_template'])) {
			
			$designs = json_decode(rawurldecode($ops['lumise_design_template']));
			
			foreach($designs as $s => $d) {
		    	
		    	$data = $wpdb->get_results("SELECT `name`,`screenshot` FROM `{$lumise->db->prefix}templates` WHERE `id`=".$d->id);
		    	if (isset($data[0]))
		        	$designs->{$s}->screenshot = $data[0]->screenshot;
		        else unset($designs->{$s});
		        
			}
			
			$js_cfg['current_design'] = $designs;
			
		}
		
		lumise_cms_product_data_fields($ops, $js_cfg, $id);
	
	?>
	</div>
</div>
<script type="text/javascript">
	lumisejs.admin_ajax_url = '<?php echo esc_url($lumise->cfg->ajax_url); ?>';	
</script>