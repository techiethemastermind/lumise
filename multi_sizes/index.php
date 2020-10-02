<?php
/*
Name: Multi Sizes
Description: Allow users add quantity for multi sizes in the same time
Version: 1.0
Compatible: 1.7.1
*/

class lumise_addon_multi_sizes extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_multi_sizes');
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		
		$lumise->add_filter('product_attributes', array(&$this, 'product_attributes'));
		
	}
	
	public function product_attributes($attributes) {
		
		global $lumise;
		
		$attributes['sizes'] = array(
			'label' => $lumise->lang('Multi Sizes'),
			'unique' => true,
			'render' => <<<EOF
				
				if (data.value === undefined || data.value === '')
					data.value = [1];
				else if (typeof data.value == 'string')
					data.value = data.value.split(',');
				
				var el = '<div class="lumise-cart-field-sizes-quantity">'
				
				if (typeof data.values == 'object') {
					
					data.values.map(function (op, i){
						
						el += '<p style="padding: 0 0 5px 0;margin: 0px;">\
								<strong style="padding: 8px 6px 0 0;display: inline-block;min-width:50px;">'+op.title+'</strong>\
								<input style="display:inline-block; float: none;padding: 0 10px;font-size: 14px;" type="number" min="0" step="1" data-size="'+op.value+'" value="'+(data.value[i] !== undefined ? data.value[i].toString().replace(/[^0-9\.]/g, '') : 0)+'"/>\
								</p>'
					});
					
				};
					
				el += '<input type="hidden" class="lumise-cart-param" name="'+data.id+'" value="'+data.value+'"/>';
				el += '<style type="text/css">#lumise-cart-attributes>div[data-type="quantity"] {display: none;}</style>';
				el += '</div>';
				
				var new_op = $(el);
				
				new_op.find('input[data-size]').on('change', function(e) {
					var val = [], qty = 0;
					new_op.find('input[data-size]').each(function() {
						this.value = parseInt(this.value) > 0 ? parseInt(this.value) : 0;
						qty += parseInt(this.value);
						val.push(this.getAttribute('data-size')+': '+this.value);
						$('#lumise-cart-attributes>div[data-type="quantity"] input.lumise-cart-param').val(qty).change();
					});
					new_op.find('input.lumise-cart-param').val(val.join(', ')).change();
				});
				
				return new_op;
					
EOF
		);
		
		return $attributes;
		
	}
	
	public function editor_footer() {
		
		global $lumise;
		
		if (!$this->is_backend()) {
			//echo '<script type="text/javascript" src="'.$this->get_url('multi_sizes.js?ver=1').'"></script>';
		}
	}

	static function active() {

	}
	
}