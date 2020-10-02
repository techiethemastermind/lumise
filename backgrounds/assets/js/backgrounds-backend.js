jQuery(document).ready(function($) {
	
	var ops = {
		index: 0,
		q: '',
		category: '',
		backgrounds: [],
		last_result: null
	},
		trigger = function( obj ) {

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
		invert = function(color) {

			var r,g,b;

			if ( color !== undefined && color.indexOf('rgb') > -1) {

				color = color.split(',');
				r = parseInt(color[0].trim());
				g = parseInt(color[1].trim());
				b = parseInt(color[2].trim());

			} else if(color !== undefined) {
				if (color.length < 6)
					color += color.replace('#', '');
				var cut = (color.charAt(0)=="#" ? color.substring(1,7) : color.substring(0,6));
				r = (parseInt(cut.substring(0,2),16)/255)*0.213;
				g = (parseInt(cut.substring(2,4),16)/255)*0.715;
				b = (parseInt(cut.substring(4,6),16)/255)*0.072;
			}

			return (r+g+b < 0.5) ? '#DDD' : '#333';
		},
		lightbox = function(ops) {

			if (ops == 'close') {
				$('body').css({overflow: ''});
				return $('#lumise-lightbox').remove();
			}
			
			var tmpl = '<div id="lumise-lightbox" class="lumise-lightbox">\
							<div id="lumise-lightbox-body">\
								<div id="lumise-lightbox-content" class="%class%" style="min-width:%width%px">\
									%content%\
								</div>\
								%footer%\
								<a class="kalb-close" href="#close" title="Close">\
									<i style="font-size: 30px;margin-right: 10px;" class="dashicons dashicons-no-alt"></i>\
								</a>\
							</div>\
							<div class="kalb-overlay"></div>\
						</div>',
				cfg = $.extend({
					width: 1000,
					class: '',
					footer: '',
					content: '',
					onload: function(){},
					onclose: function(){}
				}, ops);

			if (cfg.footer !== '')
				cfg.footer = '<div id="lumise-lightbox-footer">'+cfg.footer+'</div>';

			tmpl = $(tmpl.replace(/\%width\%/g, cfg.width).
						replace(/\%class\%/g, cfg.class).
						replace(/\%content\%/g, cfg.content).
						replace(/\%footer\%/g, cfg.footer));

			$('.lumise-lightbox').remove();
			$('body').append(tmpl).css({overflow: 'hidden'});

			cfg.onload(tmpl);
			tmpl.find('a.kalb-close,div.kalb-overlay').on('click', function(e){
				cfg.onclose(tmpl);
				$('.lumise-lightbox').remove();
				$('body').css({overflow: ''});
				e.preventDefault();
			});

		},
		render = function(res) {
			
			ops.last_result = res;
			
			var cates = [
					'<ul data-view="categories">',
					'<h3>'+LumiseDesign.js_lang[56]+'</h3>',
					'<li data-id="" '+(res.category === '' ? 'class="active"' : '')+' data-lv="0"> '+LumiseDesign.js_lang[57]+'</li>'
				],
				prods = [
					'<h3 data-view="top">Backgrounds<input id="search-templates-inp" type="search" placeholder="Search backgrounds" value="'+encodeURIComponent(res.q)+'" /></h3>',
					'<ul data-view="items" data-grid="4">'
				];
			
			if (res.categories_full) {
				res.categories_full.map(function(c) {
					cates.push('<li data-id="'+c.id+'" '+(c.id == res.category ? 'class="active"' : '')+' data-lv="'+(c.lv ? c.lv : 0)+'">'+('&mdash;'.repeat(c.lv))+' '+c.name+'</li>');
				});
			}

			if (res.items && res.items.length > 0) {

				res.items.map(function(p) {
					
					prods.push(
						'<li data-id="'+p.id+'">\
							<span data-view="thumbn" data-start="Select item">\
								<img src="'+encodeURI(p.thumbnail_url)+'" />\
							</span>\
							<span data-view="name">'+p.name+'</span>\
						</li>'
					);
				});
				
				if (res.index+res.limit < res.total) {
					prods.push(
						'<li data-loadmore="'+(parseInt(res.index)+parseInt(res.limit))+'">\
							<span>Load more &rarr;</span>\
						</li>'
					);
				}
				
			}
			else prods.push('<li data-view="noitem" data-category="'+res.category+'"><br><br>Sorry, No item found<br><a href="'+LumiseDesign.admin_url+'lumise-page=background" class="button" target="_blank" style="margin-top: 10px;"><i class="fa fa-plus"></i> Add new</a></li>');
			
				
			if (res.index == 0) {
				
				ops.backgrounds = res.items;
				
				cates.push('</ul>');
				prods.push('</ul>');
				
				$('#lumise-lightbox-content').html('<div id="lumise-list-items-wrp"></div>');
				$('#lumise-list-items-wrp').html(cates.join('')).append(prods.join(''));
				
			}else{
				
				ops.backgrounds = ops.backgrounds.concat(res.items);
				
				$('#lumise-lightbox-content ul[data-view="items"] li[data-loadmore]').remove();
				prods[0] = '';
				prods[1] = '';
				$('#lumise-lightbox-content ul[data-view="items"]').append(prods.join(''));
			}
			
			trigger({
				
				el: $('#lumise-list-items-wrp'),
				
				events: {
					'ul[data-view="categories"] li': 'category',
					'ul[data-view="items"] li': 'select',
					'h3[data-view="top"] input:keyup': 'search',
					'li[data-loadmore]': 'load_more',
				},
				
				category: function(e) {

					load({
						category: this.getAttribute('data-id'), 
						index: 0, 
						q: $('#search-templates-inp').val()
					});
					
					e.preventDefault();
					
				},
				
				select: function(e) {
					
					if (this.getAttribute('data-loadmore') !== null)
						return e.data.load_more(e);
					
					var id = this.getAttribute('data-id'),
						bg = ops.backgrounds.filter(function(p){return p.id == id;});
					
					$(this).closest('#lumise-lightbox').remove();
					$('body').css({overflow: ''});
					
					if ($('#lumise-background-product img[data-id="'+bg[0].id+'"]').length === 0) {
						$('#lumise-background-product button[data-func="load"]').before(
							'<span>\
								<img height="34" data-id="'+bg[0].id+'" data-price="'+encodeURI(bg[0].price)+'" data-upload="'+encodeURI(bg[0].upload)+'" src="'+encodeURI(bg[0].thumbnail_url)+'" />\
								<i class="fa fa-times" data-func="delete"></i>\
							</span>'
						);
					}
					
					save_return();
					
					
				},
				
				load_more: function(e) {
					
					this.innerHTML = '<i class="fa fa-spin fa-spinner fa-2x"></i>';
					this.style.background = 'transparent';
					this.style.color = '#888';
					
					$(this).off('click');
					
					
					load({
						category: this.getAttribute('data-category'),
						index: this.getAttribute('data-loadmore'),
						q: $('#search-templates-inp').val()
					});
						
				},
				
				search: function(e) {
					
					if (e.keyCode !== undefined && e.keyCode === 13)
						load({q: this.value});
					
				}
				
			});

		},
		load = function(e) {
			
			if (e.index !== undefined)
				ops.index = e.index;
			if (e.q !== undefined)
				ops.q = e.q;
			if (e.category !== undefined)
				ops.category = e.category;
				
			if (ops.index === undefined || ops.index === 0) {
				lightbox({
					content: '<center style="margin-top:100px"><i class="fa fa-spin fa-spinner fa-3x"></i></center>'
				});
			};
			
			if (typeof e.preventDefault == 'function') {
				e.preventDefault();
				if (ops.last_result !== null)
					return render(ops.last_result);
			};
				
			$.ajax({
				url: LumiseDesign.ajax,
				method: 'POST',
				data: {
					nonce: 'LUMISE_ADMIN:'+LumiseDesign.nonce,
					ajax: 'backend',
					action: 'addon',
					component: 'backgrounds',
					category: ops.category !== undefined ? ops.category : '',
					q: ops.q !== undefined ? ops.q : '',
					index: ops.index !== undefined ? ops.index : 0,
					limit: 9
				},
				statusCode: {
					403: function(){
						alert('Error 403');
					}
				},
				success: render
			});
			
		},
		save_return = function() {
			$('#lumise-background-product').each(function() {
				var backgrounds = [];
				$(this).find('img[data-id]').each(function() {
					backgrounds.push({
						thumbn: this.getAttribute('src'),
						id: this.getAttribute('data-id'),
						price: this.getAttribute('data-price'),
						upload: this.getAttribute('data-upload')
					});
				});
				$(this).find('input[name="backgrounds-product"]').val(encodeURIComponent(JSON.stringify(backgrounds)));
			});
		};
		
	$('#lumise-background-product').on('click', function(e) {
		
		var func = e.target.getAttribute('data-func');
		switch (func) {
			case 'load': 
				load(e); 
			break;
			case 'delete': 
				$(e.target).parent().remove(); 
				save_return(); 
			break;
		}
		
	});
	
});