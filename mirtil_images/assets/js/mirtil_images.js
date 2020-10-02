function lumise_addon_mirtil_images(lumise) {
    window.lm = lumise;

    lumise.design.nav.load.mirtil_images = function (e) {

        lumise.xitems.load('mirtil_images', {

			preview: 'image', // image|template

			response: function (res) {

                var html = '';
				
				if (res.items && res.items.length > 0) {

					res.items.map(function(item) {
						
						var oid = 'Art-'+item.id;
						
						lumise.xitems.ops[oid] = [{
							type : 'image',
							name : item.name,
							id : item.id.toString(),
							tags : (item.tags?item.tags:''),
							cates : (item.cates?item.cates:''),
							resource : 'cliparts',
							resource_id : item.id,
							price : parseFloat(item.price),
							url: lumise.data.upload_url+item.upload
						}];
						
						html += '<li style="background-image: url(\''+item.thumbnail_url+
										'\')" data-ops="'+oid+'" class="lumise-clipart">'+
									'<i data-tag="'+item.id+'">'+
									(item.price>0?lumise.fn.price(item.price) : lumise.i(100))+
									'</i><i data-info="'+item.id+'"></i>'+
								'</li>';
					});
					
					var total = res.total ? res.total : 0;
					
					lumise.ops.cliparts_q = res.q;
					lumise.ops.cliparts_category = res.category;
					lumise.ops.cliparts_index = parseInt(res.index)+res.items.length;
					if (lumise.ops.cliparts_index<total)
						lumise.ops.cliparts_loading = false;

				}else html += '<span class="noitems">'+lumise.i(42)+'</span>';

				lumise.get.el('mirtil_images-list').find('i.lumise-spinner').remove();
				lumise.get.el('mirtil_images-list').find('ul.lumise-list-items').append(html);
				
				lumise.render.categories('cliparts', res);
				lumise.cliparts.add_events();
            },
            
        });
        

        // When click Nav
		$('#lumise-mirtil_images>header>button[data-nav]').off('click').on('click', function (e) {

            var wrp = $(this).closest('#lumise-mirtil_images'),
				nav = this.getAttribute('data-nav'),
                tab = wrp.find('div[data-tab="' + nav + '"]'),
                stage = lumise.stage();

            if(nav == 'mirtil_upload' && this.getAttribute('data-clicked') != 'true') {
                $('#lumise-upload-list').trigger('scroll');

            } else if (nav == 'mirtil_shapes' && this.getAttribute('data-clicked') != 'true') {

                if (lumise.get.el('mirtil_shapes').find('ul.lumise-list-items').length === 0) {
                    lumise.get.el('mirtil_shapes').html(
                        $('<p class="gray">'+lumise.i(158)+'</p>\
                        <div class="lumise-tab-body">\
                            <ul class="lumise-list-items"></ul>\
                        </div>'));

                    init_shapes();
                }
            } else if (nav == 'mirtil_drawings' && this.getAttribute('data-clicked') != 'true') {
                
                stage.limit_zone.visible = true;
                var fill_default = lumise.get.color('invert');

                if (lumise.data.colors !== undefined && lumise.data.colors !== '') {
                    fill_default = lumise.data.colors.split(',')[0];
                    if (fill_default.indexOf(':') > -1)
                        fill_default = fill_default.split(':')[1];
                    fill_default = fill_default.split('@')[0];
                };
                stage.canvas.freeDrawingBrush.color = fill_default;
                lumise.get.el('top-tools').attr({'data-view': 'drawing'});

                colorPresets();
            }

            if (nav == 'mirtil_drawings') {
                stage.canvas.isDrawingMode = true;
            } else {
                stage.canvas.isDrawingMode = false;
            }

            wrp.find('header button.active, div[data-tab].active').removeClass('active');
			$(this).addClass('active');
            tab.addClass('active');
            
            this.setAttribute('data-clicked', 'true');
        });

        // add events
        $(document).on('scroll', '#lumise-mirtil_shapes .lumise-tab-body', function(){
            shapes_more(this);
        });

        $(document).on('scroll', '#lumise-upload-list', function(){
            images_more(this);
        });
    }

    var images_more = function(ele) {

        if (lumise.ops.images_loading === true)
            return;

        if (ele.scrollTop + ele.offsetHeight >= ele.scrollHeight - 100) {
            
            lumise.ops.images_loading = true;
            lumise.indexed.list(function(data){
                decodeURI(data);
                lumise.cliparts.import(data.id, {
                    url: 'dumb-'+data.id,
                    thumbn: data.thumbn,
                    name: data.name,
                    save: false
                });
                lumise.ops.uploads_cursor = data.id;
                delete data;
            }, 'uploads', function(st){
                lumise.ops.images_loading = false;
                if (st == 'done') {
                    $('#lumise-uploads').off('scroll');
                }
            });
        }
    };

    var init_shapes = function() {

        lumise.get.el('mirtil_shapes').find('ul.lumise-list-items').append('<i class="lumise-spinner white x3 mt3 mb1"></i>');

        lumise.post({
			action: 'shapes'
		}, function (res) {
            if(res.error) {
                return lumise.fn.notice(res.error, 'error');
            }

            if (res.items && res.items.length > 0) {
                
                lumise.ops.shapes_index = parseInt(res.index)+res.items.length;
                lumise.ops.shapes_loading = false;
                display_shapes(res.items);

                var shapewrp = $('#lumise-mirtil_shapes .lumise-tab-body').get(0);
					
                if (shapewrp.scrollHeight == shapewrp.clientHeight) {
                    $(shapewrp).trigger('scroll');
                }
                
            }else $('#lumise-mirtil_shapes ul').append('<span class="noitems">'+lumise.i(42)+'</span>');
        });
    };

    var display_shapes = function(data) {

        $('#lumise-mirtil_shapes i.lumise-spinner').remove();
        
        var ul = lumise.get.el('mirtil_shapes').find('ul.lumise-list-items');
        
        data.map(function(sh){
            ul.append(
                '<li class="lumise-clipart" \
                data-ops="[{\
                    &quot;type&quot;: &quot;shape&quot;,\
                    &quot;resource&quot;: &quot;shape&quot;,\
                    &quot;width&quot;: 60,\
                        &quot;height&quot;: 60 ,\
                        &quot;name&quot;: &quot;'+sh.name+'&quot;\
                }]">'+sh.content+'</li>'
            );
        });

        lumise.cliparts.add_events();
    }

    var load_shapes = function() {
        
        lumise.post({
			action: 'shapes',
			index: lumise.ops.shapes_index
		}, function (res) {
            if (res.items && res.items.length > 0) {
                display_shapes(res.items);
            } else $('#lumise-mirtil_shapes ul').append('<span class="noitems">'+lumise.i(42)+'</span>');
        });
    }

    var shapes_more = function(ele) {

        if (lumise.ops.shapes_loading === true)
            return;

        if (ele.scrollTop + ele.offsetHeight >= ele.scrollHeight - 100) {
            load_shapes();
            lumise.get.el('mirtil_shapes').find('ul.lumise-list-items').append('<i class="lumise-spinner white x3 mt3 mb1"></i>');
            lumise.ops.shapes_loading = true;
        }
    }

    var colorPresets = function() {
				
        var colors = lumise.data.colors,
            el = $('.lumise-color-presets'),
            lb;
        
        if (colors !== undefined && colors.indexOf(':') > -1)
            colors = colors.split(':')[1].replace(/\|/g, ',');
        
        if (lumise.data.enable_colors != '0' && localStorage.getItem('lumise_color_presets')) {
            colors = localStorage.getItem('lumise_color_presets').replace(/\|/g, ',');
        };

        el.html('');

        colors.split(',').map(function(c){
            
            c = c.split('@'); lb = c[0];
                
            if (c[1] !== undefined && c[1] !== '')
                lb = decodeURIComponent(c[1]).replace(/\"/g, '');
            else if (lumise.ops.color_maps[c[0]] !== undefined)
                lb = lumise.ops.color_maps[c[0]];
                
            el.append('<li data-color="'+c[0]+'" title="'+lb+'" style="background:'+c[0]+'"></li>');
            
        });
        
        el.find('li').on('click', function(){
            var el = lumise.get.el($(this).closest('ul.lumise-color-presets').data('target'));
            el.val(this.getAttribute('data-color'));
            if (el.get(0).color && typeof el.get(0).color.fromString == 'function')
                el.get(0).color.fromString(this.getAttribute('data-color'));

        });
    }

    // Image or SVG file Drag and Drop Canvas driectly
    $(document).on('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        lumise.fn.process_files(e.originalEvent.dataTransfer.files, function(res) {
            console.log(res);

            lumise.fn.preset_import([{type: 'image', url: res.url, user_upload: true}]);
        });
        
    });

}