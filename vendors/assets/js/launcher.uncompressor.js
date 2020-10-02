 /*
 *
 * lumise Designer v1.0
 *
 * https://lumise.com
 * Copyright 2019 : lumise - Makes it easy to create, sell, and order custom design products
 * All rights reserved by lumise Inc
 *
 * This source code is licensed under non-distrbutable rights of lumise
 * https://www.launcher.com/terms-conditions/
 *
 */

jQuery(document).ready(function($) {
	
	"use strict";

	var launcher = {

		i : function(s){
			return launcher.data.js_lang[s.toString()];
		},
		
		filters : [],
		actions : [],
		
		ops : {
			drag_start: null,
			templates : {}
		},

		trigger : function( obj ) {

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
		
		add_filter : function(name, callback, priority) {
			
			if (priority === undefined)
				priority = 10;
				
			if (this.filters[priority] === undefined)
				this.filters[priority] = {};
				
			if (this.filters[priority][name] === undefined)
				this.filters[priority][name] = [];
				
			if (typeof callback == 'function')
				this.filters[priority][name].push(callback);
				
		},

		apply_filters : function(name, obj, p) {
			
			this.filters.map(function(filters) {
				if (filters[name] !== undefined) {
					filters[name].map(function(filter){
						if (typeof filter == 'function')
							obj = filter(obj, p);
					});
				}
			});

			return obj;

		},
		
		add_action : function(name, callback, priority) {
			
			if (priority === undefined)
				priority = 10;
				
			if (launcher.actions[priority] === undefined)
				launcher.actions[priority] = {};
				
			if (launcher.actions[priority][name] === undefined)
				launcher.actions[priority][name] = [];

			launcher.actions[priority][name].push(callback);

		},

		do_action : function(name, obj, p) {

			launcher.actions.map(function(stack) {
				if (stack[name] !== undefined) {
					var res;
					stack[name].map(function(evt){
						if (typeof evt == 'function') {
							try { 
								res = evt(obj, p);
							}catch(ex){
								console.warn(ex.message+' - do action '+name);
								console.log(ex);
								launcher.fn.notice(ex.message+' - do action '+name, 'error');
							}
						}
					});
					return res;
				}
			});
			
		},
		
		blob_url : {
			
			storage : {},
			
			create : function(data) {
				var url = URL.createObjectURL(launcher.fn.url2blob(data));
				this.storage[url] = data;
				return url;
			},
			
			revoke : function(url) {
				URL.revokeObjectURL(url);
				delete this.storage[url];
			},
			
			clear : function() {
				
				for(let i = this.storage.length - 1; i>=0; i--) {
					let u = this.storage[i];
					if (
						document.querySelectorAll('img[src="'+u+'"]').length === 0 ||
						launcher.data.selected_products.filter((p) => {
							return (Object.values(p.stages).filter((s) => {
								return (
									s.screenshot == u || 
									(s.design && s.design.url == u) || 
									(s.design && s.design.print_thumbnail == u)
								);
							}).length > 0);
						}).length === 0
					) {
						launcher.blob_url.revoke(u);
						delete this.storage[i];
					}
				};
			}
			
		},
		
		fn : {
			
			version_compare : function(a, b) {
				
				if (a === undefined || b === undefined)
					return 0;
					
			    var pa = a.split('.');
			    var pb = b.split('.');
			    
			    for ( var i = 0; i < 3; i++ ) {
				    
			        var na = Number(pa[i]);
			        var nb = Number(pb[i]);
			        
			        if (na > nb) 
			        	return 1;
			        
			        if (nb > na) 
			        	return -1;
			        
			        if (!isNaN(na) && isNaN(nb)) 
			        	return 1;
			        
			        if (isNaN(na) && !isNaN(nb)) 
			        	return -1;
			    }
			    
			    return 0;
			    
			},
			
			invert : function(color) {

				var r,g,b;

				if (color.indexOf('rgb') > -1) {

					color = color.split(',');
					r = parseInt(color[0].trim());
					g = parseInt(color[1].trim());
					b = parseInt(color[2].trim());

				} else {
					if (color.length < 6)
						color += color.replace('#', '');
					var cut = (color.charAt(0)=="#" ? color.substring(1,7) : color.substring(0,6));
					r = (parseInt(cut.substring(0,2),16)/255)*0.213;
					g = (parseInt(cut.substring(2,4),16)/255)*0.715;
					b = (parseInt(cut.substring(4,6),16)/255)*0.072;
				}

				return (r+g+b < 0.5) ? '#DDD' : '#333';
			},

			notice : function(content, type, delay) {

				var i = 'bulb';
				switch (type) {
					case 'success': i = 'done'; break;
					case 'error': i = 'close'; break;
				};

				var el = $('#lumise-notices');
				clearTimeout(launcher.ops.notice_timer);

				if (el.data('working')) {
					el.stop()
					.append('<span data-type="'+type+'"><i class="lumisex-android-'+i+'"></i> '+content+'</span>')
					.animate({opacity: 1, top: 55}, 250);
				}else{
					el.data({'working': true}).stop()
					.html('<span data-type="'+type+'"><i class="lumisex-android-'+i+'"></i> '+content+'</span>')
					.css({opacity: 0, top: 0, display: 'block'})
					.animate({opacity: 1, top: 55}, 250);
				}

				launcher.ops.notice_timer = setTimeout(function(){
					el.animate({top: 0, opacity: 0}, 250, function(){
						this.style.display = 'none';
						el.data({'working': false});
					});
				},(delay ? delay : 1500), el);

			},

			download : function(data, name) {
				
				launcher.fn.dataURL2Blob(data, function(blob) {
					if ("webkitAppearance" in document.body.style === false) {
						launcher.fn.notice('After saving the download file, change the file type to .'+name.split('.')[1].toUpperCase(), 'notice', 5000);
						return window.open(URL.createObjectURL(blob));
					};
					var a = document.createElement('a');
					a.download = name;
					a.href = URL.createObjectURL(blob);
					a.click();
					URL.revokeObjectURL(a.href);
				});
				
			},
			
			dataURL2Blob : function(dataURL, callback) {

				callback(this.url2blob(dataURL));

			},

			process_files: function(files, callback) {

				var tmpl = '', file, reader  = {};
				
				for (let f in files) {
					
					if (typeof files[f] != 'object')
						return;
					
					if (files[f].type.indexOf('image/') !== 0)
						return launcher.fn.notice(launcher.i('148'), 'error', 5000);
						
					file = files[f];

					reader[f] = new FileReader();
					reader[f].f = f;
					reader[f].file = file;
					reader[f].addEventListener("load", function () {
						
						if (!launcher.fn.check_upload_size(reader[this.f].file)) {
							delete reader[this.f];
							return;
						};
						
						var id = parseInt(reader[this.f].file.lastModified/1000).toString(36);

						id = parseInt((new Date().getTime()/1000)).toString(36)+'-'+id;
						
						var url_data = this.result,
							img_opt = {
								url	: launcher.blob_url.create(url_data),
								type: reader[this.f].file.type,
								size: reader[this.f].file.size,
								name: reader[this.f].file.name.replace(/[^0-9a-zA-Z\.\-\_]/g, "").trim().replace(/\ /g, '+')
							};
				    	
				    	if (typeof callback == 'function')
				    		callback(img_opt);
				    		
				    	delete reader[this.f];

					}, false);

					reader[f].readAsDataURL(file);

				};

			},
			
			select_image: function(callback) {
					
				var ops = launcher.ops; 
				
				if (ops.image_inp === undefined) {
					ops.image_inp = document.createElement('input');
					ops.image_inp.type = 'file';
					ops.image_inp.accept = '.png';
					ops.image_inp.onchange = function(){
						//this.callback(URL.createObjectURL(this.files[0]));
						launcher.fn.process_files(this.files, this.callback);
					};
				};
				
				ops.image_inp.type = 'text';
				ops.image_inp.value = '';
				ops.image_inp.type = 'file';
				ops.image_inp.callback = callback;
				ops.image_inp.click();
				
			},
			
			set_cookie : function(cname, cvalue, exdays) {

			    var d = new Date();
			    if (!exdays)
			    	exdays = 365;

			    d.setTime(d.getTime() + (exdays*24*60*60*1000));
			    var expires = "expires="+ d.toUTCString();
			    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";

			},

			get_cookie : function(cname) {

			    var name = cname + "=";
			    var decodedCookie = decodeURIComponent(document.cookie);
			    var ca = decodedCookie.split(';');
			    for(var i = 0; i <ca.length; i++) {
			        var c = ca[i];
			        while (c.charAt(0) == ' ') {
			            c = c.substring(1);
			        }
			        if (c.indexOf(name) == 0) {
			            return c.substring(name.length, c.length);
			        }
			    }

			    return "";

			},
			
			dataURLtoBlob : (dataurl) => {

			    let arr = dataurl.split(','), 
			    	mime = arr[0].match(/:(.*?);/);
			    	
			    if (mime === null)
			    	return new Blob([''], {type:''});
			    		
			    let bstr = atob(arr[1]), 
			    	n = bstr.length, 
			    	u8arr = new Uint8Array(n);
			    	
			    while(n--){
			        u8arr[n] = bstr.charCodeAt(n);
			    }
			    
			    return new Blob([u8arr], {type:mime});
			    
			},
			
			url2blob : function(dataURL) {

				if (typeof dataURL !== 'string'){
					console.warn(dataURL);
					return '';
				};

			    dataURL = dataURL.split(',');

				var binStr = atob(dataURL[1]),
					len = binStr.length,
					arr = new Uint8Array(len);

				for (var i = 0; i < len; i++) {
					arr[i] = binStr.charCodeAt(i);
				}

				return new Blob([arr], {
					type: dataURL[0].substring(dataURL[0].indexOf('image/'), dataURL[0].indexOf(';')-1)
				});
			},

			check_upload_size : function(file) {
				
				var show_notice = launcher.apply_filters('upload_notice', true);
						
				if (
					!isNaN(launcher.data.min_upload) && 
					launcher.data.min_upload > 0 &&
					file.size/1024 < launcher.data.min_upload
				) {
					if (show_notice) 
						launcher.fn.notice(launcher.i('147')+' '+(file.size/1024).toFixed(2)+'KB (Minimum '+launcher.data.min_upload+'KB)', 'error', 8000);
					
					launcher.do_action('upload_minimum_limit');
					return false;
				};
				
				if (
					!isNaN(launcher.data.max_upload) && 
					launcher.data.max_upload > 0 &&
					file.size/1024 > launcher.data.max_upload
				) {
					if (show_notice) 
						launcher.fn.notice(launcher.i('147')+' '+(file.size/1024).toFixed(2)+'KB (Maximum '+launcher.data.max_upload+'KB)', 'error', 8000);
					
					launcher.do_action('upload_maximum_limit');
					return false;
				};	
				
				return true;
				
			},
			
			check_upload_dimensions : function(img) {
				
				var type = img.src.indexOf('data:image/png') === 0 ? 'png' : 'jpeg';
					
				if (
			    	img.src.indexOf('data:image/svg+xml') !== 0 && 
			    	launcher.data.min_dimensions !== '' && 
			    	typeof launcher.data.min_dimensions == 'object'
			    ) {
				    if (
				    	parseFloat(launcher.data.min_dimensions[0]) > img.width ||
				    	parseFloat(launcher.data.min_dimensions[1]) > img.height
				    ) {
					    launcher.fn.notice(launcher.i(160)+' '+launcher.data.min_dimensions.join('x'), 'notice', 3500);
						return null;
				    }	
			    };
			    
			    if (
			    	img.src.indexOf('data:image/svg+xml') !== 0 && 
			    	launcher.data.max_dimensions !== '' && 
			    	typeof launcher.data.max_dimensions == 'object'
			    ) {
				    
				    if (
				    	parseFloat(launcher.data.max_dimensions[0]) < img.width ||
						parseFloat(launcher.data.max_dimensions[1]) < img.height
				    ) {
					    
					    var cv = document.createElement('canvas');
					    
					    if (parseFloat(launcher.data.max_dimensions[0]) < img.width) {
						    
						    cv.width = parseFloat(launcher.data.max_dimensions[0]);
						    cv.height = cv.width*(img.height/img.width);
						    
						    if (cv.height > launcher.data.max_dimensions[1]) {
							    cv.width = launcher.data.max_dimensions[1]*(cv.width/cv.height);
							    cv.height = launcher.data.max_dimensions[1];
						    };
						    
					    } else if (parseFloat(launcher.data.max_dimensions[1]) < img.height) {
						    
						    cv.height = parseFloat(launcher.data.max_dimensions[1]);
						    cv.width = cv.height*(img.width/img.height);
						    
						    if (cv.width > launcher.data.max_dimensions[0]) {
							    cv.height = launcher.data.max_dimensions[0]*(cv.height/cv.width);
							    cv.width = launcher.data.max_dimensions[0];
						    };
					    
					    };
					    
					    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
					    
					    return cv.toDataURL('image/'+type);
					    
				    }
			    };
				
				return img.src;
				
			},
			
			get_blob : function(url, callback) {

				var xhr = new XMLHttpRequest();

				xhr.open("GET", url, true);
				xhr.responseType = "blob";
				xhr.overrideMimeType("text/plain;charset=utf-8");
				xhr.onload = function(){
					var a = new FileReader();
				    a.onload = callback;
				    a.readAsDataURL(this.response);
				};
				xhr.onreadystatechange = function (e) {  
				    if (xhr.readyState === 4 && xhr.status !== 200)
				        callback(1);
				};
				
				xhr.send(null);

			},

			process_variations : function(values, el) {
				
				var stages = launcher.ops.product_data.stages,
					vari_data = {
						name: launcher.ops.product_data.name,
						description: launcher.ops.product_data.description,
						price: launcher.ops.product_data.price,
						printings: $.extend(true, [], launcher.ops.product_data.printings),
						attributes: $.extend(true, {}, launcher.ops.product_data.attributes),
						stages: $.extend(true, {}, stages.stages ? stages.stages : stages),
						printing: null // active print, if not the first will be actived
					};
				
				vari_data.variation = null;
				
				// Set default form values	
				if (values !== null && typeof values == 'object') {
					Object.keys(values).map(function(k) {
						values[k] = values[k].trim();
						if (vari_data.attributes[k] !== undefined) {
							vari_data.attributes[k].value = values[k];
						} else if (k == 'printing') {
							vari_data.printing = values[k];
						}
					});
				}
				// if there are no variations
				if (
					typeof launcher.data.variations != 'object' || 
					launcher.data.variations.variations === undefined ||
					Object.keys(launcher.data.variations.variations).length === 0
				)
					return vari_data;
				
				// Get matched variation
					
				var obj = null, 
					varis = launcher.data.variations;
				
				// Keep options of current trigger element
				
				varis.attrs.map(function(a) {
					vari_data.attributes[a].allows = [];
					if (el !== null && el !== undefined && a == el.name) {
						vari_data.attributes[a].allows = launcher.ops.product_data.attributes[a].allows;
						vari_data.attributes[a].value = values[el.name];
					}
				});
				
				// Only show options of other attributes match with trigger_id 
				
				Object.keys(varis.variations).map(function(v) {
					
					var valid = true;
					
					Object.keys(varis.variations[v].conditions).map(function(c) {
						
						// Collect all match option value of OTHER attributes
						
						if (vari_data.attributes[c].allows === undefined)
							vari_data.attributes[c].allows = [''];
							
						if (
							el !== null && 
							el !== undefined && 
							c != el.name &&
							(
								varis.variations[v].conditions[el.name] == '' || // condition attr c is any
								values[el.name] == '' || // trigger is any
								varis.variations[v].conditions[el.name] == values[el.name]
								// condition attr c match with trigger
							) &&
							vari_data.attributes[c].allows.indexOf(varis.variations[v].conditions[c]) === -1
						) {
							
							if (varis.variations[v].conditions[c] !== '')
								vari_data.attributes[c].allows.push(varis.variations[v].conditions[c]);
							else {
								// if condition of variation is any, set allow all options of attr
								vari_data.attributes[c].values.split("\n").map(function(g) {
									g = g.split('|');
									if (vari_data.attributes[c].allows.indexOf(g[0].trim()) === -1)
										vari_data.attributes[c].allows.push(g[0].trim());
								});
							}
							
							if (values[c] == varis.variations[v].conditions[c])
								vari_data.attributes[c].value = values[c];
						} else if (el === null || el === undefined) {
							if (varis.variations[v].conditions[c] == '') {
								vari_data.attributes[c].allows = [''];
								vari_data.attributes[c].values.split("\n").map(function(v) {
									vari_data.attributes[c].allows.push(v.split('|')[0].trim());
								});
							} else if (vari_data.attributes[c].allows.indexOf(varis.variations[v].conditions[c]) === -1)
								vari_data.attributes[c].allows.push(varis.variations[v].conditions[c]);
						}
						
						// Check valid variation
						
						if (
							varis.variations[v].conditions[c] !== '' &&
							(
								values[c] === undefined ||
								varis.variations[v].conditions[c] != values[c]
							)
						) valid = false;
					});
					
					// Valid first variation
					
					if (valid && obj === null) {
						obj = varis.variations[v];
						obj.id = v;
					}
					
				});
				
				// Found a variation matchs with attribute values selected
				
				if (obj !== null) {
					
					['price', 'sku', 'description', 'minqty', 'maxqty'].map(function(p) {
						if (obj[p] !== undefined && obj[p] !== null && obj[p] !== '')
							vari_data[p] = obj[p];
					});
					
					if (
						obj['cfgprinting'] === true &&
						obj['printings'] !== undefined && 
						obj['printings'] !== null && 
						obj['printings'] !== ''
					) {
						obj['printings'].map(function(p) {
							if (p['calculate'] && typeof p['calculate'] == 'string')
								p['calculate'] = launcher.fn.dejson(p['calculate']);
						});
						vari_data['printings'] = $.extend(true, [], obj['printings']);
						vari_data['printings_cfg'] = obj['printings_cfg'];
						vari_data['cfgprinting'] = true;
					};
					
					if (
						obj['cfgstages'] === true && 
						obj['stages'] !== undefined && 
						obj['stages'] !== null && 
						obj['stages'] !== ''
					) {
						vari_data['stages'] = $.extend(true, {}, obj['stages']);
						vari_data['cfgstages'] = true;
					};
					
					vari_data.variation = obj.id;
					
				}
				
				return vari_data;
				
			},
			
			set_url : function(name, val) {

				var url = window.location.href;

				url = url.split('#')[0].replace(/\,/g, '').split('?');

				if (url[1]) {

					var ur = {};

					url[1].split('&').map(function(s){
						s = s.split('=');
						ur[s[0]] = s[1];
					});

					url[1] = [];

					if (val === null)
						delete ur[name];
					else ur[name] = val;

					Object.keys(ur).map(function(s){
						url[1].push(s+'='+ur[s]);
					});

					url = url[0]+'?'+url[1].join('&');

				}else if(val !== null) url = url[0]+'?'+name+'='+val;


				window.history.pushState({}, "", url);

			},

			get_url : function(name, def) {

				var url = window.location.href.split('#')[0].split('?'),
					result = def;

				if (!url[1])
					return def;

				url[1].split('&').map(function(pam){
					pam = pam.split('=');
					if (pam[0] == name)
						result = pam[1];
				});

				return result;

			},
			
			price : function(p) {
				let price = this.number_format(
					parseFloat(p*1),
					parseInt(launcher.data.number_decimals),
					launcher.data.decimal_separator,
					launcher.data.thousand_separator,
				);
				return (launcher.data.currency_position === '0' ? price+launcher.data.currency : launcher.data.currency+price);
			},
			
			date : function(f, t){
				
				if (t === undefined || t === '')
					return '';
				
				if (typeof t == 'string' && (t.indexOf('-') > -1 || t.indexOf(':') > -1))
					t = new Date(t);
				else if (t.toString().split('.')[0].length === 10)
					t = new Date(parseFloat(t)*1000);
				else t = new Date(parseFloat(t));

				var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
					days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
					map = {
						't': (t.getMonth() < 10 ? '0' : '')+(t.getMonth()+1),
						'h': t.getHours(),
						'm': t.getMinutes(),
						'd': t.getDate(),
						'D': days[t.getDay()],
						'M': months[t.getMonth()],
						'y': t.getYear(),
						'Y': t.getFullYear(),
					};
					str = '';


				f.split('').map(function(s){
					str += map[s] ? map[s] : s;
				});

				return str;

			},

			stages_image : function(stages) {
				
				for(var s in stages) {
					if (!stages[s].image) {
						stages[s].image = (
							stages[s].source == 'raws' ? 
							launcher.cfg.assets+'raws/' : 
							launcher.data.upload_url
						)+stages[s].url;
					}
				}
				
				return stages;
				
			},
			
			get_type : function(src) {
				
				if (src.indexOf('data:image/jpeg') > -1)
					return 'jpeg';
				else if (src.indexOf('data:image/png') > -1)
					return 'png';
				else if (src.indexOf('data:image/svg') > -1)
					return 'svg';
				if (src.split('.').pop() == 'jpg')
					return 'jpeg';
				else if (src.split('.').pop() == 'png')
					return 'png';
				else if (src.split('.').pop() == 'svg')
					return 'svg';
				
				return 'jpeg';
				
			},
			
			enjson : function(str) {
				return btoa(encodeURIComponent(JSON.stringify(str)));
			},
			
			dejson : function(str) {
				return typeof str == 'string' ? JSON.parse(decodeURIComponent(atob(str))) : str;
			},
			
			slugify : function(text) {
				
			  var a = 'àáạäâãấầẫậạăắằẵặèéëêếềễẹệìíĩïîịòóöôốồỗộọùúüûũụùúũđñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;',
			  	  b = 'aaaaaaaaaaaaaaaaeeeeeeeeeiiiiiiooooooooouuuuuuuuudncsyoarsnpwgnmuxzh------',
			  	  p = new RegExp(a.split('').join('|'), 'g');
			
			  return text.toString().toLowerCase()
					.replace(/\s+/g, '-')
					.replace(p, function(c) {return b.charAt(a.indexOf(c));}) 
					.replace(/&/g, '-and-')
					.replace(/[^\w\-]+/g, '')
					.replace(/\-\-+/g, '-')
					.replace(/^-+/, '')
					.replace(/-+$/, '');

			},
			
			number_format : function (number, decimals, dec_point, thousands_sep) {
			    // Strip all characters but numerical ones.
			    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
			    var n = !isFinite(+number) ? 0 : +number,
			        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
			        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
			        s = '',
			        toFixedFix = function (n, prec) {
			            var k = Math.pow(10, prec);
			            return '' + Math.round(n * k) / k;
			        };
			    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
			    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
			    if (s[0].length > 3) {
			        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
			    }
			    if ((s[1] || '').length < prec) {
			        s[1] = s[1] || '';
			        s[1] += new Array(prec - s[1].length + 1).join('0');
			    }
			    return s.join(dec);
			},
			
			get_color : function (attrs, full) {
	    
			    var color = '#f0f0f0';
		    
			    if (typeof attrs == 'object') {
				    Object.keys(attrs).map(function(i) {
					    if (attrs[i].type == 'product_color') {
						    if (typeof attrs[i].values == 'string') {
								try {
									attrs[i].values = JSON.parse(attrs[i].values);
								} catch (ex) {}  
						    };
						    if (
						    	typeof attrs[i].values == 'object' &&
						    	attrs[i].values.options !== undefined
						    ) {
							    if (full === true) {
								    color = [];
								    attrs[i].values.options.map(function(c) {
									    color.push(c.value);
								    });
							    } else color =  attrs[i].values.options[0].value;
						    }
						}
				    });
			    }
			    
			    return color;
			    
		    },
			
			get_size : function(s, r) {
				
				if (r === undefined)
					r = 1;
				var w = 0,
					h = 0;
				
				if (s.size === undefined || s.size === '') {
					
					w = s.edit_zone.width;
					h = s.edit_zone.height;
					
				} else if (typeof s.size == 'string') {
					
					Object.keys(launcher.data.size_default).map(function(i){
						if (launcher.data.size_default[i].cm == s.size) {
							var si = launcher.data.size_default[i].px.split('x');
							w = parseFloat(si[0])/r;
							h = (parseFloat(si[1] !== undefined ? si[1] : si[0]))/r;
						}
					});
					
				} else if (typeof s.size == 'object') {
					
					w = parseFloat(s.size.width);
					h = parseFloat(s.size.height);
					
					if (s.size.unit == 'inch') {
						w *= (2.54*118.095238)/r;
						h *= (2.54*118.095238)/r;
					} else if (s.size.unit == 'cm') {
						w *= 118.095238/r;
						h *= 118.095238/r;
					}
					
				};
				
				return [w, h];
				
			},
			
			check_resolution : function(ds) {
				
				var p = launcher.data.selected_products.filter(function(p) {return p.id == launcher.data.selected_product;})[0],
						min = this.get_size(p.stages[p.active_stage], 300/parseFloat(launcher.data.min_ppi)),
						max = this.get_size(p.stages[p.active_stage], 300/parseFloat(launcher.data.max_ppi));
				
				if (
					launcher.data.min_ppi !== '' &&
					(
						(ds.width/ds.height > min[0]/min[1] && ds.naturalWidth < min[0]) ||
						(ds.width/ds.height < min[0]/min[1] && ds.naturalHeight < min[1])
					)
				) 
					return -1;
				
				if (
					launcher.data.max_ppi !== '' &&
					(
						(ds.width/ds.height > max[0]/max[1] && ds.naturalWidth > max[0]) ||
						(ds.width/ds.height < max[0]/max[1] && ds.naturalHeight > max[1])
					)
				) 
					return 0;
				
				return 1;
					
			},
			
			pimg : function(stage) {
				
				return ((stage.source !== undefined && stage.source == 'raws' ) ? 
							launcher.cfg.tool_assests+'raws/' :  launcher.cfg.upload_url
						)+stage.url;
					
			},
			
			copy : function(text) {
				
				var input = document.createElement('input');
			    input.setAttribute('value', text.replace(/\&amp\;/g, '&'));
			    document.body.appendChild(input);
			    input.select();
			    document.execCommand('copy');
			    document.body.removeChild(input);
					
			},
			
			escape : function(n) {
				var e = /\{\{([^\}]+?)\}\}(?!\})|\{\{\{([\s\S]+?)\}\}\}|<#([\s\S]+?)#>|$/g,
					B = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};
				return n=null==n?"":""+n,e.test(n)?n.replace(/(?:&|<|>|"|'|`)/g,function(t){return B[t]}):n;
			},
			
			q : function(s, m) {
				return (m ? document.querySelectorAll(s) :  document.querySelector(s));
			}

		},
		
		process : {
			
			steps : {
				
				'products' : function (o) {
					
					if (o.products === undefined || o.products.length === 0) {
						o.next_btn.addClass('disabled').off('click');
					} else {
						o.next_btn.removeClass('disabled').off('click').on('click', function(e) {
							launcher.template.render({
								id: 'design',
								inner: '#lumise-step-designs'
							});
						});
					};
					
					o.next_btn.html(launcher.lang['5']+' <i class="iconk-android-arrow-forward"></i>');
					o.back_btn.hide().off('click');
					
					launcher.process.draft('products');
					
					return;
					
					o.back_btn.css({display: (launcher.data.cms_products.length > 0) ? 'inline-block' : 'none'})
						.off('click')
						.on('click', function(e) {
							launcher.template.render({
								id: 'type',
								inner: '#lumiseLauncher'
							});
							e.preventDefault();
						});
					
				},
				
				'designs' : function (o) {
					
					if (
						o.products !== undefined && 
						o.products.length > 0 &&
						o.products.filter(function(p) {
							return Object.keys(p.stages).filter(function(s) {
									return p.stages[s].design !== undefined;
									}).length === 0;
						}).length === 0
					) {
						o.next_btn.removeClass('disabled').off('click').on('click', function(e) {
							launcher.template.render({
								id: 'details',
								inner: '#lumise-step-details'
							});
						});
					} else {
						o.next_btn.addClass('disabled').off('click');
					};
					
					o.next_btn.html(launcher.lang['5']+' <i class="iconk-android-arrow-forward"></i>');
					
					o.back_btn.css({opacity: 1, display: 'inline-block'}).off('click').on('click', function(e) {
						launcher.template.render({
							id: 'products',
							inner: '#lumise-step-products'
						});
						launcher.process.draft('products');
						e.preventDefault();
					});
					
					launcher.process.draft('designs');
					
				},
				
				'details' : function (o) {
					
					if (
						o.products.filter(function(p) {
							return (
								p.details === undefined ||
								p.details.name === undefined || 
								p.details.name === '' || 
								p.details.price === undefined || 
								p.details.price === '' || 
								p.details.description === undefined || 
								p.details.description === ''
							);
						}).length === 0
					) {
						o.next_btn.off('click').on('click', launcher.process.publish);
					} else {
						o.next_btn.addClass('disabled').off('click');
					};
					
					o.next_btn.html(launcher.lang['3']+' <i class="iconk-android-arrow-forward"></i>').removeClass('disabled');
					
					$('#lumise-product-details [data-inp]').each(function() {
						if (this.value === '') {
							this.style.border = '1px solid red';
						} else {
							this.style.border = '';
						}
					});
					
					o.back_btn.css({opacity: 1, display: 'inline-block'}).off('click').on('click', function(e) {
						launcher.template.render({
							id: 'design',
							inner: '#lumise-step-designs'
						});
						launcher.process.draft('designs');
						e.preventDefault();
					});
					
					launcher.process.draft('details');
					
				}
				
			},
			
			design : function() {
				
				var product = launcher.data.selected_products.filter(function(p) {
						return p.id == launcher.data.selected_product;
					})[0],
					stage = product.stages[product.active_stage];
				
				if (stage.design !== undefined && typeof stage.design == 'object') {
				
					var img = new Image();
				
					img.onload = function() {
						
						$('#lumise-edit-zone').html('').append(this);
						
						if (
							Math.abs(
								this.width/this.height - ((this.parentNode.offsetWidth-2)/(this.parentNode.offsetHeight-2))
							) > 0.005
						) {
							
							launcher.template.render({
								id: 'aligns',
								'inner': '#lumise-design-tools',
								data: {
									el: this
								}
							});
							
							var h = this.offsetHeight,
								ph = this.parentNode.offsetHeight,
								w = this.offsetWidth,
								pw = this.parentNode.offsetWidth,
								t = (((h/2)/ph)*100),
								l = (((w/2)/pw)*100);
								
							if (stage.design.left !== undefined) {
								this.style.left = (stage.design.left+l-(l*(stage.design.left/50)))+'%';
							} else if (stage.design.top !== undefined) {
								this.style.top = (stage.design.top+t-(t*(stage.design.top/50)))+'%';
							};
							
							if (stage.design.marginLeft !== undefined) {
								this.style.marginLeft = (stage.design.marginLeft*100)+'%';		
							} else if (stage.design.marginTop !== undefined) {
								this.style.marginTop = (stage.design.marginTop*100)+'%';	
							}
						
						};
						
						launcher.process.image(stage);
						
					};
					
					img.onmousedown = function(e) {
						
						var clientX = e.clientX,
							clientY = e.clientY,
							el = this,
							left = el.style.marginLeft ? this.style.marginLeft : '0',
							top = el.style.marginTop ? this.style.marginTop : '0';
						
						if (left.indexOf('%')) {
							left = parseFloat(left.replace('%', ''))*el.parentNode.offsetWidth*0.01;
						} else if (left.indexOf('px')) {
							left = parseFloat(left.replace('px', ''));
						} else left = 0;
						
						if (top.indexOf('%')) {
							top = parseFloat(top.replace('%', ''))*el.parentNode.offsetWidth*0.01;
						} else if (top.indexOf('px')) {
							top = parseFloat(top.replace('px', ''));
						} else top = 0;
							
						$(document).off('mousemove mouseup').on('mousemove', function(e) {
							
							if (el.naturalWidth/el.naturalHeight < el.parentNode.offsetWidth/el.parentNode.offsetHeight) {
								
								var ml = Math.abs(left + (e.clientX-clientX)) > 3 ? (left + (e.clientX-clientX)) : 0;
								
								el.style.marginLeft = ml+'px';
								
								if (el.offsetLeft-(el.offsetWidth/2) < 0) {
									ml = -(((el.parentNode.offsetWidth-2)/2)-(el.offsetWidth/2));
									el.style.marginLeft = ml+'px';
								}else if (el.offsetLeft+(el.offsetWidth/2) > el.parentNode.offsetWidth-2) {
									ml = (((el.parentNode.offsetWidth-2)/2)-(el.offsetWidth/2));
									el.style.marginLeft = ml+'px';
								}
								
								stage.design.marginLeft = ml/(el.parentNode.offsetWidth-2);
								
							} else if (el.naturalWidth/el.naturalHeight > el.parentNode.offsetWidth/el.parentNode.offsetHeight) {
								
								var mt = Math.abs(top + (e.clientY-clientY)) > 3 ? (top + (e.clientY-clientY)) : 0;
								el.style.marginTop = mt+'px';
								
								if (el.offsetTop-(el.offsetHeight/2) < 0) {
									mt = -(((el.parentNode.offsetHeight-2)/2)-(el.offsetHeight/2));
									el.style.marginTop = mt+'px';
								}else if (el.offsetTop+(el.offsetHeight/2) > el.parentNode.offsetHeight-2) {
									mt = (((el.parentNode.offsetHeight-2)/2)-(el.offsetHeight/2));
									el.style.marginTop = mt+'px';
								}
								
								stage.design.marginTop = mt/(el.parentNode.offsetWidth-2);
								
							};
							
							e.preventDefault();
							return false;
							
						}).on('mouseup', function() {
							
							$(document).off('mousemove mouseup');
							
							if (stage.design.marginTop) 
								el.style.marginTop = (stage.design.marginTop*100)+'%';
							else if (stage.design.marginLeft) 
								el.style.marginLeft = (stage.design.marginLeft*100)+'%';
							
							launcher.process.image(stage);
								
						});
						
						e.preventDefault();
						return false;
						
					};
					
					img.src = stage.design.url;
					
				} else {
					launcher.template.render({
						id: 'recent_designs',
						'inner': '#lumise-design-tools',
						data: {
							el: this
						}
					});
					delete stage.design;
					launcher.process.image(stage);
				}
				
			},
			
			image : function(stage, callback) {
				
				if (stage.image === undefined)
					stage.image = launcher.fn.pimg(stage);
				
				launcher.process.pos_design(stage);
				
				if (stage.image_el === undefined) {
					stage.image_el = new Image();
					stage.image_el.onload = function() {
						launcher.process.fill_design(stage, callback);
					};
					stage.image_el.src = stage.image;
					
				} else return launcher.process.fill_design(stage, callback);
				
			},
			
			pos_design : function(stage) {
				
				if ($('#lumise-edit-zone>img').length > 0) {
					let img = $('#lumise-edit-zone>img').get(0);
					stage.design.css = "width:"+img.offsetWidth+"px;height:"+img.offsetHeight+"px;top:"+Math.round(img.offsetTop-(img.offsetHeight/2))+"px;left:"+Math.round(img.offsetLeft-(img.offsetWidth/2))+"px";
					stage.design.scale = stage.design.width/img.parentNode.offsetWidth;
					stage.design.offset = {
						top: Math.round(img.offsetTop-(img.offsetHeight/2)),
						left: Math.round(img.offsetLeft-(img.offsetWidth/2)),
						width: img.offsetWidth,
						height: img.offsetHeight,
						natural_width: stage.design.width,
						natural_height: stage.design.height
					};
				}
					
			},
			
			fill_design : function(stage, callback) {
				
				let do_callback = function() {
					
					var product = launcher.data.selected_products.filter(function(p) {
							return p.id == launcher.data.selected_product;
						})[0];
					
					if (Object.keys(product.stages)[0] == product.active_stage) {
						$('#lumise-selected-products li[data-product="'+product.id+'"] img')
							.attr({src: stage.screenshot});
					};
					
					$('#lumise-design-screen ul[data-view="stages-nav"] li[data-stage="'+product.active_stage+'"] img')
						.attr({src: stage.screenshot});
					
					if (typeof callback == 'function')
						callback(stage);
					
					launcher.process.draft('designs');
				
				};
				
				if (
					typeof stage.design == 'object' && 
					stage.design.url !== undefined && 
					stage.design.url !== '' &&
					stage.image_el !== undefined
				) {
					
					var ds = new Image();
					
					ds.stage = stage;
					ds.onload = function() {
						
						var stage = this.stage,
							
							canvas_screenshot = document.createElement('canvas'),
							ctx_screenshot = canvas_screenshot.getContext('2d'),
							
							canvas_print = document.createElement('canvas'),
							ctx_print = canvas_print.getContext('2d'),
							size = launcher.fn.get_size(stage, 1),
							
							bw = stage.image_el.naturalWidth,
							bh = stage.image_el.naturalHeight,
							ew = (stage.edit_zone.width/stage.product_width)*bw,
							eh = (stage.edit_zone.height/stage.product_height)*bh,
							el = (bw/2)-(ew/2)+((stage.edit_zone.left/stage.product_width)*bw),
							et = (bh/2)-(eh/2)+((stage.edit_zone.top/stage.product_height)*bh),
							
							dw = ew,
							dh = eh,
							dl = el,
							dt = et,
							
							pl = 0,
							pt = 0,
							pw = size[0],
							ph = size[1];
							
						if (ds.width*(eh/ew) < ds.height) {
							
							dl += (ew-(eh*(ds.width/ds.height)))/2;
							dw = eh*(ds.width/ds.height);
							
							pl += (size[0]-(size[1]*(ds.width/ds.height)))/2;
							pw = size[1]*(ds.width/ds.height);
							
							if (stage.design.marginLeft !== undefined) {
								dl += ew*stage.design.marginLeft;
								pl += size[0]*stage.design.marginLeft;
							}
							
						} else {
							
							dt += (eh-(ew*(ds.height/ds.width)))/2;
							dh = ew*(ds.height/ds.width);
							
							pt += (size[1]-(size[0]*(ds.height/ds.width)))/2;
							ph = size[0]*(ds.height/ds.width);
							
							if (stage.design.marginTop !== undefined) {
								dt += ew*stage.design.marginTop;
								pt += size[0]*stage.design.marginTop;
							}
							
						}
						
						canvas_screenshot.width = stage.image_el.naturalWidth;
						canvas_screenshot.height = stage.image_el.naturalHeight;
						
						ctx_screenshot.fillStyle = stage.color;
						ctx_screenshot.fillRect( 0, 0, canvas_screenshot.width, canvas_screenshot.height );
						
						if (stage.overlay)
							ctx_screenshot.drawImage(ds, dl, dt, dw, dh);
							
						ctx_screenshot.drawImage(
							stage.image_el, 0, 0, stage.image_el.naturalWidth, stage.image_el.naturalHeight
						);
						
						if (!stage.overlay)
							ctx_screenshot.drawImage(ds, dl, dt, dw, dh);
						
						HERMITE.resample_single(canvas_screenshot, canvas_screenshot.width, canvas_screenshot.height, true);
						
						stage.screenshot = launcher.blob_url.create(canvas_screenshot.toDataURL('image/jpeg', 0.75));
						
						
						dh = ds.height*(500/ds.width);
						dw = 500;
						
						if (dh > 500) {
							dw = ds.width*(500/ds.height);
							dh = 500;
						};
						
						canvas_screenshot.width = dw;
						canvas_screenshot.height = dh;
						
						ctx_screenshot.clearRect(0, 0, dw, dh);
						
						ctx_screenshot.drawImage(ds, 0, 0, dw, dh);
						
						HERMITE.resample_single(canvas_screenshot, dw, dh, true);
						
						stage.design.print_thumbnail = launcher.blob_url.create(canvas_screenshot.toDataURL('image/png'));
						
						launcher.blob_url.clear();
						
						/* Fill design into printing file */
						
						canvas_print.width = size[0];
						canvas_print.height = size[1];
						
						ctx_print.drawImage(ds, pl, pt, pw, ph);
						
						stage.design.print_data = canvas_print.toDataURL('image/png');
						
						do_callback();
						
					};
					
					ds.src = stage.design.url;
					
				} else {
					stage.screenshot = stage.image;
					do_callback();
				}
				
			},
			
			draft : function(step, forced) {
				
				if (launcher.data.load_draft === true) {
					clearTimeout(launcher.data.load_draft_timmer);
					launcher.data.load_draft_timmer = setTimeout(function() {
						launcher.data.load_draft = null;
					}, 300);
					return;
				}
				
				if (launcher.data.save_draft === true && forced !== true) {
					clearTimeout(launcher.data.save_draft_timer);
					launcher.data.save_draft_timer = setTimeout(function() {
						launcher.data.save_draft = false;
					}, 300);
					return;
				} else launcher.data.save_draft = true;
				
				var selected_products = [], valid = true;
				
				launcher.data.selected_products.map(function(sp) {
					
					var prod = {id: sp.id, stages: {}};
							
					Object.keys(sp.stages).map(function(s) {
						
						prod.stages[s] = {color: sp.stages[s].color};
						
						if (sp.stages[s].design !== undefined) {
							
							if (
								sp.stages[s].design.print_thumbnail === undefined || 
								launcher.blob_url.storage[sp.stages[s].design.print_thumbnail] === undefined
							) return valid = false;
							
							prod.stages[s].design = $.extend({}, sp.stages[s].design, true);
							prod.stages[s].design.url = launcher.blob_url.storage[prod.stages[s].design.url];
							prod.stages[s].design.print_thumbnail = launcher.blob_url.storage[prod.stages[s].design.print_thumbnail];
						};
						if (sp.stages[s].screenshot !== undefined)
							prod.stages[s].screenshot = launcher.blob_url.storage[sp.stages[s].screenshot];
					});
					
					prod.is_rendered = sp.is_rendered;
					prod.profit = sp.profit;
					prod.selected_colors = sp.selected_colors;
					prod.active_stage = sp.active_stage;
					prod.color = sp.color;
					prod.details = sp.details;
					
					selected_products.push(prod);
						
				});
				
				if (!valid)
					return setTimeout(launcher.process.draft, 500, step, forced);
				
				var draft_data = {
						id: 'default-draft',
						step: step,
						type: launcher.data.type,
						version: launcher.cfg.version,
						selected_products: selected_products,	
						selected_product: launcher.data.selected_product
					};
				
				launcher.indexed.save(draft_data, 'draft-campaigns', function(res) {
					
					return;
					
					var loc = localStorage.getItem('LUMISE-DRAFT'),
						current = 'default-draft';
					
					if (loc === null || loc === '')
						loc = {};
					else loc = JSON.parse(loc);
					
					if (loc[current] === undefined){
						loc[current] = {
							label: 'Untitled',
							created: new Date().getTime(),
							updated: new Date().getTime(),
							type: launcher.data.type
						}
					} else {
						loc[current].updated = new Date().getTime();
					}
					
					var sort = Object.keys(loc).sort(function(a,b){return loc[b].created-loc[a].created;}),
						sav = {};
					
					for (var i=0; i<sort.length; i++) {
						if (i >= 100) {
							delete loc[sort[i]];
							launcher.indexed.delete(sort[i], 'draft-campaigns');
						} else {
							sav[sort[i]] = loc[sort[i]];
						}
					}
					
					localStorage.setItem('LUMISE-DRAFT', JSON.stringify(loc));
					
					launcher.template.render({
						id: 'draft',
						inner: '#lumise-draft-campaigns'
					});
					
				});
				
			},
			
			publish : function () {
				
				var formData = new FormData(),
					products = [],
					designs_stack = {},
					total = 0;
				
				launcher.data.selected_products.map(function(p) {
					
					let designs = {};
					
					Object.keys(p.stages).map((s) => {
						
						let d = p.stages[s];
							
						if (d.design && d.design.id) {
							
							designs[s] = {
								id : d.design.id,
								css : d.design.css.replace(/\s/g, ''),
								scale : d.design.scale,
								offset : d.design.offset 
							};
							
							/*
							*	@ anti double data designs
							*/
							
							if (
								designs_stack[d.design.id] === undefined && 
								d.design.print_data !== undefined &&
								d.design.print_data !== null &&
								d.design.print_data !== ''
							) {
								
								let dsg = {
									id: d.design.id,
									file: Math.random().toString(36).replace('.', '')+'.png',
									thumbnail: Math.random().toString(36).replace('.', '')+'.png'
								};
								
								formData.append(
									d.design.id, 
									new File(
										[launcher.fn.dataURLtoBlob(d.design.print_data)], 
										dsg.file
									)
								);
								
								if (launcher.blob_url.storage[d.design.print_thumbnail] !== undefined) {
									formData.append(
										d.design.id+'-thumbnail', 
										new File(
											[launcher.fn.dataURLtoBlob(launcher.blob_url.storage[d.design.print_thumbnail])], 
											dsg.thumbnail
										)
									);
								};
								total += d.design.print_data.length+d.design.print_thumbnail.length;
								
								designs_stack[d.design.id] = dsg;
								
							}
						};
						
						if (
							d.screenshot !== undefined && 
							launcher.blob_url.storage[d.screenshot] !== undefined
						) {
							designs[s].screenshot = Math.random().toString(36).replace('.', '')+'.jpg';
							formData.append(
								designs[s].screenshot, 
								new File(
									[launcher.fn.dataURLtoBlob(launcher.blob_url.storage[d.screenshot])], 
									designs[s].screenshot
								)
							);
							total += launcher.blob_url.storage[d.screenshot].length;
						}
						
					});
							
					products.push({
						id: p.id,
						name: p.details.name,
						price: p.price,
						design_price: p.details.price,
						description: p.details.description,
						designs: designs
					});
					
				});
				
				formData.append('products', launcher.fn.enjson(products));
				formData.append('designs', launcher.fn.enjson(designs_stack));
				
				formData.append('action', 'addon');
				formData.append('addon', 'vendors');
				formData.append('nonce', 'LAUNCHER-SECURITY:'+launcher.cfg.nonce);
				formData.append('launcher_fn', 'publish');
				formData.append('upload_size', total);
				
				if (total/1024000 > launcher.cfg.max_size) {
					return alert('Error: The upload file size is larger than the server configuration (upload '+total+' of max '+launcher.cfg.max_size+'MB');
				};
				
				        
				$.ajax({
				    data	:	 formData,
				    type	:	 "POST",
				    url		:	 launcher.cfg.ajax,
				    contentType: false,
				    processData: false,
				    xhr		:	 function() {
					    var xhr = new window.XMLHttpRequest();
					    xhr.upload.addEventListener("progress", function(evt){
					      if (evt.lengthComputable) {
					        var percentComplete = evt.loaded / evt.total;
					        if (percentComplete < 1)
					       		$('#lumiseLauncher').attr({'data-processing': parseInt(percentComplete*100)+'% '+launcher.lang[32]});
					       	else $('#lumiseLauncher').attr({'data-processing': launcher.lang[33]});
					      }
					    }, false);
					    return xhr;
					},
				    success	:	 function (res, status) {
					    if (res.success === true) {
						    launcher.template.render({
							    id: 'success',
							    inner: '#lumiseLauncher',
							    data: {
								    link: res.link
							    }
							});
					    } else {
						    launcher.template.render({
							    id: 'fail',
							    inner: '#lumiseLauncher',
							    data: {
									res: res
								}
							});
					    }
					    
					}
				});
				
			},
			
			order : function () {
				
				var formData = new FormData(), 
					total = this.prepare_products(formData);
				         
				$.ajax({
				    data	:	 formData,
				    type	:	 "POST",
				    url		:	 launcher.data.ajax+'&action=order&nonce=lumise-NONCE:'+launcher.data.nonce+'&upload_size='+total,
				    contentType: false,
				    processData: false,
				    xhr		:	 function() {
					    var xhr = new window.XMLHttpRequest();
					    xhr.upload.addEventListener("progress", function(evt){
					      if (evt.lengthComputable) {
					        var percentComplete = evt.loaded / evt.total;
					        if (percentComplete < 1)
					       		$('#lumiseLauncher').attr({'data-processing': parseInt(percentComplete*100)+'% '+launcher.lang[32]});
					       	else $('#lumiseLauncher').attr({'data-processing': launcher.lang[33]});
					      }
					    }, false);
					    return xhr;
					},
				    success	:	 function (res, status) {
					    if (res == '1') {
						   window.location.href = launcher.data.cart_url;
					    } else {
						    launcher.template.render({
							    id: 'fail',
							    inner: '#lumiseLauncher',
							    data: {
									res: res
								}
							});
					    }
					    
					}
				});
				
			}
				
		},
		
		render : {
			
			callback : {
				
				step : function(step) {
					
					var op = {
							next_btn : $('#lumise-steps-nav button[data-btn="continue"]'),
							back_btn : $('#lumise-steps-nav a[href="#back"]'),
							products : launcher.data.selected_products
						};
					
					if (['products', 'designs', 'details'].indexOf(step) > -1)
						$('.lumise-step:not([data-step="'+step+'"])').html('');
					
					$('#lumise-steps-body div.lumise-step,#lumise-steps-nav li[data-step]').removeClass('lumise-active lumise-done');
					$('#lumise-step-'+step+',#lumise-steps-nav li[data-step="'+step+'"]').addClass('lumise-active');
					$('#lumise-steps-nav li.lumise-active').prevAll('li[data-step]').addClass('lumise-done');
					
					launcher.process.steps[step](op);
					
				},
				
				main : function() {
					
					launcher.template.render({
						id: 'products',
						inner: '#lumise-step-products',
						callback: function() {
							launcher.template.render({
								id: 'draft',
								inner: '#lumise-draft-campaigns'
							});
							launcher.data.processed_draft = true;
						}
					});
					
					if (
						launcher.data.processed_draft === undefined
					) {
						$('#lumiseLauncher').addClass('before-render-draft');
						launcher.render.draft();
					};
					
				},
				
				products : function(el, args) {
					
					launcher.data.current_step = 'products';
					
					if (el.find('ul.lumise-list-products[data-category=""] li').length === 0)
						el.find('ul.lumise-list-products[data-category=""], h3[data-category=""]').remove();
					
					el.find('li[data-product]').on('click', function(e) {
						
						if ($(this).attr('data-active') == 'true')
							$(this).removeAttr('data-active');
						else if (el.find('li[data-product][data-active="true"]').length <= 10)
							$(this).attr({'data-active': 'true'});
						else alert(launcher.lang['6']);
						
						launcher.data.selected_products = launcher.data.products.products.filter(function(p) {
							return ($('#lumise-step-products li[data-product="'+p.id+'"][data-active="true"]').length > 0);
						});
						
						launcher.render.callback.step('products');
						
						launcher.process.draft('products');
						
					});
					
					el.find('ul.lumise-list-products').each(function() {
						if ($(this).find('>li').length === 0) {
							el.find('[data-category="'+this.getAttribute('data-category')+'"]').remove();
						}
					});
					
					launcher.render.callback.step('products');
					
				},
				
				design : function(el, args) {
					
					launcher.data.current_step = 'design';
					
					if (launcher.data.selected_products.length === 0) {
						launcher.template.render({
							id: 'products',
							inner: '#lumise-step-products'
						});
						return;
					}
					
					el.find('button[data-func]').on('click', function(e) {
						if (this.getAttribute('data-func') == 'back') {
							launcher.template.render({
								id: 'products',
								inner: '#lumise-step-products'
							});
							launcher.process.draft('products');
						}
					});
					
					launcher.template.render({
						id: 'selected_products',
						'inner': '#lumise-selected-products'
					});
					
					launcher.template.render({
						id: 'design_screen',
						'inner': '#lumise-design-upload'
					});
					
					$('#lumise-selected-products')
					.sortable({
						handle: 'i[data-func="arrange"]',
						update: function() {
							var new_sel = [], id;
							$('#lumise-selected-products li[data-product]').each(function() {
								id = parseInt(this.getAttribute('data-product'));
								new_sel.push(launcher.data.selected_products.filter(function(p){return p.id == id;})[0])
							});
							launcher.data.selected_products = new_sel;
							launcher.process.draft('designs');
						}
					})
					.find('i[data-func="delete"]')
					.on('click', function() {
						if (confirm(launcher.lang['11'])) {
							
							var is_last = ($('#lumise-selected-products li[data-product]').length === 1),
								el = $(this).closest('li[data-product]'),
								is_active = el.hasClass('lumise-active'),
								pid = el.attr('data-product');
							
							el.remove();
							
							for (var i = launcher.data.selected_products.length-1; i>=0; i--){
								if (pid == launcher.data.selected_products[i].id) {
									delete launcher.data.selected_products[i];
									launcher.data.selected_products = launcher.data.selected_products.filter(function(p) {return 1==1;});
								}
							};
							
							if (is_last || launcher.data.selected_products.length === 0) {
								launcher.template.render({
									id: 'products',
									inner: '#lumise-step-products'
								});
								launcher.render.callback.step('products');
							} else {
								if (is_active) {
									launcher.data.selected_product = launcher.data.selected_products[0].id;
									launcher.template.render({
										id: 'design',
										inner: '#lumise-step-designs'
									});
								};
								launcher.render.callback.step('designs');
							}
							
							launcher.process.draft('designs');
							
						}
					});
					
					launcher.render.callback.step('designs');
					
				},
				
				selected_products : function(el, args) {
					
					el.on('click', function(e) {
						if (!$(this).hasClass('lumise-active')){
							
							launcher.data.selected_product = this.getAttribute('data-product');
							
							launcher.template.render({
								id: 'design_screen',
								'inner': '#lumise-design-upload'
							});
							
							$('#lumise-selected-products li[data-product]').removeClass('lumise-active');
							$(this).addClass('lumise-active');
							
							launcher.process.draft('designs');
						}
					});
				},
				
				design_screen : function(el, args) {
					
					var product = launcher.data.selected_products.filter(function(p) {
							return p.id == launcher.data.selected_product;
						})[0],
						next_btn = $('#lumise-steps-nav button[data-btn="continue"]');;
					
					el.find('ul[data-view="stages-nav"] li[data-stage]').on('click', function(e) {
						
						if ($(this).hasClass('lumise-active'))
							return;
							
						el.find('ul[data-view="stages-nav"] li[data-stage].lumise-active').removeClass('lumise-active');
						$(this).addClass('lumise-active');
						product.active_stage = this.getAttribute('data-stage');
						
						launcher.template.render({
							id: 'design_screen',
							'inner': '#lumise-design-upload'
						});
						
						launcher.process.draft('designs');
						
					});
					
					el.find('ul[data-view="colors"]').on('click', function(e) {
						
						if (e.target.tagName == 'I' && e.target.getAttribute('data-func') == "add") {
							$(this).parent().find('ul[data-float-global]').toggle();
						} else if (e.target.getAttribute('data-func') == "select") {
							
							product.color = e.target.getAttribute('data-color').split('|')[0].trim();
							
							$('#lumise-selected-products li[data-product].lumise-active span[data-view="p1"] img,#lumise-design-screen ul[data-view="stages-nav"] li[data-stage] img,#lumise-design-wrap img.base-view').css({background: product.color});
							$('#lumise-edit-zone').css({'border-color': launcher.fn.invert(product.color)});
							$(this).find('li[data-func="select"]').removeClass('lumise-active');
							
							$(e.target).addClass('lumise-active');
							
							Object.keys(product.stages).map(function(s, i) {
								
								product.stages[s].i = i;
								product.stages[s].id = s;
								product.stages[s].color = product.color;
								
								var prod_id = product.id;
								
								if (typeof product.stages[s].design == 'object') {
									launcher.process.image(product.stages[s]);
									launcher.process.draft('designs');
								};
								
								launcher.process.draft('designs');
								
							});
							
						}
					});
					
					el.find('ul[data-view="list-colors"] li').on('click', function(e) {
						if (e.target.getAttribute('data-func') == 'close') {
							el.find('ul[data-float-global]').hide();
							return;
						} else if ($(this).hasClass('lumise-active')) {
							if (product.selected_colors.length > 1 && product.color != this.getAttribute('data-c')) {
								$(this).removeClass('lumise-active');
								for (var i = product.selected_colors.length-1; i>=0 ;i--) {
									if (product.selected_colors[i] == this.getAttribute('data-color')) {
										delete product.selected_colors[i];
										el.find('ul[data-view="colors"]>li[data-color="'+this.getAttribute('data-color')+'"]').remove();
									}
								}
							}
						} else {
							$(this).addClass('lumise-active');
							product.selected_colors.push(this.getAttribute('data-color'));
							var c = this.getAttribute('data-color').split('|');
							el.find('ul[data-view="colors"] li[data-func="add"]').before('<li data-func="select" data-color="'+this.getAttribute('data-color')+'" style="background:'+c[0].trim()+'"><span>'+(c[1] !== undefined ? c[1].trim() : c[0].trim())+'</span></li>');
						};
						
						launcher.process.draft('designs');
						
					}).on('mouseover', function(e) {
						el.find('img.base-view').css({background: this.getAttribute('data-c')});
					}).on('mouseout', function(e) {
						el.find('img.base-view').css({background: product.color});
					});
					
					$('#lumise-upload-file').on('click', function(e) {
								
						launcher.fn.select_image(function(data) {
							
							var check_reso = new Image();
							
							check_reso.onload = function() {
								
								var check = launcher.fn.check_resolution(check_reso);
								
								if (check !== 1) {
									$('#lumise-upload-notice').css({zIndex: 2, opacity: 0}).animate({
										opacity: 1
									}, 250).shake().delay(7500).animate({
										opacity: 0
									}, 250, function() {
										this.style.zIndex = -1;
									}).find('span').html(
										check == -1 ? 
										launcher.lang['29']+' (min '+launcher.data.min_ppi+'PPI)' : 
										launcher.lang['149']+' (max '+launcher.data.max_ppi+'PPI)'
									);
									return;
								};
								
								var prod = launcher.data.selected_products.filter(function(p) {
											return p.id == launcher.data.selected_product
										})[0],
									stage = prod.stages[prod.active_stage];
								
								stage.design = {
									id: new Date().getTime().toString(36),
									url : data.url,
									width : this.width,
									height : this.height
								};
								
								stage.color = prod.color;
									
								launcher.process.design();
								
								launcher.render.callback.step('designs');
								
								launcher.blob_url.clear();
							
							};
							
							check_reso.src = data.url;
							
						});
						
					});
					
					$('#lumise-upload-notice i').on('click', function() {
						$('#lumise-upload-notice').stop().animate({
							opacity: 0
						}, 250, function() {
							this.style.zIndex = -1;
						});
					});
					
					el.find('svg[is="exit-preivew"]').on('click', function() {
						var product = launcher.data.selected_products.filter(function(p) {
								return p.id == launcher.data.selected_product;
							})[0];
						$('#lumise-design-screen').removeClass('is-preview');
						product.is_preview = false;
					});
					
					launcher.process.design();
					
				},
				
				aligns: function(el, args) {
					
					el.on('click', function(e) {
						
						
						var product = launcher.data.selected_products.filter(function(p) {
								return p.id == launcher.data.selected_product;
							})[0],
							stage = product.stages[product.active_stage],
							im = $('#lumise-edit-zone img').get(0);
						
						if (this.getAttribute('data-func') == "preview") {
							if (product.is_preview !== true) {
								$('#lumise-design-screen').addClass('is-preview');
								product.is_preview = true;
							} else {
								$('#lumise-design-screen').removeClass('is-preview');
								product.is_preview = false;
							};
							
							return launcher.process.draft('designs');
						};
						
						if (this.getAttribute('data-clear') == "design") {
							
							delete stage.design;
							delete stage.screenshot;
							delete stage.screenshot_data;
							
							launcher.template.render({
								id: 'design',
								inner: '#lumise-step-designs'
							});
							
							launcher.blob_url.clear();
							
							return;	
						};
						
						if (typeof stage.design != 'object')
							return;
							
						switch (this.getAttribute('data-align')) {
							case 'top': 
								delete stage.design.marginLeft;
								stage.design.marginTop = -(((im.parentNode.offsetHeight/2)-(im.offsetHeight/2)))/
														  im.parentNode.offsetWidth;
							break;
							case 'right': 
								delete stage.design.marginTop;
								stage.design.marginLeft = (((im.parentNode.offsetWidth/2)-(im.offsetWidth/2)))/
														  im.parentNode.offsetWidth;
							break;
							case 'bottom': 
								delete stage.design.marginLeft;
								stage.design.marginTop = (((im.parentNode.offsetHeight/2)-(im.offsetHeight/2)))/
														 im.parentNode.offsetWidth;
							break;
							case 'left': 
								delete stage.design.marginTop;
								stage.design.marginLeft = -(((im.parentNode.offsetWidth/2)-(im.offsetWidth/2)))/
														  im.parentNode.offsetWidth;
							break;
							case 'center': 
								delete stage.design.marginLeft;
								delete stage.design.marginTop;
							break;
						};
						
						launcher.process.design();
						
					});
						
				},
				
				recent_designs: function(el) {
					
					el.find('img').on('click', function(e) {
						var check = launcher.fn.check_resolution(this);
						if (check !== 1) {
							$('#lumise-upload-notice').css({zIndex: 2, opacity: 0}).animate({
								opacity: 1
							}, 250).shake().delay(7500).animate({
								opacity: 0
							}, 250, function() {
								this.style.zIndex = -1;
							}).find('span').html(
								check == -1 ? 
								launcher.lang['29']+' (min '+launcher.data.min_ppi+'PPI)' : 
								launcher.lang['149']+' (max '+launcher.data.max_ppi+'PPI)'
							);
						} else {
							
							var prod = launcher.data.selected_products.filter(function(p) {
										return p.id == launcher.data.selected_product
									})[0],
								stage = prod.stages[prod.active_stage];
							
							stage.design = {
								id: this.getAttribute('data-id'),
								url : this.src,
								width : this.naturalWidth,
								height : this.naturalHeight
							};
							
							stage.color = prod.color;
								
							launcher.process.design();
							
							launcher.render.callback.step('designs');
							
						}
					});
						
				},
				
				details : function(el, args) {
					
					launcher.data.current_step = 'details';
					launcher.render.callback.table_events(el);
					launcher.render.callback.step('details');
					
				},
				
				table_events : function(el) {
					
					el.find('[data-inp]').on('change', function() {
						
						var pid = this.getAttribute('data-inp'),
							val = this.value,
							product = launcher.data.selected_products.filter(function(p) {return p.id == parseInt(pid)});
						
						if (this.name == 'price') {
							if (isNaN(this.value) || parseFloat(this.value) < 0)
								val = 0;
							else val = parseFloat(this.value);
							this.value = val;
						};
						
						if (product[0] !== undefined) {
							if (product[0].details === undefined || typeof product[0].details != 'object')
								product[0].details = {};
							product[0].details[this.name] = val;
							launcher.process.draft('details');
							launcher.render.callback.step('details');
						}
													
					});
					
					el.find('[data-view="actions"] a').on('click', function(e) {
						
						if (this.getAttribute('href') == '#delete') {
							if (confirm(launcher.lang['11'])) {
								for (var i = launcher.data.selected_products.length-1; i>=0; i--) {
									if (launcher.data.selected_products[i].id == parseInt(this.getAttribute('data-product'))) {
										delete launcher.data.selected_products[i];
									}
								};
								launcher.data.selected_products = launcher.data.selected_products.filter(function(p){
									return p.id !== undefined;
								});
								if (launcher.data.selected_products.length > 0) {
									launcher.template.render({
										id: 'prices',
										inner: '#lumise-step-prices'
									});
									launcher.process.draft('prices');
								} else {
									launcher.template.render({
										id: 'products',
										inner: '#lumise-step-products'
									});
									launcher.process.draft('products');
								}
							}
						} else if (this.getAttribute('href') == '#edit') {
							launcher.data.selected_product = parseInt(this.getAttribute('data-product'));
							launcher.template.render({
								id: 'design',
								inner: '#lumise-step-designs'
							});
							launcher.process.draft('designs');
						}
						
						e.preventDefault();
						
					});
						
				},
				
				draft : function(el) {
					
					launcher.trigger({
						
						el: el,
						events: {
							'li[data-id]': 'item',
							'li[data-func="new"]': 'new',
							'i.iconk-files': 'toggle'
						},
						
						item: function(e) {
							
							e.preventDefault();
						
							var drafts = localStorage.getItem('LUMISE-DRAFT'),
								draft_id = this.getAttribute('data-id');
							
							if (drafts === null || drafts === '')
								drafts = {};
							else drafts = JSON.parse(drafts);
							
							if (e.target.getAttribute('data-func') == 'delete') {
								
								if (confirm(launcher.lang[150])) {
									
									delete drafts[draft_id];
									delete launcher.data.load_draft;
									
									localStorage.setItem('LUMISE-DRAFT', JSON.stringify(drafts));
									
									launcher.indexed.delete(draft_id, 'draft-campaigns');
									
									launcher.data.selected_products = [];
									launcher.data.selected_product = '';
									
									if (launcher.data.current_step == 'type') {
										launcher.template.render({
											id: 'type',
											inner: '#lumiseLauncher'
										});
										return;
									};
									
									launcher.template.render({
										id: 'main',
										inner: '#lumiseLauncher'
									});
									
								};
								
								return;
								
							};
							
							if ($(this).hasClass('active')) {
								var name = prompt(launcher.lang[152], $(this).find('text').text());
								if (name !== null) {
									drafts[draft_id].label = name;
									localStorage.setItem('LUMISE-DRAFT', JSON.stringify(drafts));
									$(this).find('text').html(name);
								};
								return;
							};
							
							var draft_id = this.getAttribute('data-id');
							
							if (launcher.data.current_step == 'type') {
								launcher.template.render({
									id: 'main',
									inner: '#lumiseLauncher',
									callback: function() {
										launcher.render.draft(draft_id);
									}
								});
							} else launcher.render.draft(draft_id);
							
						},
						
						new: function(e) {
							
							delete launcher.data.load_draft;
							
							launcher.data.selected_products = [];
							launcher.data.selected_product = '';
							
							launcher.template.render({
								id: 'main',
								inner: '#lumiseLauncher'
							});
	
						},
						
						toggle: function(e) {
							if ($(this).parent().attr('data-active') != 'true')
								$(this).parent().attr({'data-active': 'true', 'data-globe': 'pop'});
							else $(this).parent().attr({'data-active': 'false'});
						}
						
					});
							
				},
				
				success : function(el) {
					
					launcher.data.current_step = 'success';
					
					$('#lumiseLauncher').removeAttr('data-processing');
					
				},
				
				fail : function(el) {
					
					launcher.data.current_step = 'fail';
					
					$('#lumiseLauncher').removeAttr('data-processing');
				
					el.find('button[data-func="try"]').on('click', function(e){
						window.location.reload();
						e.preventDefault();
					});
				} 
				
			},
			
			draft : function(callback) {
				
				launcher.data.load_draft = true;
					
				launcher.indexed.get('default-draft', 'draft-campaigns', function(res) {
					
					if (res === null || typeof res != 'object') {
						$('#lumiseLauncher').removeClass('before-render-draft');
						return;
					};
					
					launcher.data.type = res.type;
					launcher.data.campaign = res.campaign;
					launcher.data.selected_product = res.selected_product;
					
					var draft_products = {};
					
					res.selected_products.map(function(p) {
						draft_products[p.id] = p;
					});
					
					launcher.data.selected_products = launcher.data.products.products.filter(function(p) {
						if (draft_products[p.id] !== undefined) {
							
							p.is_rendered = false;
							if (draft_products[p.id].details)
								p.details = draft_products[p.id].details;
							p.selected_colors = draft_products[p.id].selected_colors;
							p.active_stage = draft_products[p.id].active_stage;
							p.color = draft_products[p.id].color;

							for (let s in p.stages)	{
								
								if (draft_products[p.id].stages[s] !== undefined) {
									
									if (
										draft_products[p.id].stages[s].design !== undefined &&
										draft_products[p.id].stages[s].design.url !== undefined
									) {
										p.stages[s].design = draft_products[p.id].stages[s].design;
										p.stages[s].design.url = launcher.blob_url.create(p.stages[s].design.url);
										p.stages[s].design.print_thumbnail = launcher.blob_url.create(
											p.stages[s].design.print_thumbnail
										);
									};
									
									if (
										draft_products[p.id].stages[s].screenshot !== undefined
									) {
										p.stages[s].screenshot = launcher.blob_url.create(
											draft_products[p.id].stages[s].screenshot
										);
									};
									
									if (draft_products[p.id].stages[s].color !== undefined)
										p.stages[s].color = draft_products[p.id].stages[s].color;
								}
							};
							
							return true;
						} return false;
					});
					
					var new_sel = [];
					res.selected_products.map(function(p) {
						new_sel.push(launcher.data.selected_products.filter(function(pd){return pd.id == p.id;})[0]);
					});
					
					launcher.data.selected_products = new_sel;
					
					setTimeout(function() {
						$('#lumiseLauncher').removeClass('before-render-draft');
						launcher.data.load_draft = null;
					}, 100);
					
					if (typeof callback === 'function') {
						callback(res);
						return;
					};
					switch (res.step) {
						case 'products': 
							launcher.template.render({
								id: 'products',
								inner: '#lumise-step-products'
							});
						break;
						case 'designs': 
							launcher.template.render({
								id: 'design',
								inner: '#lumise-step-designs'
							});
						break;
						case 'prices': 
							launcher.template.render({
								id: 'prices',
								inner: '#lumise-step-prices'
							});
						break;
						case 'details': 
							launcher.template.render({
								id: 'details',
								inner: '#lumise-step-details'
							});
						break;
					}
					
				});
				
			}
			
		},
		
		template : {
			
			cache : {},
			
			cache_txt : '',
			
			render : function(args, data){
				
				if (args === undefined)
					return '';
					
				if (typeof args == 'string')
					args = {id: args, data: typeof data == 'object' ? data : {}};
				
				if (typeof args.data != 'object')
					args.data = {};
					
				args = launcher.apply_filters('template_args', args);
					
				var tmpl = launcher.template.tmpl(args.id, args.data);
				
				if (tmpl === null)
					 return 'Not found template '+args.id;
					 
				var el = $(tmpl);
				
				el.attr({'data-lumise-tmpl': args.id});
				
				if (args.append !== undefined)
					$(args.append).eq(0).append(el);
				else if (args.preappend !== undefined)
					$(args.preappend).eq(0).preappend(el);
				else if (args.after !== undefined)
					$(args.after).eq(0).after(el);
				else if (args.before !== undefined)
					$(args.before).eq(0).before(el);
				else if (args.inner !== undefined) {
					$.cleanData($(args.inner).eq(0).find('*'));
					$(args.inner).eq(0).html('').append(el);
				} else return tmpl;
				
				setTimeout(function(el, args) {
					
					if (typeof launcher.render.callback[args.id] == 'function' && args.data.core_callback !== false)
						launcher.render.callback[args.id](el, args, $);
					
					if (typeof args.data.callback == 'function')
						args.data.callback(el, args, $);
					
					if (typeof args.callback == 'function')
						args.callback(el, args, $);
						
					launcher.do_action('template_render', args, el);
				
				}, 1, el, args);
				
			},
			
			tmpl : function(id, data){ 

				if (launcher.template.cache[id] === undefined) {
					
					var s = '', s1, l = launcher.template.cache_txt;
				
					if (l !== undefined && l.indexOf('<tmpl id="'+id+'">') > -1 ){
						s1 = l.indexOf('<tmpl id="'+id+'">') + ('<tmpl id="'+id+'">').length;
						s = l.substring( s1, l.indexOf('</tmpl>', s1) );
					} else return null;
					
					s = launcher.apply_filters('template_render', s.trim(), id);
					
					launcher.template.cache[id] = launcher.template.create(s);
					
				}
				
				return launcher.template.cache[id](data, launcher);
			
			},
			
			create : function(n){
				
				var t = {
						evaluate:/<#([\s\S]+?)#>/g,
						interpolate:/\{\{\{([\s\S]+?)\}\}\}/g,
						escape:/\{\{([^\}]+?)\}\}(?!\})/g,
						variable: "data"
					},
					K = /(.)^/,
					z = {"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},
					D = /\\|'|\r|\n|\u2028|\u2029/g,
					L = function(n){return"\\"+z[n]},
					e = RegExp([t.escape.source,t.interpolate.source,t.evaluate.source].join("|")+"|$","g"),
					u = 0,
					i = "__p+='";
					
				n.replace(e,function(t,r,e,o,a){
					return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':launcher.fn.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t 
				}), 
				i += "';\n", t.variable||(i="with(obj||{}){\n"+i+"}\n"), i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";
				
				try { 
					var o = new Function(t.variable||"obj", "launcher", "$", i)
				} catch(a) { 
					throw a.source=i,a
				}
				
				var c = function(n){
						return o.call(this,n,launcher, $)
					},
					f = t.variable||"obj";
				
				return c.source="function("+f+", launcher, $){\n"+i+"}",c
			
			},
			
			verify : function(callback) {
				
				this.cache_txt = localStorage.getItem('LAUNCHER_TMPL');
							
				if (
					this.cache_txt !== null &&
					this.cache_txt.indexOf('<---END-CONFIRMED--->') > -1 &&
					localStorage.getItem('LAUNCHER_TMPL_VER') == Math.random()//launcher.cfg.version 
				) {
					callback();
				} else {
					$.ajax({
						url: launcher.cfg.assets+'js/templates.js?ver='+launcher.cfg.version,
						dataType: "text",
						success: function(res) {
							launcher.template.cache_txt = res;
							localStorage.setItem('LAUNCHER_TMPL', res);
							localStorage.setItem('LAUNCHER_TMPL_VER', launcher.cfg.version);
							callback();
						}
					});
				}
			}
			
		},

		indexed : {

			req: null,
			db: null,
			stores: {
				'draft-campaigns': null,
			},

			init: function() {

				var t = this;

				t.req = indexedDB.open("lumise_launcher", 2);
				t.req.onsuccess = function (e) {

			        if ( e.target.result.setVersion) {
			            if ( e.target.result.version != t.ver) {
			                var setVersion =  e.target.result.setVersion(t.ver);
			                setVersion.onsuccess = function () {
				                t.store(e.target.result);
			                    t.ready(e.target.result);
			                };
			            }
			            else t.ready(e.target.result);
			        }
			        else t.ready(e.target.result);
			    };

			    t.req.onupgradeneeded = function (e) {
				    t.store(e.target.result);
			    };

			},

			ready : function(db) {
				
				this.db = db;
				
				try {
					launcher.do_action('db-ready');
				} catch (ex) {
					console.warn(ex.message);
					console.log(ex);
				};
				
			},

			save : function(obj, storeName, callback) {
				
				if (this.db == null)
					return callback(null);

				var trans = this.db.transaction([storeName], "readwrite");
		        var store = trans.objectStore(storeName);
				
				if (obj.id === null || obj.id === undefined || obj.id === '')
					return callback(null);
				
				obj = $.extend({created: new Date().getTime()}, obj, true);
				
				obj = launcher.indexed.prepare(obj);
				
				var process = store.put(obj, obj.id);

				if (typeof callback == 'function')
					process.onsuccess = callback;

			},

			get : function(id, storeName, callback){

				if (this.db == null)
					return callback(null);

				var trans = this.db.transaction([storeName], "readwrite");
			    var store = trans.objectStore(storeName);
				
				try{ var process = store.get(id); }catch(ex){};
				
				trans.oncomplete = function(event){
					callback(process !== undefined ? process.result : null);
				};
				trans.onerror = function(){
					callback(null);
				};

			},

			list : function(callback, storeName, onComplete){

				var t = this;
				if (t.db == null)
					return onComplete(null);

		        var trans = t.db.transaction([storeName], "readwrite");
			    var store = trans.objectStore(storeName);
			    var i = 0;

			    trans.oncomplete = onComplete;

			    var range = launcher.ops[storeName+'_cursor'] ?
			    			IDBKeyRange.upperBound(launcher.ops[storeName+'_cursor'], true) : null,
			    	cursorRequest = store.openCursor(range ,'prev');

			    cursorRequest.onerror = function(error) {
			        console.log(error);
			    };

			    cursorRequest.onsuccess = function(evt) {

				    if (i++ > 11 && typeof onComplete == 'function')
				    	return onComplete();

			        var cursor = evt.target.result;
			        if (cursor) {
				        callback(cursor.value);
				        if (onComplete != cursor.id)
			            	cursor.continue();
			        }else{
				        return (typeof onComplete == 'function' ? onComplete('done') : null);
				    }
			    };

			},

			store : function(db) {
				Object.keys(this.stores).map(function(s){
					try {
	                	db.createObjectStore(s);
					}catch(ex){};
                });
			},

			delete : function(id, store) {

				var tranc = this.db.transaction([store], "readwrite");
				tranc.objectStore(store).delete(id);

			},
			
			prepare : function(obj) {
				
				for (var n in obj) {
					if (
						obj[n] !== undefined &&
						obj[n] !== null &&
						typeof obj[n] ==="object"
					) { 
						if (
							obj[n].nodeType === 1 &&
							typeof obj[n].style === "object" &&
							typeof obj[n].ownerDocument === "object"
						) {
							delete obj[n];
						} else {
							obj[n] = launcher.indexed.prepare(obj[n]);
						}
					}
				}
				
				return obj;
				
			}
		},

		post : function(ops, callback){

			$.ajax({
				url: launcher.cfg.ajax,
				method: 'POST',
				data: launcher.apply_filters('ajax', $.extend({
					nonce	: 'LAUNCHER-SECURITY:'+launcher.cfg.nonce,
					ajax	: 'frontend',
					action	: 'addon',
					addon	: 'vendors'
				}, ops)),
				statusCode: launcher.response.statusCode,
				success: function(res) {
					if (typeof callback == 'function')
						return callback(res);
					else if (typeof launcher.response[ops.action] == 'function')
						launcher.response[ops.action](res);
				}
			});

		},

		response : {
			
			statusCode: {

				403: function() {

					$.post(
						launcher.data.ajax,
						launcher.apply_filters('ajax', {
							action: 'extend',
							name: 'general',
							nonce: launcher.data.nonce,
						}), function(res){

							if (res == '-1')
								return alert('Your session has expired, please reload the page and try again');

							launcher.data.nonce = res;
							
							return alert('We just updated your expired session. Please redo your action again');

						}
					);
					
				}

			}

		},

		mobile : function(canvas_view) {
			
			var ww = $(window).width(),
				wh = $(window).height();
				
			if (launcher.ops.excmobile)
				return;
			
			launcher.ops.window_width = ww;
				
			if (ww<1025) {
				
				$(window).on('scroll', function(e){
					e.stopPropagation();
					e.preventDefault();
					return false;
				});
				
			};
			
			if (ww<450) {
			
			}else if (ww<1025) {
				
				
			};
			
			launcher.ops.excmobile = true;
				
		},

		load : function() {
			
			launcher.data.cms_products = launcher.data.products.products.filter(function(p) {
				return (p.product !== '' && p.product !== 0 && p.product !== undefined);
			});
			
			
			launcher.template.render({
				id: 'main',
				inner: '#lumiseLauncher'
			});
			
			$(document).on('click', function(e) {
				if (
					(
						!e.target.getAttribute('data-float') &&
						$(e.target).closest('[data-float]').length === 0
					)
				) {
					$('[data-float-global]').hide();
				}
			});
			
		},
		
		init : function() {
			
			$.ajax({
				url: launcher_data_ajax,
				method: 'POST',
				data: {
					action: 'addon',
					nonce: 'LUMISE-INIT:'+launcher_data_nonce,
					addon: 'vendors',
					launcher_fn: 'init',
					ajax: 'frontend'
				},
				statusCode: launcher.response.statusCode,
				success: function(res) {
					
					launcher.data = $.extend(true, launcher.data, res.data);
					launcher.lang = res.lang;
					launcher.cfg = res.cfg;
					
					launcher.template.verify(launcher.load);
					
				}
			});
			
			$(document).on('click', function(e) {
				if (
					$(e.target).closest('[data-globe="pop"]').length === 0
				) $('[data-globe="pop"]').attr({'data-active': null});
			});
			
			launcher.indexed.init();
			
		}
		
	};
	
	launcher.init();
	
});
