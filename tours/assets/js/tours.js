function lumise_addon_tours(lumise) {
	
	var lumise_tours = {
		
		tours: {
			version: '0',
			publish: false,
			is_load: false,
			current: 0,
			data: [{
				arr: 'lt',
				content: 'First step',
				pin: 'tl',
				pos: 'left: 100px; top: 120px;'
			},{
				arr: 'tr',
				content: 'Second step',
				pin: 'tl',
				pos: 'right: 100px; top: 50px;'
			}],
			start: 'Welcome content'
		},
		
		render: function(i) {
			
			this.tours.current = i;
			this.tours.is_load = true;
			
			if (i == 'start')
				return this.render_start();
				
			var o = this.tours.data[i];
			
			var h = $('<div id="lumise-tour" class="lumise-tour-wrp" style="'+o.pos+'" data-arr="'+o.arr+'">\
				<div class="lumise-tour-content">'+o.content+'</div>\
				<foot style="background: '+lumise.data.theme_color+'">\
					<i class="lumise-icon-flag"></i>\
					<a href="#dismiss">Dismiss</a>\
					'+(this.tours.data[parseInt(i)+1] !== undefined ? '<a href="#next" data-next="'+(parseInt(i)+1)+'">Next</a>' : '')+'\
				</foot>\
			</div>');
			
			h.find('a[href="#dismiss"]').on('click', function(e) {
				$('.lumise-tour-wrp').remove();
				e.preventDefault();
			});
			
			h.find('a[href="#next"]').on('click', function(e) {
				e.preventDefault();
				var id = this.getAttribute('data-next');
				if ($('#lumise-tours-nav').length > 0)
					$('#lumise-tours-nav li[data-tour="'+id+'"]').click();
				else lumise_tours.render(id);
			});
			
			$('.lumise-tour-wrp').remove();
			$('body').append(h);
			
			if (o.action !== undefined && o.action !== '') {
				var f = Function('$', 'lumise', o.action);
				f($, lumise);
			};
			
			if ($('#lumise-tours-nav').length > 0) {
				h.draggable({
					'handle': 'foot',
					start: function() {
						$(this).css({ 
			                bottom: "auto", 
			                top: "auto", 
			                right: "auto" , 
			                left: "auto" 
			            });	
					},
					stop: function(event, ui) {
						lumise_tours.set_pos();
		            }
				});
				h.find('foot').css({cursor: 'move'});
			}
			
		},
		
		render_start: function() {
			
			var h = $('<div id="lumise-tour" class="lumise-tour-wrp lumise-tour-wrp-start">\
				<div class="lumise-tour-content">'+this.tours.start+'</div>\
				<foot>\
					<a href="#start" data-next="0">Take short tour</a>\
					<a href="#nothanks">No thanks!</a>\
					<p>\
						<input type="checkbox" id="lumise-tour-showagain" /> \
						<label for="lumise-tour-showagain">Do not show it again.</label>\
					</p>\
				</foot>\
				<i class="lumise-icon-close close"></i>\
			</div>');	
			
			$('.lumise-tour-wrp').remove();
			$('body').append(h);
			
			h.find('i.close,a[href="#nothanks"]').on('click', function(e) {
				if ($('#lumise-tour-showagain').prop('checked') === true)
					localStorage.setItem('LUMISE-TOURS-VER', lumise_tours.tours.version);
				h.remove();
				e.preventDefault();
			});
			
			h.find('a[href="#start"]').on('click', function(e) {
				h.remove();
				e.preventDefault();
				var id = this.getAttribute('data-next');
				if ($('#lumise-tours-nav').length > 0)
					$('#lumise-tours-nav li[data-tour="'+id+'"]').click();
				else lumise_tours.render(id);
			});
		},
		
		setup: function(actv) {
			
			if (actv === undefined)
				actv = 'start';
				
			if (typeof lumise_tours.tours.data != 'object')
				lumise_tours.tours.data = [];
				
			var nav = '<li data-tour="start">Start</li>';
			
			for (var i=0; i< lumise_tours.tours.data.length; i++) {
				nav += '<li data-tour="'+i+'">'+(i+1)+' <i data-func="delete" data-noclose="true" class="lumise-icon-close"></i></li>';
			}
			
			nav += '<li data-func="new"><i data-func="new" class="lumisex-android-add"></i></li>';
			
			$('#lumise-tours-nav li[data-row="current"]>ul').html(nav);
			
			$('#lumise-tours-nav li[data-row="current"]>ul li[data-tour="'+actv+'"]').click();
			
		},
		
		init: function() {
			
			lumise.trigger({
				el: $('#lumise-tours-nav'),
				events: {
					'li[data-row="current"]>ul': 'nav',
					'.inps:change': 'update',
					'button[data-func="save"]': 'save'
				},
				nav: function(e) {
					
					if (e.target.getAttribute('data-tour')) {
						
						var cur = e.target.getAttribute('data-tour'),
							tour = cur != 'start' ? lumise_tours.tours.data[cur] : {
								content: lumise_tours.tours.start
							};
	
						if (tour === undefined)
							return;
					
							e.data.el.find('li[data-row="current"]>ul li[data-active="true"]').removeAttr('data-active');
							e.target.setAttribute("data-active", "true");
							e.data.el.find('input[name="publish"]').prop({checked: lumise_tours.tours.publish});
							e.data.el.find('input[name="version"]').val(
								lumise_tours.tours.version !== undefined ? lumise_tours.tours.version : ''
							);
							e.data.el.find('textarea[name="content"]').val(tour.content !== undefined ? tour.content : '');
							
						if (cur !== 'start') {
							e.data.el.find('[data-row="current"] p:not([data-view])').show();			
							e.data.el.find('input[name="action"]').val(tour.action !== undefined ? tour.action : '');
							e.data.el.find('select[name="arr"]').val(tour.arr);
							e.data.el.find('select[name="pin"]').val(tour.pin);
						} else {
							e.data.el.find('[data-row="current"] p:not([data-view])').hide();
						};
						lumise_tours.render(cur);
						
					} else if (e.target.getAttribute('data-func') == 'delete') {
						if (confirm(lumise.i('sure'))) {
							delete lumise_tours.tours.data[lumise_tours.tours.current];
							lumise_tours.tours.data = lumise_tours.tours.data.filter(function(val){return val});
							setTimeout(lumise_tours.setup, 100, lumise_tours.tours.current > 0 ? lumise_tours.tours.current-1 : 0);
						}
					} else if (e.target.getAttribute('data-func') == 'new') {
						
						lumise_tours.tours.data.push({
							arr: 'tr',
							content: 'New step',
							pin: 'tl',
							pos: 'left: '+(100+Math.round(Math.random()*1050))+'px; top: '+(50+Math.round(Math.random()*180))+'px;'
						});
						
						setTimeout(function() {
							lumise_tours.setup(lumise_tours.tours.data.length-1);
						}, 100);
						
					}
					
					e.preventDefault();
					
				},
				save: function(e){
					
					$('.lumise-tour-wrp').remove();
					lumise.f(lumise.i('wait'));
						
					lumise.post({
						action: 'addon',
						component: 'tours',
						task: 'save',
						data: encodeURIComponent(JSON.stringify(lumise_tours.tours))
					}, function(res) {
						
						if (res != '1')
							alert("Error, could not save data because you have signed out.\n"+res);
						
						lumise.f(false);
						
					});
					
					e.preventDefault();
						
				},
				update: function() {
					
					if (this.name == 'publish')
						lumise_tours.tours.publish = this.checked;
					else if (this.name == 'version')
						lumise_tours.tours.version = this.value;
					else {
						
						if (lumise_tours.tours.current == 'start')
							lumise_tours.tours.start = this.value;
						else lumise_tours.tours.data[lumise_tours.tours.current][this.name] = this.value;
						
						lumise_tours.render(lumise_tours.tours.current);
						lumise_tours.set_pos();
						
					}
					
				}
			});
			
			this.setup(false);
			
		},
		
		set_pos: function(i) {
			
			if (i === undefined)
				i = lumise_tours.tours.current;
				
			var tou = lumise_tours.tours.data[i],
				el = $('#lumise-tour'),
				e_l = el.get(0),
				ww = $(window).width(),
				wh = $(window).height();
			
			if (tou === undefined || el.length === 0)
				return;
				
			if (tou.pin == 'tr') {
				el.css({
					right: (ww-(e_l.offsetWidth+e_l.offsetLeft))+'px', 
					left: "auto" 
				});
			} else if (tou.pin == 'bl') {
				el.css({
					bottom: (wh-(e_l.offsetHeight+e_l.offsetTop))+'px', 
	                top: "auto"
				});
			} else if (tou.pin == 'br') {
				el.css({ 
	                bottom: (wh-(e_l.offsetHeight+e_l.offsetTop))+'px', 
	                top: "auto", 
	                right: (ww-(e_l.offsetWidth+e_l.offsetLeft))+'px', 
	                left: "auto" 
	            });
			}
            
            tou.pos = e_l.getAttribute('style');
            
		}
		
	};
	
	if (window.lumise_tours_data !== undefined) {
		lumise_tours.tours = JSON.parse(decodeURIComponent(window.lumise_tours_data));
		lumise_tours.tours.is_load = false;
	};
	
	if ($('#lumise-tours-nav').length > 0)	
		lumise_tours.init();
	
	if (
		lumise_tours.tours.publish === true &&
		localStorage.getItem('LUMISE-TOURS-VER') != lumise_tours.tours.version
	) {
		lumise.actions.add('product', function() {
			if (lumise_tours.tours.is_load !== true)
				lumise_tours.render('start');
		});
	}
	
};