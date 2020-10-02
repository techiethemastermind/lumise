function lumise_addon_background(lumise) {

	$('.lumise-product-price').hide();

	window.lm = lumise;
	window.premium = [];

	var add_bg = function (url, price, mode, cb) {

			var stage = lumise.stage(),
				objects = stage.canvas.getObjects();

			lumise.f('Loading..');
			fabric.util.loadImage(url, function (img) {

				// Process mode here
				var ops = {
					left: stage.canvas.width / 2,
					top: (stage.canvas.height - 40) / 2,
					width: stage.product.width,
					height: stage.product.height,
					selectable: false,
					evented: false,
					url: url,
					price: price
				};

				stage.backgrounds = new fabric.Image(img);
				stage.backgrounds.set(ops);

				objects.splice(1, 0, stage.backgrounds);

				lumise.f(false);
				bg_image_mode(mode);

				stage.canvas.renderAll();

				if (typeof cb == 'function')
					cb();

			});

			if (mode != $('#lumise-addon-background-options').val())
				$('#lumise-addon-background-options option[value="' + mode + '"]').prop({
					selected: true
				});

			lumise.tools.discard();

		},

		bg_image_mode = function (mode) {

			var stage = lumise.stage();

			if (
				stage.backgrounds === undefined ||
				stage.backgrounds.get('url') === undefined ||
				stage.backgrounds.get('mode') == mode
			) return;

			stage.backgrounds.set({
				'mode': mode
			});

			var cv = document.createElement('canvas'),
				ctx = cv.getContext('2d'),
				img = new Image();

			cv.width = stage.product.width;
			cv.height = stage.product.height;

			lumise.f('Loading..');
			img.onload = function () {

				if (mode == 'fill') {

					var w = stage.product.width,
						h = stage.product.width * (this.height / this.width),
						l = 0,
						t = -(h - stage.product.height) / 2;

					if (h < stage.product.height) {
						w = stage.product.height * (this.width / this.height);
						h = stage.product.height;
						t = 0;
						l = -(w - stage.product.width) / 2;
					}

					ctx.drawImage(this, l, t, w, h);

				} else if (mode == 'fit') {

					var w = stage.product.width,
						h = stage.product.width * (this.height / this.width),
						l = 0,
						t = (stage.product.height - h) / 2;

					if (h > stage.product.height) {
						w = stage.product.height * (this.width / this.height);
						h = stage.product.height;
						t = 0;
						l = (stage.product.width - w) / 2;
					}

					ctx.drawImage(this, l, t, w, h);

				} else if (mode == 'tile') {

					var rows = Math.ceil(stage.product.height / this.height),
						cols = Math.ceil(stage.product.width / this.width);

					for (var i = 0; i < rows; i++) {
						for (var j = 0; j < cols; j++) {
							ctx.drawImage(this, j * this.width, i * this.height);
						}
					}

					ctx.drawImage(this, l, t, w, h);

				} else if (mode == 'stretch') {
					ctx.drawImage(this, 0, 0, cv.width, cv.height);
				}

				stage.backgrounds.setElement(cv);
				stage.backgrounds.set({
					width: stage.product.width,
					height: stage.product.height
				});

				stage.canvas.renderAll();
				lumise.stack.save();

				lumise.f(false);

			};

			img.src = stage.backgrounds.get('url');

		};

	lumise.design.nav.load.backgrounds = function (e) {

		lumise.xitems.load('backgrounds', {

			preview: 'image', // image|template

			load: function (res) {
				$('#lumise-backgrounds-list ul li').css({
					display: ''
				});
				return res;
			},
			response: function (res) {
				if ($('#lumise-backgrounds-list ul li.do-empty').length === 0) {
					$('#lumise-backgrounds-list ul').prepend('<li title="Empty background" style="" class="lumise-xitem do-empty" data-ops="[{&quot;empty&quot;: true}]"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-300 -200 800 800" xml:space="preserve"><path fill="#ff11009e" d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312   c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z"></path></svg></li>');
				}
				return res;
			},
			click: function (data) {

				var stage = lumise.stage(),
					objects = stage.canvas.getObjects();

				if (data.empty === true) {

					lumise.stack.save();
					stage.canvas.remove(stage.backgrounds);
					delete stage.backgrounds;
					lumise.stack.save();

					init_bg();

					return;
				};

				var mode = $('#lumise-addon-background-options').val();

				if (stage.backgrounds === undefined) {
					add_bg(data.url, data.price, mode, lumise.stack.save);
				} else {
					stage.backgrounds.set({
						url: data.url,
						price: data.price,
						mode: null
					});
					bg_image_mode(mode);
				}

				change_bg_theme('bg', data.url, data.price);
			}
		});

		// When click Nav
		$('#lumise-backgrounds>header>button[data-nav]').off('click').on('click', function (e) {
			var wrp = $(this).closest('#lumise-backgrounds'),
				nav = this.getAttribute('data-nav'),
				tab = wrp.find('div[data-tab="' + nav + '"]');

			if (nav == 'textures') {

				if ($('#lumise-textures-list ul li').length === 0) {

					$('#lumise-textures-list').html($('<ul class="lumise-list-items lumise-list-xitems"><i class="lumise-spinner white x3 mt2"></i></ul>'));

					lumise.post({
						action: 'addon',
						component: 'textures'
					}, function (res) {

						var html = '',
							comp = 'backgrounds',
							wrp = $('#lumise-textures-list');

						if (res.items && res.items.length > 0) {

							if ($('#lumise-textures-list ul li.do-empty').length === 0) {
								$('#lumise-textures-list ul').prepend('<li title="Empty background" style="" class="lumise-xitem do-empty" data-ops="[{&quot;empty&quot;: true}]"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-300 -200 800 800" xml:space="preserve"><path fill="#ff11009e" d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312   c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z"></path></svg></li>');
							}

							res.items.map(function (item) {

								lumise.xitems.resources[comp].url[item.id] = lumise.data.upload_url + item.upload;

								html += '<li style="background-image: url(\'' + (
										item.thumbnail_url !== undefined ?
										item.thumbnail_url :
										item.screenshot
									) + '\')" \data-ops=\'[{' +
									'"type": "' + lumise.xitems.resources[comp].ops.preview + '",' +
									'"component": "' + comp + '",' +
									'"name": "' + item.name + '",' +
									'"id": "' + item.id + '",' +
									'"tags": "' + (item.tags ? item.tags : '') + '",' +
									'"cates": "' + (item.cates ? item.cates : '') + '",' +
									'"resource": "backgrounds",' +
									'"resource_id": "' + item.id + '",' +
									'"price": "' + item.price + '",' +
									'"screenshot": "' + (
										item.thumbnail_url !== undefined ?
										item.thumbnail_url :
										item.screenshot
									) + '"' +
									'}]\' class="lumise-xitem">' +
									'<i data-tag="' + item.id + '">' + (
										item.price > 0 ?
										lumise.fn.price(item.price) :
										lumise.i(100)
									) + '</i>' +
									'<i data-info="' + item.id + '"></i>' +
									'</li>';
							});

							var total = res.total ? res.total : 0;

							lumise.ops[comp + '_q'] = res.q;
							lumise.ops[comp + '_category'] = res.category;
							lumise.ops[comp + '_index'] = parseInt(res.index) + res.items.length;

							if (lumise.ops[comp + '_index'] < total)
								lumise.ops[comp + '_loading'] = false;

						} else html += '<span class="noitems">' + lumise.i(42) + '</span>';

						wrp.find('i.lumise-spinner').remove();
						wrp.find('ul.lumise-list-items').append(html);

						lumise.render.categories(comp, res);

						wrp.find('ul.lumise-list-items li.lumise-xitem:not([data-event="true"])').off('click').on('click', function (e) {

							e.preventDefault();

							var o = JSON.parse(this.getAttribute('data-ops'))[0];

							o.url = lumise.xitems.resources[comp].url[o.id];

							if (
								lumise.xitems.resources[comp].ops !== undefined &&
								typeof lumise.xitems.resources[comp].ops.click == 'function'
							) lumise.xitems.resources[comp].ops.click(o, this);

						});
					});
				}

				// Make bg_mode to tile;
				$('#lumise-addon-background-options').val('fill').change();
			}

			if (nav == 'patterns') {

				// Make bg_mode to tile;
				$('#lumise-addon-background-options').val('tile').change();
			}

			wrp.find('header button.active, div[data-tab].active').removeClass('active');
			$(this).addClass('active');
			tab.addClass('active');
		});

		// When click product colors
		$('#lumise-colors-list ul li').on('click', function (e) {

			var color = $(this).attr('data-color');
			var price = $(this).attr('data-price');
			var stage = lumise.stage();

			window.bg_color = color;

			lumise.cart.price.color = parseFloat(price);

			if (color == '#transp') {

				setTransp_color();

			} else {

				// remove background image
				stage.canvas.remove(stage.backgrounds);
				delete stage.backgrounds;
				lumise.stack.save();

				// Add background color
				product_color(color);

				// Change background on the top
				change_bg_theme('color', color, price);
			}

			change_cart();
		});

		$('#lumise-colors-list #colorSelector').spectrum({
			color: "#0000ff",
			showInput: true,
			className: "full-spectrum",
			showInitial: true,
			showPalette: true,
			showSelectionPalette: true,
			maxSelectionSize: 10,
			preferredFormat: "hex",
			localStorageKey: "spectrum.demo",
			move: function (color) {
				
			},
			show: function () {
				
			},
			beforeShow: function () {
				
			},
			hide: function () {
				
			},
			change: function(color) {
				var hex_color = color.toHexString();
				var color_price = 1;

				// Check premium color
				$.each(window.premium, function(idx, item) {
					
					if(hex_color == item.color) {
						color_price = item.price;
					}
				});

				$('#colorSelector div').css('backgroundColor', hex_color);
				var stage = lumise.stage();
				stage.canvas.remove(stage.backgrounds);
				delete stage.backgrounds;
				lumise.stack.save();
				lumise.cart.price.color = parseFloat(color_price);
				stage.productColor.set('fill', hex_color);
				stage.canvas.renderAll();
				change_cart();

				change_bg_theme('color', hex_color, color_price);

			},
			palette: [
				["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
				"rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
				["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
				"rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
				["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
				"rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
				"rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
				"rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
				"rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
				"rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
				"rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
				"rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
				"rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
				"rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
			]
		});

		// $('#lumise-colors-list #colorSelector').ColorPicker({
		// 	color: '#0000ff',
		// 	onShow: function (colpkr) {
		// 		$(colpkr).fadeIn(500);
		// 		return false;
		// 	},
		// 	onHide: function (colpkr) {
		// 		$(colpkr).fadeOut(500);
		// 		return false;
		// 	},
		// 	onChange: function (hsb, hex, rgb) {
		// 		$('#colorSelector div').css('backgroundColor', '#' + hex);
		// 		var stage = lumise.stage();
		// 		stage.canvas.remove(stage.backgrounds);
		// 		delete stage.backgrounds;
		// 		lumise.stack.save();
		// 		stage.productColor.set('fill', '#' + hex);
		// 		stage.canvas.renderAll();

		// 		change_bg_theme('color', '#' + hex, 1);
		// 	}
		// });
	};

	lumise.add_filter('export', function (data, stage) {

		if (stage.backgrounds !== undefined && stage.backgrounds.url !== undefined) {
			data.background_url = stage.backgrounds.url;
			data.background_price = stage.backgrounds.price;
			data.background_mode = stage.backgrounds.mode
		}

		return data;
	});

	lumise.add_filter('import', function (data) {

		var stage = lumise.stage();

		if (
			data !== undefined &&
			stage.backgrounds === undefined &&
			data.background_url !== undefined
		) {
			add_bg(data.background_url, data.background_price, data.background_mode);
		}

		return data;
	});

	lumise.add_action('product', function (data) {

		// Add color pickers
		var currency = lumise.data.currency;
		var color_attrs = data.attributes;
		var color_ul = `<ul class="lumise-product-color lumise-cart-field" data-type="product_color">
							<li data-color="" data-tip="true"><span>Clear selected</span></li>`;
		$.each(color_attrs, function (key, item) {
			if (item.name == 'Color') {
				color_ul += `<li class="sep-title">Standard</li>
					<li data-color="#qqqqqq" style="background-color:#qqqqqq" data-tip="true">
						<input id="colorSelector" type="text"><span>Quadri</span>
					</li>`;
				$.each(item.values.options, function (idx, color) {
					if(color.price < 2){
						color_ul += `<li data-color="` + color.value + `" style="background-color:` + color.value + `" data-price="` + color.price + `" data-tip="true">
							<span>` + color.title + `</span>
						</li>`;
					}
				});
				color_ul += '<li class="sep-title">Premium</li>';
				$.each(item.values.options, function (idx, color) {
					if(color.price > 1){
						color_ul += `<li data-color="` + color.value + `" style="background-color:` + color.value + `" data-price="` + color.price + `" data-tip="true">
							<span>` + color.title  + `</span>
						</li>`;
						var color_item = {
							'color' : color.value,
							'price' : color.price
						}
						window.premium.push(color_item);
					}
				});
			}
		});
		color_ul += `</ul>`;
		$('#lumise-colors-list').html($(color_ul));

		// Add bg theme selector
		var wrp = $('#lumise-workspace #backgrounds-theme');
		wrp.html('');
		wrp.append(`<span id="selected_bg" title="Set this background" data-price="1" style="background: #000"></span>`);
		wrp.append(`<span title="Empty background" data-empty="true">
						<svg height="34" width="34" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
							version="1.1" viewBox="-150 -150 500 500" xml:space="preserve">
							<path fill="#ff11009e" d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312 
								c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,
								0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,
								0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   
								c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z">
							</path>
						</svg>
					</span>`);

		
		// Get backgrounds
		lumise.post({
			action: 'addon',
			component: 'get_backgrounds',
			id: lumise.data.product
		}, function (res) {

			if (res !== '') {

				var stage = lumise.stage();

				if(window.bg_color !== undefined) {
					// Set Product Background Color
					product_color(window.bg_color);
					lumise.cart.price.color = (window.premium !== undefined) ? parseFloat(window.premium) : 1;
					change_bg_theme('color', window.bg_color, lumise.cart.price.color);
				} else {
					res = JSON.parse(decodeURIComponent(res));
                    if(res.length > 0) {
                        res.map(function (bg) {
                            wrp.find('#selected_bg').attr('data-upload', lumise.data.upload_url + encodeURI(bg.upload));
                            wrp.find('#selected_bg').attr('data-price', encodeURI(bg.price));
                            wrp.find('#selected_bg').css('background', 'url(' + bg.thumbn + ')');
                            add_bg('https://mirtil.com/wp-content/uploads/lumise_data/' + bg.upload, bg.price, 'tile', lumise.stack.save);
                            lumise.cart.price.color = parseFloat(bg.price);
                        });
                    } else {
                    	setTransp_color();
                    }
				}

				wrp.find('span').on('click', function (e) {
					
					if (this.getAttribute('data-empty') == 'true') {
						lumise.stack.save();
						stage.canvas.remove(stage.backgrounds);
						delete stage.backgrounds;
						lumise.stack.save();

						init_bg();
					}

					if(this.getAttribute('data-upload')) {
						var mode = $('#lumise-addon-background-options').val(),
						url = this.getAttribute('data-upload'),
						price = this.getAttribute('data-price');

						if (stage.backgrounds === undefined) {
							add_bg(url, price, mode, lumise.stack.save);
						} else {
							stage.backgrounds.set({
								url: url,
								price: price,
								mode: null
							});
							bg_image_mode(mode);
						}
					}

					if(this.getAttribute('data-color')) {
						// Remove backgroun image
						stage.canvas.remove(stage.backgrounds);
						delete stage.backgrounds;
						lumise.stack.save();

						// Add background Color
						color = this.getAttribute('data-color');
						price = this.getAttribute('data-price');
						lumise.cart.price.color = parseFloat(price);
						stage.productColor.set('fill', color);
						stage.canvas.renderAll();
					}

					change_cart();
				});

				// After Loaded Background - Do init action
				setInit();

			} else {
				wrp.hide();
			}
			
		});

	});

	$('#lumise-workspace').append('<div id="backgrounds-theme"></div>');

	var init_bg = function () {
		var stage = lumise.stage();
		var wrp = $('#lumise-workspace #backgrounds-theme');

		var url = "/wp-content/uploads/2020/04/partterngrid.jpg";
		var mode = $('#lumise-addon-background-options').val();

		if (stage.backgrounds === undefined) {
			add_bg(url, 0, mode);
		} else {
			stage.backgrounds.set({
				url: url,
				price: 0,
				mode: mode
			});
			bg_image_mode(mode);
		}

		lumise.cart.price.color = 1;
	}

	var change_bg_theme = function (type, background, price) {
		var wrp = $('#lumise-workspace #backgrounds-theme');
		wrp.find('#selected_bg').removeAttr('data-color');
		wrp.find('#selected_bg').removeAttr('data-upload');

		if(type == 'bg') {
			wrp.find('#selected_bg').css('background', 'url(' + background + ')');
			wrp.find('#selected_bg').attr('data-upload', background);
		}

		if(type == 'color') {
			wrp.find('#selected_bg').css('background', background);
			wrp.find('#selected_bg').attr('data-color', background);
		}

		wrp.find('#selected_bg').attr('data-price', price);
	}

	var product_color = function(color) {

		var stage = lumise.stage();
		
		if (color === undefined || color === '' || color === '#transp'){
			setTransp_color();
			return false;
		}			
			
		if (stage.limit_zone) {
			
			var invert = lumise.fn.invert(color);
			stage.limit_zone.set('stroke', invert);
			
			stage.productColor.set('fill', color);
			stage.canvas.renderAll();
			
			Object.keys(lumise.data.stages).map(function(s){

				if (s != lumise.current_stage && lumise.data.stages[s].canvas !== undefined) {
					lumise.data.stages[s].productColor.set('fill', color);
					lumise.data.stages[s].canvas.renderAll();
				}
			});

			lumise.tools.save();

		}

		lumise.actions.do('product-color', color);
		$('#lumise-colors-list ul li').removeClass('choosed');
		$('#lumise-colors-list ul').find('li[data-color="' + color + '"]').addClass('choosed');
	}

	var setInit = function () {

        if(window.printing_id !== undefined) {
            lumise.cart.printing.current = window.printing_id;
            $('#lumise-printing-' + window.printing_id).prop('checked', true);
        }

        if(window.qty !== undefined) {
			lumise.cart.qty = parseInt(window.qty);
			$('#lumise-cart-attributes input[name="quantity"]').val(lumise.cart.qty);
		}

		if(window.width === undefined)
			window.width = 150;
		
		if(window.height === undefined)
			window.height = 100;
		
        if(window.width !== undefined && window.height !== undefined) {
            $('#change_unit').prop('checked', false);
            $('#change_unit').trigger('change');
            $('.lumise_form_content.custom-size input[data-type="width"]').val(parseFloat(window.width).toFixed(2));
            $('.lumise_form_content.custom-size input[data-type="height"]').val(parseFloat(window.height).toFixed(2));
            var s = parseFloat(window.width) * parseFloat(window.height);
			var price = (s / 10000) *  window.base_attr;
			var size_list = $('#lumise-mirtilsize-list').find('.lumise-cart-param');
			size_list.val('custom').change();
        	$('option:selected', size_list).attr('data-price', price);
			var attr_id = size_list.attr('name');
			$.each(lumise.ops.product_data.attributes[attr_id].values.options, function(index, option){
				if(option.value == 'custom') {
					option.price = price;
				}
			});
			lumise.cart.price.attr = price;
		}

		if(window.tab != undefined)
			$('#lumise-left .lumise-left-nav li[data-tab="' + window.tab + '"]').trigger('click');
			
		if(window.cat != undefined)
			$('#lumise-' + window.tab + ' button[data-nav="' + window.cat + '"]').trigger('click');
			
		// Remove No needed elements
		$('#lumise-cart-attributes').find('div[data-type="product_color"]').remove();
		$('#lumise-cart-attributes').find('div[data-type="select"]').remove();
		$('#lumise-cart-attributes').find('div[data-type="input"]').remove();

		if(window.bg_color != undefined) {
			lumise.cart.price.color = 2;
		} else {
			lumise.cart.price.color = 1;
		}

		// Display Init Cart price;
		change_cart();

		// if(window.printing_price !== undefined) {
		// 	var current_extra = lumise.cart.price.extra.values[0].price;
		// 	lumise.cart.price.extra.values = [{ price: current_extra + parseFloat(window.printing_price) }];
		// }
		// lumise.cart.display();

		setTimeout(() => {
			$('.lumise-product-price').show();
		}, 1000);
	}
	
	var setTransp_color = function() {
		var stage = lumise.stage();
		var url = "/wp-content/uploads/2020/04/partterngrid.jpg";
		var mode = $('#lumise-addon-background-options').val();
		var price = 1;

		if (stage.backgrounds === undefined) {
			add_bg(url, price, mode);
		} else {
			stage.backgrounds.set({
				url: url,
				price: price,
				mode: null
			});
			bg_image_mode(mode);
		}

		change_bg_theme('bg', url, price);
	}
}