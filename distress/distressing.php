<?php
	global $lumise;

	$section = 'distressing';
	$fields = $lumise_admin->process_data(array(
		array(
			'type' => 'input',
			'name' => 'name',
			'label' => $lumise->lang('Name'),
			'required' => true,
			'default' => 'Untitled'
		),
		array(
			'type' => 'upload',
			'name' => 'upload',
			'path' => 'distress'.DS.date('Y').DS.date('m').DS,
			'thumbn' => 'thumbnail_url',
			'label' => $lumise->lang('Upload distress file'),
			'desc' => $lumise->lang('Supported files svg, png, jpg, jpeg. Max size 5MB')
		),
		array(
			'type' => 'input',
			'name' => 'price',
			'label' => $lumise->lang('Price'),
			'default' => 0
		),
		array(
			'type' => 'toggle',
			'name' => 'featured',
			'label' => $lumise->lang('Featured'),
			'default' => 'no',
			'value' => null
		),
		array(
			'type' => 'toggle',
			'name' => 'active',
			'label' => $lumise->lang('Active'),
			'default' => 'yes',
			'value' => null
		),
		array(
			'type' => 'input',
			'name' => 'order',
			'type_input' => 'number',
			'label' => $lumise->lang('Order'),
			'default' => 0,
			'desc' => $lumise->lang('Ordering of item with other.')
		),
	), 'distress');

?>

<div class="lumise_wrapper" id="lumise-<?php echo $section; ?>-page">
	<div class="lumise_content">
		<?php
			$lumise->views->detail_header(array(
				'add' => '<i class="fa fa-plus"></i> '.$lumise->lang('Add New Distress'),
				'edit' => $lumise->lang('Edit Distress'),
				'page' => $section
			));
		?>
		<form action="<?php echo $lumise->cfg->admin_url; ?>lumise-page=<?php
			echo $section.(isset($_GET['callback']) ? '&callback='.$_GET['callback'] : '');
		?>" id="lumise-distress-form" method="post" class="lumise_form" enctype="multipart/form-data">

			<?php $lumise->views->tabs_render($fields); ?>

			<div class="lumise_form_group lumise_form_submit">
				<input type="submit" value="<?php echo $lumise->lang('Save Distress'); ?>"/>
				<input type="hidden" name="do" value="action" />
				<a class="lumise_cancel" href="<?php echo $lumise->cfg->admin_url;?>lumise-page=distressings">
					<?php echo $lumise->lang('Cancel'); ?>
				</a>
				<input type="hidden" name="lumise-section" value="<?php echo $section; ?>">
			</div>
		</form>
	</div>
</div>
