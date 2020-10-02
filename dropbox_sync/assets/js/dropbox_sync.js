 /*
 *
 * Lumise Addon Dropbox Sync
 *
 * https://www.lumise.com
 * Copyright 2018-2019 : Lumise product designer tool
 * All rights reserved by Lumise Inc
 *
 * This source code is licensed under non-distrbutable rights of Lumise
 * https://www.lumise.com/terms-conditions/
 *
 */
 
function lumise_addon_dropbox_sync( lumise ) {
	
	if (typeof lumise.cart.process_add_cart != 'function') {
		
		return;
		
		lumise.cart.add_cart = function(e) {
			
			var invalid_fields = [], attrs = $('.lumise-cart-attributes');
			
			/*
			*	Check cart_design empty
			*/
			
			Object.keys(lumise.data.stages).map(function(s) {
				if (
					typeof lumise.data.stages[s] !== 'undefined' && 
					typeof lumise.data.stages[s].canvas !== 'undefined'
				){
					var canvas = lumise.data.stages[s].canvas,
						objs = canvas.getObjects();
					objs.map(function (obj){
						if(obj.evented == true) has_design++;
					});
				};
				cart_data[id].stages++;
				if (cart_data[id].screenshot === '')
					cart_data[id].screenshot = lumise.data.stages[s].image;
			});
			
			if (has_design === 0) {
				lumise.fn.notice(lumise.i(96), 'error');
				delete cart_data;
				delete cart_design;
				return false;
			};
			
			/*
			*	Check printing
			*/
			
			if(
				lumise.data.printings.length > 0 && 
				lumise.cart.printing.current === null
			){
				inv = $('.lumise-prints').find('.lumise-cart-field-printing-tmpl').get(0);
				if (inv !== undefined)
					invalid_fields.push(inv);
				$('.lumise-prints').find('.lumise-cart-field-printing-tmpl .lumise-required-msg').html(lumise.i(99));
			};
				
			attrs.find('em.lumise-required-msg').remove();
			attrs.find('.lumise-cart-param').each(function (ind) {
				
				var field	= $(this),
					name	= field.attr('name'),
					found	= false;
				
				if (field.prop('required')) {
					if(
						this.value === '' &&
						invalids.indexOf(name) === -1
					){
						invalids.push(name);
						invalid_fields.push(field.closest('.lumise-cart-field')[0]);
						field.after(
							'<em class="lumise-required-msg">'+
							lumise.i(102)+
							'</em>'
						).closest('.lumise_form_group').shake();
					}
	    		}
			});
			
			if (invalid_fields.length > 0) {
				
				var wrp = $('#lumise-cart-wrp'),
					pos = invalid_fields[0].offsetTop;
				
				if (wrp.closest('#lumise-product').length > 0) {
					$('#lumise-left .lumise-left-nav li[data-tab="product"]').trigger('click');
					$('#lumise-product').show().animate({scrollTop: pos - 20}, 400);
				} else wrp.animate({scrollTop: pos - 20}, 400);
				
				lumise.fn.notice(lumise.i(179), 'error', 3500);
				
				delete cart_data;
				delete cart_design;
				return false;
				
			};
			
			/*
			*
			*	END OF VALID OPTIONS
			*
			*/
			
			
			var cart_design			= lumise.fn.export('cart'),
				start_render 		= 0,
				export_print_file 	= function(s) {
					
					start_render++;
					
					lumise.active_stage(s, function() {
						
						$('#LumiseDesign').attr({
							'data-processing': 'true',
							'data-msg': lumise.i('render')
						});
							
						lumise.get.el('zoom').val('100').trigger('input');
						
						lumise.fn.uncache_large_images(function() {
								
							var psize = lumise.get.size();
							lumise.f(false);
							
							lumise.fn.download_design({
								type: 'png',
								orien: psize.o,
								height: psize.h,
								width: psize.w,
								include_base: false,
								callback: function(data) {
									
									lumise.fn.uncache_large_images(null, true);
									
									cart_design.stages[s].print_file = data;	
									
									if (Object.keys(lumise.data.stages)[start_render] !== undefined) {
										export_print_file (Object.keys(lumise.data.stages)[start_render]);
									} else return lumise.cart.process_add_cart(cart_design);
									
								}	
							});
						
						}); /* End uncache */
						
					});
						
				};
			
			$('#LumiseDesign').attr({'data-processing': 'true', 'data-msg': 'Preparing cart data'});
			
			export_print_file(Object.keys(lumise.data.stages)[start_render]);
			
			if (e !== undefined && typeof e.preventDefault == 'function')
				e.preventDefault();
			
		};
		
		lumise.cart.process_add_cart = function(cart_design) {
				
			lumise.f(false);
					
			var values			= [],
				invalids		= [],
				invalid_fields	= [],
				inv				= null,
				id				= lumise.fn.url_var('cart', new Date().getTime().toString(36).toUpperCase()),
				cart_data		= JSON.parse(localStorage.getItem('LUMISE-CART-DATA') || '{}'),
				has_design		= 0;
			
			cart_data[id] = {
				id			: id,
			    screenshot	: '',
				stages		: 0,
				name		: lumise.ops.product_data.name,
				updated		: new Date().getTime(),
				product		: lumise.ops.product_data.id,
				product_cms : lumise.ops.product_data.product,
				printing	: lumise.cart.printing.current,
				printings_cfg : lumise.data.printings_cfg,
				options		: $.extend(true, {}, lumise.cart.data.options),
				attributes	: $.extend(true, {}, lumise.ops.product_data.attributes),
				price_total	: lumise.cart.get_price(),
				extra		: $.extend(true, {}, lumise.cart.price.extra),
			    states_data : $.extend(true, {}, lumise.cart.printing.states_data),
			    variation	: lumise.data.variation,
				template	: {
					'stages'	: lumise.cart.template,
					'price'		: lumise.cart.price.template
				},
				system_version : lumise.data.version
			};
			
			Object.keys(lumise.cart.data.options).map(function (i){
				values.push(lumise.cart.data.options[i]);
			});
			
			
			lumise.cart.qty = parseInt(lumise.cart.qty);
			
			if (isNaN(lumise.cart.qty) || lumise.cart.qty == 0) 
				lumise.cart.qty = 1;
			
			cart_data = lumise.apply_filters('cart_data', cart_data);
			cart_design = lumise.apply_filters('cart_design', cart_design);
			
			localStorage.setItem('LUMISE-CART-DATA', JSON.stringify(cart_data));
			
			cart_design.id = id;
			lumise.indexed.save([cart_design], 'cart');
			
			delete cart_design;
			delete cart_data;
			
			lumise.render.cart_confirm();
			lumise.render.cart_change();
			lumise.actions.do('add-cart', id); 
	
			return true;
			
		}
		
	}
			
}

