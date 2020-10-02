<?php

global $lumise, $launcher;
	
$active_launcher = $lumise->get_option('active_launcher', '1');

if ($active_launcher != '1') {
?>
<div class="dokan-alert dokan-alert-danger">
    <strong><?php echo $lumise->lang('The design launcher is not available'); ?>.</strong>
</div>
<?php	
} else if (current_user_can( 'dokan_add_product' )) :
	
	include(dirname(__FILE__).DS.'..'.DS.'includes'.DS.'launcher.php');
	
?>
<div class="wrapper">
	<div id="lumiseLauncher" data-site="https://www.lumise.com">
		<p style="padding: 100px 0;text-align: center"><i class="lumise-spinner x4"></i></p>
	</div>
	<div id="lumise-notices"></div>
</div>
<script>
	
	var launcher_data_ajax = "<?php echo esc_url($lumise->cfg->ajax_url); ?>",
		launcher_data_nonce = "<?php echo lumise_secure::create_nonce('LUMISE-INIT'); ?>";

</script>
<script src="<?php echo esc_url($launcher->url.'assets/js/jquery.min.js?version='.LUMISE); ?>""></script>
<script src="<?php echo esc_url($launcher->url.'assets/js/vendors.js?version='.LUMISE); ?>""></script>
<script src="<?php echo esc_url($launcher->url.'assets/js/launcher.js?version='.LUMISE); ?>"></script>
<?php elseif (is_user_logged_in()): ?>
<div class="dokan-alert dokan-alert-danger">
    <strong><?php echo $lumise->lang('It seems you have not been granted the permission to create a new product'); ?>.</strong>
</div>
<?php else: ?>
<div class="dokan-alert dokan-alert-danger">
    <strong><?php echo $lumise->lang('Please login before launching your design'); ?>. <a href="<?php echo esc_url( dokan_get_navigation_url( '' ) ); ?>"><?php echo $lumise->lang('Login now'); ?></a></strong>
</div>
<?php endif; ?>