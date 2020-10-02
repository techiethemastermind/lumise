function lumise_addon_advancedImages(lumise) {
	
	lumise.add_filter('fbappid', (id) => {
		if (
			lumise_images_addon_cfg && 
			lumise_images_addon_cfg.api && 
			lumise_images_addon_cfg.api.fb &&
			lumise_images_addon_cfg.api.fb !== ''
		) return lumise_images_addon_cfg.api.fb;
		return id;
	});
	
	lumise.design.nav.load.images = function(e) {
		
		lumise.xitems.load('images', {
			click : function(op, el) {
				if (lumise.xitems.resources['images'].url[op.id]) {
					
					op.url = lumise.xitems.resources['images'].url[op.id]
					
					lumise.fn.preset_import([op], el, {});
					
				}
			}
		});
		
		$('#lumise-uploads>header>button[data-nav]').off('click').on('click', function(e) {
			
			var wrp = $(this).closest('#lumise-uploads'),
				nav = this.getAttribute('data-nav'),
				tab = wrp.find('div[data-tab="'+nav+'"]'),
				ss = (lumise_images_addon_cfg.external == '1' ? 
					 'https://services.lumise.com/images/' : 
					 lumise.data.upload_url+'addons/images/external.php');
				src = ss+'?ss=picture';
			
			if (nav == 'xexternal') {
				src = ss+'?ss=social';
				nav = 'external';
			};
			
			if (lumise_images_addon_cfg.external != '1')
				src += '&api='+btoa(encodeURIComponent(JSON.stringify(lumise_images_addon_cfg.api)));
			
			if (nav == 'external') {
				if (tab.find('iframe').length === 0)
					tab.html('<iframe src="'+src+'"></iframe>');
				else if($(this).hasClass('active')) {
					tab.scrollTop(0);
					tab.find('iframe').get(0).contentWindow.postMessage({
						action : 'scrollTop'
					}, "*");
				}
			} else if (nav == 'internal' && this.getAttribute('data-clicked') != 'true') {
				this.setAttribute('data-clicked', 'true');
				$('#lumise-uploads div[data-tab="internal"]').trigger('scroll');
			}
			
			wrp.find('header button.active, div[data-tab].active').removeClass('active');
			
			$(this).addClass('active');
			tab.addClass('active');
			
			e.preventDefault();
		
		});
	};
}