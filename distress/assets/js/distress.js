function lumise_addon_distress(lumise) {
	
	window.lm = lumise;
	
	window.lumise_add_distress = function(url, price, cb, resolution) {
		
		if (resolution === undefined)
			resolution = 1;
			
		var stage = lumise.stage(),
			objects = stage.canvas.getObjects(),
			refer = new Image();
		
		lumise.f('Loading..');
		refer.onerror = function() {
			return lumise.fn.notice('Could not load Distress effect');
		};
		refer.onload = function() {
			
			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				img = new Image();
			
			canvas.width = stage.limit_zone.width*resolution;
			canvas.height =  stage.limit_zone.height*resolution;
			
			ctx.drawImage(this, 0, 0,  stage.limit_zone.width*resolution,  stage.limit_zone.height*resolution);
			
			if (stage.distress !== undefined)
				stage.canvas.remove(stage.distress);
			
			var urldataa = url;
			
			if (url.indexOf('data:image') !== 0)
				urldataa = canvas.toDataURL('image/'+(url.indexOf('.png') > -1 ? 'png' : 'jpeg'));
				
			img.onload = function() {
				
				ctx.globalCompositeOperation = 'destination-in';
				var lw = stage.limit_zone.width*resolution,
					lh = stage.limit_zone.height*resolution;
					w = lw,
					h = 0,
					l = 0,
					t = 0;
				
				h = w*(this.naturalHeight/this.naturalWidth);
				
				if (h < lh) {
					h = lh;
					w = h*(this.naturalWidth/this.naturalHeight);
				}
				
				t = (lh-h)/2;
				l = (lw-w)/2;
					
				ctx.drawImage(this, l, t, w, h);
				
				var img2 = new Image(),
					url = canvas.toDataURL('image/png');
				
				img2.onload = function() {
						
					ctx.globalCompositeOperation = 'source-over';
					ctx.fillStyle = lumise.get.color();
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					
					ctx.globalCompositeOperation = 'destination-in';
					ctx.drawImage(this, 0, 0);
					
					fabric.util.loadImage(canvas.toDataURL('image/png'), function(img) {
						
						var ops = {
							left: stage.limit_zone.left,
							top: stage.limit_zone.top,
							width: stage.limit_zone.width,
							height: stage.limit_zone.height,
							selectable: false,
							evented: false,
							url: urldataa,
							price: price,
							originX: 'left',
							originY: 'top'
						};
						
						stage.distress = new fabric.Image(img);
						stage.distress.set(ops);
						stage.canvas.add(stage.distress);
						
						lumise.fn.download_design({
							type: 'png',
							width: stage.product.width,
							height: stage.product.height,
							include_base: true,
							stage: stage,
							callback: function(data) {
								stage.screenshot = data;
								lumise.get.el('stage-nav')
									.find('img[data-stage="'+lumise.current_stage+'"]')
									.attr({src: stage.screenshot});
								lumise.f(false);
							}
						});
						
						stage.canvas.renderAll();
						lumise.f(false);
						
						if (typeof cb == 'function')
							cb();
					});
					
					delete canvas;
				
				};
				
				img2.src = url;
				
			};
			img.src = lumise.tools.toImage({
				stage: stage,
				left: stage.limit_zone.left,
				width: stage.limit_zone.width,
				multiplier: resolution,
				is_bg: false
			});
					
		};
		
		refer.src = url;
			
	},
		import_data = null;
	
	lumise.design.nav.load.distress = function(e) {
		
		lumise.xitems.load('distress', {
			
			preview: 'image',
			
			load: function(res) {
				$('#lumise-distress-list ul li').css({display: ''});
				return res;
			},
			response: function(res) {
				if ($('#lumise-distress-list ul li.do-empty').length === 0) {
					$('#lumise-distress-list ul').prepend('<li title="Empty distress" style="" class="lumise-xitem do-empty" data-ops="[{&quot;empty&quot;: true}]"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="-300 -200 800 800" xml:space="preserve"><path fill="#ff11009e" d="M131.804,106.491l75.936-75.936c6.99-6.99,6.99-18.323,0-25.312   c-6.99-6.99-18.322-6.99-25.312,0l-75.937,75.937L30.554,5.242c-6.99-6.99-18.322-6.99-25.312,0c-6.989,6.99-6.989,18.323,0,25.312   l75.937,75.936L5.242,182.427c-6.989,6.99-6.989,18.323,0,25.312c6.99,6.99,18.322,6.99,25.312,0l75.937-75.937l75.937,75.937   c6.989,6.99,18.322,6.99,25.312,0c6.99-6.99,6.99-18.322,0-25.312L131.804,106.491z"></path></svg></li>');
				}
				return res;	
			},
			click: function(data) {
				
				var stage = lumise.stage(),
					objects = stage.canvas.getObjects();
				
				if (data.empty === true && stage.distress !== undefined) {
					
					lumise.stack.save();
					stage.canvas.remove(stage.distress);
					delete stage.distress;
					lumise.stack.save();
					
					return;
					
				};
				
				if (stage.distress === undefined) {
					lumise_add_distress(data.url, data.price, lumise.stack.save);
				} else {
					lumise_add_distress(data.url, data.price, lumise.stack.save);
				}
				
			}
		});
				
	};
	
	lumise.add_filter('export', function(data, st) {
		
		if (st.distress !== undefined && st.distress.url !== undefined) {
			data.distress_url = st.distress.url;
			data.distress_price = st.distress.price;
		}
		
		if (window.import_data !== undefined && window.import_data !== null) {
			data.distress_url = import_data[0];
			data.distress_price = import_data[1];
		}
			
		return data;
		
	});
		
	lumise.add_filter('import', function(data) {
		
		var stage = lumise.stage();
		
		if (
			data !== undefined && 
			stage.distress === undefined && 
			data.distress_url !== undefined
		) {
			import_data = [data.distress_url, data.distress_price]; 
		}
			
		return data;
		
	});
	
	lumise.actions.add('first-completed', function() {
		
		setTimeout(function() {
			if (import_data !== null) {
				lumise_add_distress(import_data[0], import_data[1]);
				delete import_data;
			}
		}, 1000);
		
	});
		
	lumise.actions.add('object:modified', function() {
		if (lumise.stage().distress !== undefined)
			lumise_add_distress(lumise.stage().distress.url, lumise.stage().distress.price);
	});
			
	lumise.actions.add('object:remove', function() {
		if (lumise.stage().distress !== undefined)
			lumise_add_distress(lumise.stage().distress.url, lumise.stage().distress.price);
	});
	
	$('div#lumise-product ul#lumise-product-color input.color, div#lumise-product ul#lumise-product-color').on('change click', function() {
		if (lumise.stage().distress !== undefined)
			lumise_add_distress(lumise.stage().distress.url, lumise.stage().distress.price);
	});
		
}