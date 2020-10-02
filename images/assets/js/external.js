(function($){
	
	var api = JSON.parse(decodeURIComponent(atob(api_cfg))),
		trigger = function (obj) {

		var func;
		for( var ev in obj.events ){

			if( typeof obj.events[ev] == 'function' )
				func = obj.events[ev];
			else if( typeof obj[obj.events[ev]] == 'function' )
				func = obj[obj.events[ev]];
			else continue;

			ev = ev.split(',');

			ev.map(function(evs){

				evs = evs.split(':');

				if(evs[1] === undefined)evs[1] = 'click';

				if (evs[0] === '')
					obj.el.off(evs[1]).on( evs[1], obj, func );
				else obj.el.find( evs[0] ).off(evs[1]).on( evs[1], obj, func );

			});

		}
	},
		canvas = document.createElement('canvas'),
		loading = function(st, bottom) {
			$('.lumise_loading').remove();
			if (st === true) {
				$('body').append('<img id="lumise-loading" class="center lumise_loading '+(bottom ? 'bottom' : '')+'" src="assets/images/loading_gray.gif" height="50" />');
			}
		},
		load_image = function (url, callback) {

			var image = new Image();
			image.onload = function(){
		    	
			    canvas.width = this.naturalWidth;
			    canvas.height = this.naturalHeight;
			    
			    try {
					canvas.getContext('2d').drawImage(this, 0, 0);
				} catch (ex) { alert(ex.message); }
			   
			    var type = image.src.indexOf('.png') === image.src.length - 4 ? 'png' : 'jpeg',
			    	data = canvas.toDataURL('image/'+type);
			    
			    callback(data);
		    
		    };
		    image.crossOrigin = "anonymous";
		    image.src = url;
		    
		},
		get_dataURL = function(url, callback) {

			var xhr = new XMLHttpRequest();

			xhr.open("GET", url, true);
			xhr.responseType = "blob";
			xhr.overrideMimeType("text/plain;charset=utf-8");
			xhr.onload = function(){
				var a = new FileReader();
			    a.onload = function(){
					callback(this.result.replace('data:text/plain;', 'data:image/jpeg;'));  
					delete xhr;
					delete a;
				};
			    a.readAsDataURL(this.response);
			};
			xhr.onreadystatechange = function (e) {  
			    if (xhr.readyState === 4 && xhr.status !== 200)
			       alert('Could not download this image at this time, please try again.');
			};
			
			xhr.send(null);

		},
		is_touch = function() {
		  return 'ontouchstart' in window || navigator.maxTouchPoints;
		},
		sources = {
			
			page : 1,
			source: localStorage.getItem('lumise_source') ? localStorage.getItem('lumise_source') : 'pixabay',
			cate : localStorage.getItem('lumise_cate') ? localStorage.getItem('lumise_cate') : '',
			q : localStorage.getItem('lumise_q') ? localStorage.getItem('lumise_q') : '',
			order : localStorage.getItem('lumise_order') ? localStorage.getItem('lumise_order') : '',
			lastVisit : localStorage.getItem('lastVisit'),
			
			is_loading : false,
			query : null,
			render : null,
			
			wrp : $('#lumise-images-manager'),
			
			get_images: function(bottom) {
				
				var _t = this;
				_t.is_loading = true;
				
				$('#lumise-images-manager').attr({'data-load': 'more'});
				
				var on_success = function(res){
					
					if (res && res.error)
						return alert(res.error);
					
					var html = _t.render(res);
					
					delete res;
					
					if (html !== '') {
						
						sources.wrp.css({'min-height': sources.wrp.height()}).append(html).masonry('reload');
						
						trigger({
							el: $('#lumise-images-manager .lumise-image:not([data-event="true"])'),
							events: {
								'img.info:mouseover': 'view_info',
								'img.info:mouseout': 'view_info',
								'img[crossorigin="Anonymous"]:click': 'do_add'
							},
							view_info: function(e) {
								
								if (e.type == 'mouseover') {
									
									clearTimeout(e.data.timer);
									
									var url = this.parentNode.getAttribute('data-url'),
										name = this.parentNode.getAttribute('data-name'),
										source = this.parentNode.getAttribute('data-source'),
										tags = this.parentNode.getAttribute('data-tags');
										
									top.window.postMessage({
									    action: 'preview_image',
									    ops : {
										    url: url,
										    name: name,
											source: source,
											tags: tags
										}
									}, '*');
									
								}else{
									e.data.timer = setTimeout(function(){
										top.window.postMessage({
										    action: 'close_preview_image'
										}, '*');
									}, 350);
								}
								
							},
							do_add: function(e) {
								loading(true);
								get_dataURL(this.parentNode.getAttribute('data-url'), function(res) {
									top.window.postMessage({
									    action: 'add_image',
									    url: res
									}, '*');
									loading(false);
								});
							}
						});
						
						//if (is_touch())
							//wrp.smoothTouchScroll("recalculateScrollableArea");
						
						$('#lumise-images-manager').attr({'data-load': ''});
						
					}
					
				};
				
				if (this.source == 'instagram') {
				
					$.ajax({
						url: _t.query(),
						dataType: 'jsonp',
						type: 'GET',
						data: {},
						success: on_success,
						error: function(data){
							alert(JSON.stringify(data));
						}
					});
				
				} else $.get(_t.query(), on_success);
			
			},
			
			pixabay : function(){
				
				this.query = function(){
					return 'https://pixabay.com/api/?key='+api.pi+'&page='+
						(sources.page++)+'&per_page=100'+(
							(sources.cate !== '' ? '&category='+sources.cate : '')+
							(sources.q !== '' ? '&q='+sources.q : '')+
							(sources.order !== '' ? '&order='+sources.order : '')
						);
				};
				
				this.render = function(res){
					
					var html = '';
					
					if (res.hits && res.hits.length > 0) {
						res.hits.map(function(img){
							html += '<div class="lumise-image" data-name="Photo by Pixabay" \
										data-url="'+img.webformatURL.replace('_640.', '_1280.'/*'_960.'*/)+'" \
										data-tags="'+img.tags+'" style="width:'+iwidth+'px">\
										<img crossOrigin="Anonymous" src="'+img.webformatURL.replace('_640.', '_340.')+'" \
											height="'+((iwidth/img.previewWidth)*img.previewHeight)+'" \
											width="'+iwidth+'" />\
										<span>'+img.tags+'</span>\
										<img src="assets/images/i.svg" class="info" />\
									</div>';
						});
					}
					
					if (res.totalHits > sources.page*100)
						sources.is_loading = false;
						
					return html;
					
				};
			
				this.get_images();
				
			},
			
			unsplash : function(){
				
				this.query = function(){
					
					return 'https://api.unsplash.com/'+(sources.q !== '' ? 'search/' : '')+'photos?'+
						'client_id='+api.un+
						'&response_type=json&page='+(sources.page++)+'&per_page=30'+
						(
							(sources.cate !== '' ? '&category='+sources.cate : '')+
							(sources.q !== '' ? '&query='+sources.q : '')+
							(sources.order !== '' ? '&order_by='+sources.order : '')
						);
				};
				
				this.render = function(res){
					
					var html = '', items = [];
					
					if (sources.q === '') {
						items = res;
						if (items.length == 30)
							sources.is_loading = false;
					}else if (res.results && res.results.length > 0){
						items = res.results; 
						if (res.total && res.total > sources.page*30)
							sources.is_loading = false;
					}
					
					if (items.length > 0) {
						items.map(function(img){
							
							if (img.description == null) {
								if (img.categories.length > 0) {
									img.description = [];
									img.categories.map(function(c){
										img.description.push(c.title);
									});
									img.description = img.description.join(', ');
								}else img.description = sources.q;
							}
							html += '<div class="lumise-image" data-name="Photo by '+img.user.name+'/Unsplash" \
										data-url="'+img.urls.full/*regular*/+'" \
										data-tags="'+img.description+'" style="width:'+iwidth+'px">\
										<img crossOrigin="Anonymous" \
											src="'+img.urls.thumb+'" \
											height="'+((iwidth/img.width)*img.height)+'" \
											width="'+iwidth+'" />\
										<span>\
											<a href="https://unsplash.com/@'+img.user.username+'?utm_source=lumise&utm_medium=referral&utm_campaign=api-credit" title="View author\'s profile" target=_blank>'+
												img.user.name+
											'</a>\
										</span>\
										<img src="assets/images/i.svg" class="info" />\
									</div>';
						});
					}else html = '<p><center>No item found</center></p>';
						
					return html;
					
				};
			
				this.get_images();
				
			},
			
			openclipart : function(){
				
				this.source = 'openclipart';
				localStorage.setItem('lumise_source', 'openclipart');
				
				this.query = function(){
					return 'https://openclipart.org/search/json/?page='+(sources.page++)+'&amount=100'+(
						(sources.cat !== '' && sources.cat !== undefined ? '&category='+sources.cat : '')+
						(sources.q !== '' ? '&query='+sources.q : '')+
						(sources.order !== '' ? '&sort='+sources.order : '')
					);
				};
				
				this.render = function(res){
					
					var html = '';
					
					if (res.payload && res.payload.length > 0) {
						res.payload.map(function(img){
							html += '<div class="lumise-image" data-name="Clipart by Openclipart" \
										data-url="'+img.svg.png_full_lossy+'" \
										data-tags="'+img.tags+'" style="width:'+iwidth+'px">\
										<img crossOrigin="Anonymous" src="'+img.svg.png_thumb+'" \
											height="'+((iwidth/img.dimensions.png_thumb.width)*img.dimensions.png_thumb.height)+'" \
											width="'+iwidth+'" />\
										<span>'+img.title+'</span>\
										<img src="assets/images/i.svg" class="info" />\
									</div>';
						});
					}
					
					if (res.info.pages > res.info.current_page)
						sources.is_loading = false;
					
					return html;
					
				};
			
				this.get_images();
				
			},
			
			facebook : function(){
				
				var _this = this;
				
				this.source = 'facebook';
				localStorage.setItem('lumise_source', this.source);
				
				this.is_loading = true;
				loading(true);
				
				var fb_login = function(res) {
					
					if (res.status === 'connected') {
						
						var access_token = res.authResponse.accessToken;
						
						$('#lumise-images-manager').html('');
						
						_this.is_loading = false;
						
						_this.query = function(){
							
							if (typeof sources.page == 'string' && sources.page.indexOf('https://graph.facebook.com') === 0)
								return sources.page;
							else return 'https://graph.facebook.com/v2.10/me/photos/uploaded?fields=album,height,id,images,width,name&limit=100&access_token='+access_token;
							
						};
						
						_this.render = function(res){
							
							var html = '';
							
							if (res.data && res.data.length > 0) {
								res.data.map(function(img){
									html += '<div class="lumise-image" data-name="'+(img.name ? img.name : 'Photo from Facebook')+'" \
												data-url="'+img.images[0].source+'" \
												data-tags="'+img.album.name+'" style="width:'+iwidth+'px">\
												<img crossOrigin="Anonymous" src="'+img.images[img.images.length-1].source+'" \
													height="'+((iwidth/img.images[0].width)*img.images[0].height)+'" \
													width="'+iwidth+'" />\
												<span>'+(img.name ? img.name : 'Untitled')+'</span>\
												<img src="assets/images/i.svg" class="info" />\
											</div>';
								});
							}
							
							if (res.paging && res.paging.next) {
								sources.page = res.paging.next;
								sources.is_loading = false;
							}else delete sources.page;
							
							return html;
							
						};

						_this.get_images();
						
					} else {
						
						var btn = $('<div class="center"><button id="lumise-login-facebook">Login with your Facebook</button></div>');
						
						$('#lumise-images-manager').html('').css({height: 'auto'}).append(btn);
						
						btn.on('click', function(e){
							
							FB.login(fb_login, {
								scope: 'email,user_photos'
							});
			
							e.preventDefault();
			
						});
						
					}
					
					loading(false);
					
				};
				
				if ($('#facebook-sdk').length === 0) {
					$('head').append("\<script id=\"facebook-sdk\" src=\"https://connect.facebook.net/en_US/sdk.js\"\>\</script\>");
					window.fbAsyncInit = function() {
						FB.init({
						    appId      : api.fb,
						    cookie     : true,
						    xfbml      : true,
						    version    : 'v2.8'
						});
						FB.getLoginStatus(fb_login);
					};
				}else FB.getLoginStatus(fb_login);
				
			},
			
			instagram : function(){
				
				var _this = this;
				
				this.source = 'instagram';
				localStorage.setItem('lumise_source', this.source);
				
				this.is_loading = true;
				
				var btn_login = function() {
					
					var btn = $('<div class="center"><button id="lumise-login-instagram">Login with your Instagram</button></div>');
					
					$('#lumise-images-manager').html('').append(btn);
						
					btn.on('click', function(e){
						
						window.open('https://api.instagram.com/oauth/authorize/?client_id='+api.in+'&redirect_uri='+encodeURIComponent('https://services.lumise.com/images/?instagram_callback=true')+'&response_type=token', 'instagram', 'width=600,height=300,left=300,top=200');
			
						e.preventDefault();
			
					});
					
				};
				
				if (localStorage.getItem('instat') === null) {
					
					btn_login();
					
				}else{
					
					this.is_loading = false;
					_this.query = function(){
							
						if (typeof sources.page == 'string' && sources.page.indexOf('https://api.instagram.com') === 0)
							return sources.page;
						else return 'https://api.instagram.com/v1/users/self/media/recent?access_token='+localStorage.getItem('instat');
						
					};
					
					_this.render = function(res) {
						
						var html = '';
						
						if (res.data && res.data.length > 0) {
							res.data.map(function(img){
								
								html += '<div class="lumise-image" data-name="'+(img.caption ? img.caption.text : 'Photo from Instagram')+'" \
											data-url="'+img.images.standard_resolution.url+'" \
											data-tags="'+img.tags.join(', ')+'" style="width:'+iwidth+'px">\
											<img crossOrigin="Anonymous" src="'+img.images.low_resolution.url+'" \
												height="'+((iwidth/img.images.low_resolution.width)*img.images.low_resolution.height)+'" \
												width="'+iwidth+'" />\
											<span>'+(img.caption ? img.caption.text : 'Untitled')+'</span>\
											<img src="assets/images/i.svg" class="info" />\
										</div>';
							});
						}
						
						if (res.pagination && res.pagination.next_url) {
							sources.page = res.pagination.next_url;
							sources.is_loading = false;
						}else delete sources.page;
						
						return html;
					};
					
					_this.get_images();
					
				}
				
				
			},
			
		},
		wrp = $('#lumise-images'),
		wwidth = $(window).width(),
		iwidth = (wwidth-46)/2;
	
	if ($('#search-sources>li[data-source="'+sources.source+'"]').length === 0)
		sources.source = $('#search-sources>li').first().attr('data-source');
	
	trigger({
		
		el: $('#lumise-header'),
		events: {
			'#search-input:keydown': 'search',
			'#search-input:mouseup': 'search',
			'#search-sources li': 'source'
		},
		search: function(e) {
			if (e.type == 'mouseup') {
				setTimeout(function(el){
					if (el.value ===  '' && sources.q !== '') {
						$('#lumise-images-manager').html('').css({height: '', top: '0px', 'min-height': '0px'});
						sources.q = '';
						localStorage.setItem('lumise_q', '');
						sources.page = 1;
						sources.get_images();
					}
				}, 250, this);
			}else if (e.keyCode == 13) {
				$('#lumise-images-manager').html('').css({height: '', top: '0px', 'min-height': '0px'});
				sources.q = encodeURIComponent(this.value.replace(/[^\w]/g, ''));
				localStorage.setItem('lumise_q', sources.q);
				sources.page = 1;
				sources.get_images();
			}
		},
		
		source: function(e) {
			
			var s = this.getAttribute('data-source'),
				wrp = $(this).closest('.sources-wrp');
				
			$(this).closest('.input-wrp').attr({'data-source': s});
					
			if (wrp.find('>span>label').html() != s) {
				wrp.removeClass('active').find('>span>label').html(s);
				sources.source = s;
				sources.page = 1;
				localStorage.setItem('lumise_source', s);
				
				$('#lumise-images-manager').html('').css({height: '', top: '0px', 'min-height': '0px'});
				sources[s]();
				
			}
			
		}
		
	});
	
	if (!localStorage.getItem('lastVisit'))
		localStorage.setItem('lastVisit', new Date().getTime());
	
	$('#lumise-images-manager').masonry({
		itemSelector: '.lumise-image',
		originTop: false,
		initLayout: false,
	});
	
	if (is_touch()) {
		wrp.css({height: (screen.height-277)+'px'}).smoothTouchScroll({ continuousScrolling: false });
		wrp.find('.scrollWrapper').scroll(function() {
			
			if (sources.is_loading === true)
				return;
				
			if (this.scrollTop + this.offsetHeight >= this.scrollHeight)
				sources.get_images(true);
			
		});
	};
	
	$(window).scroll(function() {
		
		if (sources.is_loading === true)
			return;
			
		if ($(window).scrollTop() + $(window).height() > $(document).height() - 100)
			sources.get_images(true);
		
	});
			
	$(document).on('click', function(e) {
		
		if (e.isTrigger)
			return;
			
		if ($(e.target).closest('.sources-wrp').length > 0 && $(e.target).closest('#search-sources').length === 0) {
			if (!$('.sources-wrp').hasClass('active'))
				$('.sources-wrp').addClass('active');
			else $('.sources-wrp').removeClass('active');
		}else $('.sources-wrp').removeClass('active');

	});
	
	window.addEventListener('message', function(e) {
		
		if (!e.data)
			return;
		
		if (e.data.action == 'reload') {
			location.reload();
		}else if (e.data.action == 'scrollTop') {
			sources.wrp.css({'min-height': sources.wrp.height()}).masonry('reload');
			$('html,body').animate({scrollTop: 0});
			$(wrp).find('.scrollWrapper').animate({scrollTop: 0});
		}else if (e.data.action == 'parentClick') {
			if ($(e.target).closest('.sources-wrp').length > 0) {
				if (!$('.sources-wrp').hasClass('active'))
					$('.sources-wrp').addClass('active');
				else $('.sources-wrp').removeClass('active');
			}else $('.sources-wrp').removeClass('active');
		}else if (e.data.action == 'refresh') {
			sources.wrp.css({'min-height': sources.wrp.height()}).masonry('reload');
		};
		
	});
	
	$('#search-input').val(sources.q);
	
	window.onload = function(){
		$('#search-sources li[data-source="'+sources.source+'"]').trigger('click');
	};
	
})(jQuery);
