function lumise_addon_mirtilsize(lumise) {

    window.lm = lumise;

    lumise.design.nav.load.mirtilsize = function(e) {
        lumise.xitems.load('mirtilsize', {
            preview: 'image',
            load: function(res) {
				$('#lumise-mirtilsize-list ul li').css({display: ''});
				return res;
            },
            response: function(res) {
                // $('#lumise-mirtilsize-list').empty();
				return res;
            },
            click: function(data) {
				console.log(data);
			}
        });
    }

    lumise.add_action('product', function(data) {
        
        var currency = lumise.data.currency;
        $('#lumise-mirtilsize-list').empty();
        $('#lumise-mirtilsize-list').prepend('<header><name><t>' + data.name + ' &nbsp; </t></name><price>' + parseInt(data.price).toFixed(2) 
            + ' ' + currency + '</price></li></header>');
        
        $('#lumise-mirtilsize-list').append($('<div class="lumise-cart-attributes" id="lumise-cart-attributes"></div>'));

        var size_ele = '';
        var width_ele = '';
        var height_ele = '';
        
        $.each(data.attributes, function(key, item){

            if(item.name == 'W') {
                var values = item.value.split('\n');
                var widths = {};
                values.map(function(value){
                    index = value.split(':')[0];
                    val = parseFloat(value.split(':')[1].trim()).toFixed(2);
                    widths[index] = val;
                });
                width_ele = '<span class="prefix lumise-cart-field-label">W</span><input type="text" name="' + key
                 + '" min="' + widths.min + '" max="' + widths.max + '" class="lumise-cart-param-custom" value="' 
                 + widths.default + '" required="" style="margin-right: 15px;" data-type="width">';
            }
            if(item.name == 'H') {
                var values = item.value.split('\n');
                var heights = {};
                values.map(function(value){
                    index = value.split(':')[0];
                    val = parseFloat(value.split(':')[1].trim()).toFixed(2);
                    heights[index] = val;
                });
                height_ele = '<span class="prefix lumise-cart-field-label">H</span><input type="text" name="' + key
                + '" min="' + heights.min + '" max="' + heights.max + '" class="lumise-cart-param-custom" value="' 
                + heights.default + '" required="" data-type="height">';
            }
            if(item.name == 'Standard sizes') {
                size_vals = item.values.options;
                size_ele = '<div data-type="select" data-id="' + key + '" class="lumise-cart-field field-inline"><div class="lumise_form_group border-bottom">';
                size_ele += '<span class="lumise-cart-field-label">Standard sizes:</span>';
                size_ele += '<div class="lumise_form_content">';
                size_ele += '<select name="' + key + '" class="lumise-cart-param" required="">';
                size_ele += '<option value="noselect">Select Standard Size</option>'
                $.each(item.values.options, function(index, option){
                    if(option.default) {
                        size_ele += '<option data-price="' + option.price + '" value="' + option.value + '" selected="selected">' 
                                + option.title + ' / ' + parseInt(option.price).toFixed(2) + ' ' + currency + '</option>';
                        
                        add_price(parseFloat(option.price));
                    } else {
                        size_ele += '<option data-price="' + option.price + '" value="' + option.value + '">' 
                            + option.title + ' / ' + parseInt(option.price).toFixed(2) + ' ' + currency + '</option>';
                    }
                });
                size_ele += '</select></div></div></div>';
            }
        });

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($(size_ele));
        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise_form_group"><span class="lumise-cart-field-label">Custom Size</span>'
            + '<div class="lumise_form_content inline custom-size">'
            + width_ele + height_ele + '</div></div>'));

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise_form_group border-bottom">'
            + '<span class="inline lumise-cart-field-label">cm.</span><label class="switch"><input type="checkbox" id="change_unit" unit="m" checked="checked">'
            + '<span class="slider round"></span></label><span class="inline lumise-cart-field-label">m.</span></div>'));

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise-cart-attributes" id="lumise-cart-attributes"></div>'));
    });

    $('#lumise-mirtilsize-list').on('change', '.lumise-cart-param', function(e){
        var attr_id = $(this).attr('name');
        var value = $(this).val();
        var price = $('option:selected', this).attr('data-price');

        // Get price
        lumise.cart.data.options[attr_id] = price + '\n' + value;
        // lumise.cart.price.attr = parseFloat(price);

        var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
        var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');

        // this part is hard code

        if(value == '1m2-m') {
            $('#change_unit').prop('checked', true).change();
            width_ele.val('1.00');
            height_ele.val('1.00');
        }
        if(value == '120x160-cm') {
            $('#change_unit').prop('checked', false).change();
            width_ele.val('120.00');
            height_ele.val('160.00');
        }
        if(value == '4x3') {
            $('#change_unit').prop('checked', true).change();
            width_ele.val('4.00');
            height_ele.val('3.00');
        }

        add_price(parseFloat(price));
    });

    // When change custom size;
    $('#lumise-mirtilsize-list').on('keyup', '.lumise_form_content.custom-size input', function(e){

        // $('select.lumise-cart-param').val('noselect').change();

        var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
        var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');
        var unit = $('#change_unit').attr('unit');
        
        var max_width = parseFloat(width_ele.attr('max'));
        var min_width = parseFloat(width_ele.attr('min'));
        var max_height = parseFloat(height_ele.attr('max'));
        var min_height = parseFloat(height_ele.attr('min'));

        if(unit == 'cm') {
            max_width *= 100;
            min_width *= 100;
            max_height *= 100;
            min_height *= 100;
        }

        var width = parseFloat(width_ele.val());
        if(width > max_width || width < min_width || isNaN(width)){
            width_ele.addClass('error');
            width_ele.attr('title', 'Please confirm - Max value: ' + max_width + ', Min Value: ' + min_width);
            return false;
        } else {
            width_ele.removeClass('error');
        }
        var height = parseFloat(height_ele.val());
        if(height > max_height || height < min_height || isNaN(height)){
            height_ele.addClass('error');
            height_ele.attr('title', 'Please confirm - Max value: ' + max_height + ', Min Value: ' + min_height);
        } else {
            height_ele.removeClass('error');
        }

        // calculate price:
        var price = 0;
        var s = width * height;
        if(unit == 'm') {
            price = s * 20;
        } else if (unit == 'cm') {
            price = (s / 10000) * 20;
        }

        add_price(price);
    });

    // When change unit
    $('#lumise-mirtilsize-list').on('change', '#change_unit', function(){

        var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
        var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');

        // changed from 'm' to 'cm'
        if(!$(this).prop('checked') && $(this).attr('unit') == 'm') {
            new_w_val = (parseFloat(width_ele.val()) * 100).toFixed(2);
            width_ele.val(new_w_val);
            new_h_val = (parseFloat(height_ele.val()) * 100).toFixed(2);
            height_ele.val(new_h_val);

            $(this).attr('unit', 'cm');
        }

        // changed from 'cm' to 'm'
        if($(this).prop('checked') && $(this).attr('unit') == 'cm') {
            new_w_val = (parseFloat(width_ele.val()) / 100).toFixed(2);
            width_ele.val(new_w_val);
            new_h_val = (parseFloat(height_ele.val()) / 100).toFixed(2);
            height_ele.val(new_h_val);

            $(this).attr('unit', 'm');
        }
    });

    // Add price to cart based on attr
    function add_price(attr_price) {
        lumise.cart.price.attr = attr_price;
        if(lumise.cart.price.color == 0) return;
        var origin_price = lumise.cart.price.base + lumise.cart.price.attr + lumise.cart.price.color;
        var total_price = lumise.cart.price.base * lumise.cart.price.attr * lumise.cart.price.color;
		var extra_price = total_price - origin_price;
        lumise.cart.price.extra.values = [{ price: extra_price }];

        var vat_price = total_price * 0.2;
        lumise.cart.price.vat = vat_price;
        var vat_ele = $('#vat_price');
        if(vat_ele.length == 0) {
            vat_ele = '<span id="vat_price">' + vat_price.toFixed(2) + '</span><span> (VAT)</span>';
            $(vat_ele).appendTo($('#lumise-navigations ul[data-block="right"]>li:first-child'));
        } else {
            vat_ele.text(vat_price.toFixed(2));
        }
        lumise.cart.calc();
        lumise.render.cart_change();
        lumise.actions.do('cart-changed', true);
        // lumise.cart.display();
        // console.log(lumise.cart.price);
    }
    
    function setInit() {
        if(window.type != undefined) {
            lumise.cart.printing.current = window.type;
        }

        if(window.width != undefined && window.height != undefined) {
            $('#change_unit').prop('checked', false);
            $('#change_unit').trigger('change');
            $('.lumise_form_content.custom-size input[data-type="width"]').val(parseFloat(window.width).toFixed(2));
            $('.lumise_form_content.custom-size input[data-type="height"]').val(parseFloat(window.height).toFixed(2));
            var s = parseFloat(width) * parseFloat(height);
            var price = (s / 10000) * 20;
            add_price(price);
        }
    }

    function tab_active() {
        setInit();
        if(window.tab != undefined)
            $('#lumise-left .lumise-left-nav li[data-tab="' + window.tab + '"]').trigger('click');
        cat_active();
        remove_attrs();
    }

    function cat_active() {
        if(window.cat != undefined)
            $('#lumise-' + window.tab + ' button[data-nav="' + window.cat + '"]').trigger('click');
    }

    function remove_attrs() {
        $('#lumise-cart-attributes').find('div[data-type="product_color"]').remove();
        $('#lumise-cart-attributes').find('div[data-type="select"]').remove();
        $('#lumise-cart-attributes').find('div[data-type="input"]').remove();
    }

    $(document).ready(function() {

        setTimeout(tab_active, 5000);
        $('<i class="lumisex-arrow-move"></i>').appendTo($('#lumise-zoom-wrp'));
    
        // Canvas Move
        $('#lumise-zoom-wrp').on('click', 'i.lumisex-arrow-move', function(e) {
            var stage = lumise.stage();
            if(this.getAttribute('data-clicked') != 'true') {
                this.setAttribute('data-clicked', 'true');
                stage.canvas.defaultCursor = 'move';
                var c = stage.canvas, dx, dy, x_d, y_d, m_s = false;
    
                $(document).on( "mousedown", "#lumise-stage-front", function( event ) {
                    stage.canvas.set('selection', false);
                    m_s = true;
                    x_d = event.pageX;
                    y_d = event.pageY;
                });
                $(document).on( "mousemove", "#lumise-stage-front", function( event ) {
                    dx = event.pageX - x_d;
                    dy = event.pageY - y_d;
                    x_d = event.pageX;
                    y_d = event.pageY;
                    if(m_s && $('#lumise-zoom-wrp i.lumisex-arrow-move').attr('data-clicked') == 'true') {
                        stage.canvas.viewportTransform[4] += dx;
                        stage.canvas.viewportTransform[5] += dy;
                        stage.canvas.renderAll();
                    }
                });
                $(document).on( "mouseup", "#lumise-stage-front", function( event ) {
                    m_s = false;
                    stage.canvas.set('selection', true);
                    stage.canvas.renderAll();
                });
    
            } else {
                this.setAttribute('data-clicked', 'false');
                stage.canvas.defaultCursor = 'default';
            }
            console.log(this.getAttribute('data-clicked'));
        });
    });
}