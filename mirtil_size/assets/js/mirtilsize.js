function lumise_addon_mirtilsize(lumise) {

    lumise.add_action('product', function (data) {

        // Store product data
        window.product_data = data;
        window.product = {};
        var shape = ['Square', 'Custom'];

        var currency = lumise.data.currency;
        $('#lumise-mirtilsize-list').empty();
        $('#lumise-mirtilsize-list').prepend('<header><name><t>' + data.name + ' &nbsp; </t></name><price>' + parseInt(data.price).toFixed(2) +
            ' ' + currency + '</price></li></header>');

        $('#lumise-mirtilsize-list').append($('<div class="lumise-cart-attributes" id="lumise-cart-attributes"></div>'));

        var size_ele = '';
        var width_ele = '';
        var height_ele = '';

        $.each(data.attributes, function (key, item) {

            if (item.name == 'W') {
                var values = item.value.split('\n');
                var widths = {};
                values.map(function (value) {
                    index = value.split(':')[0];
                    val = parseFloat(value.split(':')[1].trim()).toFixed(2);
                    widths[index] = val;
                });
                width_ele = '<span class="prefix lumise-cart-field-label">W</span><input type="text" name="' + key +
                    '" min="' + widths.min + '" max="' + widths.max + '" class="lumise-cart-param-custom" value="' +
                    widths.default+'" required="" style="margin-right: 15px;" data-type="width">';
            }
            if (item.name == 'H') {
                var values = item.value.split('\n');
                var heights = {};
                values.map(function (value) {
                    index = value.split(':')[0];
                    val = parseFloat(value.split(':')[1].trim()).toFixed(2);
                    heights[index] = val;
                });
                height_ele = '<span class="prefix lumise-cart-field-label">H</span><input type="text" name="' + key +
                    '" min="' + heights.min + '" max="' + heights.max + '" class="lumise-cart-param-custom" value="' +
                    heights.default+'" required="" data-type="height">';
            }
            if (item.name == 'Standard sizes') {
                size_vals = item.values.options;
                size_ele = '<div data-type="select" data-id="' + key + '" class="lumise-cart-field field-inline"><div class="lumise_form_group border-bottom">';
                size_ele += '<span class="lumise-cart-field-label">Standard sizes:</span>';
                size_ele += '<div class="lumise_form_content">';
                size_ele += '<select name="' + key + '" class="lumise-cart-param" required="">';
                $.each(item.values.options, function (index, option) {
                    if (option.value == 'custom') {
                        size_ele += '<option data-price="' + option.price + '" value="' + option.value + '">Custom Size</option>';
                    } else {
                        size_ele += '<option data-price="' + option.price + '" value="' + option.value + '">' +
                            option.title + ' / ' + parseInt(option.price).toFixed(2) + ' ' + currency + '</option>';
                    }

                    if (option.default) window.base_attr = parseFloat(option.price);
                });
                // size_ele += '<option value="custom" data-price="20">Custom Size</option>';
                size_ele += '</select></div></div></div>';
            }
        });

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($(size_ele));
        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise_form_group"><span class="lumise-cart-field-label">Custom Size</span>' +
            '<div class="lumise_form_content inline custom-size">' +
            width_ele + height_ele + '</div></div>'));

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise_form_group border-bottom">' +
            '<span class="inline lumise-cart-field-label">cm.</span><label class="switch"><input type="checkbox" id="change_unit" unit="m" checked="checked">' +
            '<span class="slider round"></span></label><span class="inline lumise-cart-field-label">m.</span></div>'));

        $('#lumise-mirtilsize-list #lumise-cart-attributes').append($('<div class="lumise-cart-attributes" id="lumise-cart-attributes"></div>'));

        //
        $(document).ready(function () {

            // Size change
            $('#lumise-mirtilsize-list').on('change', '.lumise-cart-param', function (e) {
                var attr_id = $(this).attr('name');
                var value = $(this).val();
                if (value == 'custom') return;

                var price = $('option:selected', this).attr('data-price');

                lumise.cart.price.attr = parseFloat(price);

                var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
                var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');

                // this part is hard code

                if (value == '1m2-m') {
                    $('#change_unit').prop('checked', true).change();
                    width_ele.val('1.00');
                    height_ele.val('1.00');
                }
                if (value == '120x160-cm') {
                    $('#change_unit').prop('checked', false).change();
                    width_ele.val('120.00');
                    height_ele.val('160.00');
                }
                if (value == '4x3-m') {
                    $('#change_unit').prop('checked', true).change();
                    width_ele.val('4.00');
                    height_ele.val('3.00');
                }

                // Change Canvas Size;
                change_size(width_ele.val(), height_ele.val());

                // Change price of Cart;
                change_cart();
            });

            // When change custom size;
            $('#lumise-mirtilsize-list').on('keyup', '.lumise_form_content.custom-size input', function (e) {

                $('select.lumise-cart-param').val('custom').change();

                var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
                var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');
                var unit = $('#change_unit').attr('unit');

                var max_width = parseFloat(width_ele.attr('max'));
                var min_width = parseFloat(width_ele.attr('min'));
                var max_height = parseFloat(height_ele.attr('max'));
                var min_height = parseFloat(height_ele.attr('min'));

                if (unit == 'cm') {
                    max_width *= 100;
                    min_width *= 100;
                    max_height *= 100;
                    min_height *= 100;
                }

                var width = parseFloat(width_ele.val());
                if (width > max_width || width < min_width || isNaN(width)) {
                    width_ele.addClass('error');
                    width_ele.attr('title', 'Please confirm - Max value: ' + max_width + ', Min Value: ' + min_width);
                    return false;
                } else {
                    width_ele.removeClass('error');
                }
                var height = parseFloat(height_ele.val());
                if (height > max_height || height < min_height || isNaN(height)) {
                    height_ele.addClass('error');
                    height_ele.attr('title', 'Please confirm - Max value: ' + max_height + ', Min Value: ' + min_height);
                    return false;
                } else {
                    height_ele.removeClass('error');
                }

                // calculate price:
                var price = 0;
                var s = width * height;
                if (unit == 'm') {
                    price = s * window.base_attr;
                } else if (unit == 'cm') {
                    price = (s / 10000) * window.base_attr;
                }

                lumise.cart.price.attr = price;
                var size_list = $('#lumise-mirtilsize-list').find('.lumise-cart-param');
                var attr_id = size_list.attr('name');
                $.each(lumise.ops.product_data.attributes[attr_id].values.options, function (index, option) {
                    if (option.value == 'custom') {
                        option.price = price;
                    }
                });
                $('option:selected', size_list).attr('data-price', price);
                change_cart();
                change_size(width, height);
            });

            // When change unit
            $('#lumise-mirtilsize-list').on('change', '#change_unit', function () {

                var width_ele = $('.lumise_form_content.custom-size input[data-type="width"]');
                var height_ele = $('.lumise_form_content.custom-size input[data-type="height"]');

                // changed from 'm' to 'cm'
                if (!$(this).prop('checked') && $(this).attr('unit') == 'm') {
                    new_w_val = (parseFloat(width_ele.val()) * 100).toFixed(2);
                    width_ele.val(new_w_val);
                    new_h_val = (parseFloat(height_ele.val()) * 100).toFixed(2);
                    height_ele.val(new_h_val);

                    $(this).attr('unit', 'cm');
                }

                // changed from 'cm' to 'm'
                if ($(this).prop('checked') && $(this).attr('unit') == 'cm') {
                    new_w_val = (parseFloat(width_ele.val()) / 100).toFixed(2);
                    width_ele.val(new_w_val);
                    new_h_val = (parseFloat(height_ele.val()) / 100).toFixed(2);
                    height_ele.val(new_h_val);

                    $(this).attr('unit', 'm');
                }
            });

            $('<i class="lumisex-arrow-move"></i>').appendTo($('#lumise-zoom-wrp'));

            // Canvas Move
            $('#lumise-zoom-wrp').on('click', 'i.lumisex-arrow-move', function (e) {
                var stage = lumise.stage();
                if (this.getAttribute('data-clicked') != 'true') {
                    this.setAttribute('data-clicked', 'true');
                    stage.canvas.defaultCursor = 'move';
                    var c = stage.canvas,
                        dx, dy, x_d, y_d, m_s = false;

                    $(document).on("mousedown", "#lumise-stage-front", function (event) {
                        stage.canvas.set('selection', false);
                        m_s = true;
                        x_d = event.pageX;
                        y_d = event.pageY;
                    });
                    $(document).on("mousemove", "#lumise-stage-front", function (event) {
                        dx = event.pageX - x_d;
                        dy = event.pageY - y_d;
                        x_d = event.pageX;
                        y_d = event.pageY;
                        if (m_s && $('#lumise-zoom-wrp i.lumisex-arrow-move').attr('data-clicked') == 'true') {
                            stage.canvas.viewportTransform[4] += dx;
                            stage.canvas.viewportTransform[5] += dy;
                            stage.canvas.renderAll();
                        }
                    });
                    $(document).on("mouseup", "#lumise-stage-front", function (event) {
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

            var leftNav = $('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav');
            var tabBody = $('div#LumiseDesign div#lumise-left .lumise-tab-body-wrp');

            // LeftNav
            $('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav>li').on('mouseover', function (e) {
                tabBody.removeClass('show');
                leftNav.find('li[data-tab]').removeClass('parent');
                $('div#LumiseDesign div#lumise-left #lumise-' + $(this).attr('data-tab')).addClass('show');
                $(this).trigger('click');
            });

            leftNav.on('mouseover', 'li[data-tab="mirtil_design"]', function (e) {
                tabBody.removeClass('show');
                $(this).addClass('parent');
            });

            leftNav.on('mouseover', 'li[data-tab="mirtil_product"]', function (e) {
                tabBody.removeClass('show');
                $(this).addClass('parent');
            });

            leftNav.on('mouseover', 'li[data-tab="mirtil_custom_upload"]', function (e) {
                show_images_tab('mirtil_upload');
            });

            $('div#lumise-left').on('mouseleave', function (e) {
                tabBody.removeClass('show');
                leftNav.find('li[data-tab]').removeClass('parent');
            });

            leftNav.on('click', 'li[data-sub-tab]', function (e) {
                var sub_tab_name = $(this).attr('data-sub-tab');
                if (sub_tab_name == 'mirtil_shapes' || sub_tab_name == 'mirtil_drawings') {
                    show_images_tab(sub_tab_name);
                } else if (sub_tab_name == 'mirtil_images') {
                    show_images_tab('mirtil_cliparts');
                } else {
                    $('div#LumiseDesign div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav li[data-tab=' + sub_tab_name + ']').trigger('click');
                    $('div#LumiseDesign div#lumise-left #lumise-' + sub_tab_name).addClass('show');
                    leftNav.find('li[data-tab]').removeClass('parent');
                }
            });

            function show_images_tab(tab_name) {
                $('div#LumiseDesign div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav li[data-tab="mirtil_images"').trigger('click');
                $('div#LumiseDesign div#lumise-left #lumise-mirtil_images').addClass('show');
                leftNav.find('li[data-tab]').removeClass('parent');
                $('div#LumiseDesign div#lumise-left #lumise-mirtil_images button[data-nav="' + tab_name + '"]').trigger('click');
            }

            leftNav.on('click', '#mirtil-change-product', function () {
                // lumise.render.products_list('Choose product');

                $('.lumise-lightbox').show();
            });

            $('body').on('click', '#lumise-change-products-wrp li', function(e) {
                var product_base_id = $(this).attr('data-id');
                var product_id = $(this).attr('data-cms');
                var params = getAllUrlParams();
                params.product_base = product_base_id;
                params.product_cms = product_id;

                var new_url = window.location.origin + window.location.pathname + '?';
                for (var key in params) {
                    new_url += key + '=' + params[key] + '&';
                }

                window.location.href = new_url;
            });

            // Add Custom Product LeftNav Tab
            var product_nav_obj = $('<li data-tab="mirtil_product" class="active"><i class="lumisex-cube"></i>Product</li>');
            product_nav_obj.insertAfter('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav li[data-tab="design"]');

            // console.log(window.product_data);

            var sub_tab_product = $(`
                <ul data-view="sub">
                    <header>
                        <h3>Products</h3>
                        <i class="lumisex-android-close close" title="Close"></i>
                    </header>
                    <li data-view="link" data-active="true">
                        <h3>` + window.product_data.name + `</h3>
                        <p class="price">` + parseFloat(window.product_data.price).toFixed(2) + ' ' + currency + `</p>
                        <button class="lumise-btn-primary" id="mirtil-change-product">
                            Change product
                            <i class="lumisex-arrow-swap"></i>
                        </button>
                    </li>
                </ul>`);

            product_nav_obj.append(sub_tab_product);

            // Add Custom design LeftNav tab
            var design_nav_obj = $('<li data-tab="mirtil_design" class=""><i class="nxi nxi-designs"></i>Design</li>');
            design_nav_obj.insertAfter('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav li[data-tab="mirtilsize"]');

            var sub_tab_design = $(`
                <ul data-view="sub">
                    <li>
                        <ul>
                            <li data-sub-tab="templates">
                                <i class="lumise-icon-star"></i>Templates
                            </li>
                            <li data-sub-tab="backgrounds" style="margin-left: 15px !important;">
                                <i class="lumise-icon-picture"></i>Background
                            </li>
                            <li data-sub-tab="mirtil_images" style="margin-top: 15px !important;">
                                <i class="nxi nxi-gallery"></i>Images
                            </li>
                            <li data-sub-tab="mirtil_shapes" style="margin: 15px 0 0 15px !important;">
                                <i class="nxi nxi-shapes"></i>Shapes
                            </li>
                            <li data-sub-tab="mirtil_drawings" style="margin-top: 15px !important;">
                                <i class="lumise-icon-note"></i>Drawings
                            </li>
                        </ul>
                    </li>
                </ul>`);

            design_nav_obj.append(sub_tab_design);
            $('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav > li').each(function (idx, item) {
                var tab_name = $(this).attr('data-tab');
                if (tab_name == 'templates' || tab_name == 'backgrounds' || tab_name == 'mirtil_images') {
                    $(this).addClass('hide');
                }
            });

            // Add Custom Upload Nav
            var upload_nav_obj = $('<li data-tab="mirtil_custom_upload" class=""><i class="nxi nxi-upload"></i>Upload</li>');
            upload_nav_obj.insertAfter('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav li[data-tab="mirtil_design"]');

            // Add product detail to order option modal
            var option_wrp = $('#lumise-cart-wrp .lumise-cart-options');
            var premium_name = $('#lumise-colors-list ul').find('li[data-color="' + window.bg_color + '"]').text();
            var product_price = $('#lumise-navigations span.lumise-price.lumise-product-price').text();

            var product_detail_html = $(`
                <div class="lumise-product-detail" id="lumise_product_detail">
                    <p class="lumise-cart-field-label">Product Details</p>
                    <div class="content-wrap">
                        <div class="content-line type">
                            <span class="left">Type:</span>
                            <span class="right">` + window.product_data.name + `</span>
                        </div>
                        <div class="content-line size">
                            <span class="left">Size:</span>
                            <span class="right">` + window.width + ` X ` + window.height + ` (cm)</span>
                        </div>
                        <div class="content-line shape">
                            <span class="left">Shape:</span>
                            <span class="right">` + shape[parseInt(window.shape) - 1] + `</span>
                        </div>
                        <div class="content-line color">
                            <span class="left">Premium:</span>
                            <span class="right">` + premium_name + `</span>
                        </div>
                        <div class="content-line design">
                            <span class="left">Design:</span>
                            <span class="right">Free</span>
                        </div>
                        <div class="content-line price">
                            <span class="left">Price (HT):</span>
                            <span class="right">` + product_price + `</span>
                        </div>
                        <div class="content-line price-vat">
                            <span class="left">Price (TTC):</span>
                            <span class="right"></span>
                        </div>
                    </div>
                </div>
            `);

            var options_html = $(`
                <div class="lumise-product-detail" id="lumise_product_options">
                    <p class="lumise-cart-field-label">Options</p>
                    <div class="content-wrap">
                        <div class="content-line">
                            <label class="class_option">
                                <input type="checkbox" id="p_opt_1" />
                                Pose sur place par un PRO
                            </label>
                            <span>( Notre partenaire nosposeurs.com vous contactera  dans les plus bref délais pour établir un devis et fixer un rdv. )</span>
                        </div>
                    </div>
                </div>
            `);
            option_wrp.prepend(product_detail_html);
            option_wrp.append(options_html);

            // Click Order Option
            $('#lumise-continue-btn').on('click', function (e) {
                // Size
                $('#lumise_product_detail .size .right').text(window.product.width + ' X ' + window.product.height + ' (' + window.product.unit + ')');
                // Premium
                var premium_name = $('#lumise-colors-list ul').find('li[data-color="' + window.bg_color + '"]').text();
                $('#lumise_product_detail .color .right').text(premium_name);
                // Prices
                var product_price = $('#lumise-navigations span.lumise-price.lumise-product-price').text();
                $('#lumise_product_detail .price .right').text(product_price);
                var product_price_with_vat = parseFloat(parseFloat(product_price) + lumise.cart.price.vat).toFixed(2);
                $('#lumise_product_detail .price-vat .right').text(product_price_with_vat + currency);
            });

            // Color picker from Right to Left
            var li_fill = $('ul.lumise-top-nav.right[data-mode="standard"]').find('li[data-tool="fill"]');
            li_fill.find('span[data-tip="true"]').remove();
            li_fill.prepend($(`<span data-view="noicon" data-color="rgb(0, 0, 0)">
                    <input type="text" data-color="rgb(0, 0, 0)" readonly="" value="" style="background:rgb(0, 0, 0)">
                </span>`));

            $('ul.lumise-top-nav.left[data-mode="standard"]').prepend(li_fill);
            $('#fill-ops-sub').attr('data-pos', 'left');

            // event
            $('#lumise-main').on('mousedown touchstart', function (e) {
                // console.log('started');
                if ($('#lumise-top-tools').attr('data-view') != 'standard') {
                    // fill color
                    var fill_color = $('#lumise-fill').val();
                    var fill_circle = li_fill.find('span[data-view="noicon"] input');
                    fill_circle.attr('data-color', fill_color);
                    fill_circle.css('background', fill_color);
                }
            });

            li_fill.on('click', '#lumise-color-presets li', function (e) {
                var selected_fill_color = $(this).attr('data-color');
                var fill_circle = li_fill.find('span[data-view="noicon"] input');
                fill_circle.attr('data-color', selected_fill_color);
                fill_circle.css('background', selected_fill_color);
            });

            // Top Nav adjust pos
            var ul_pops = $('ul.lumise-top-nav.left').find('ul[data-pos="right"]');
            $.each(ul_pops, function (i, ul) {
                $(this).attr('data-pos', 'left');
            });

            // Change text icon
            var icon_text = leftNav.find('li[data-tab="text"] .lumisex-character');
            icon_text.removeClass('lumisex-character');
            icon_text.addClass('nxi nxi-text');

            // Add size element
            var size_ele = `
                <div id="canvas-dimension" class="display-size"></div>
            `;
            $('#lumise-workspace').append($(size_ele));
        });
    });

    // Get Base products
    lumise.post({
        action: 'addon',
        component: 'get_baseProducts'
    }, function (res) {
        if (res !== '') {
            var width = $(window).width() * 0.75;
            var footer = '';
            tmpl = '<div id="lumise-lightbox" class="lumise-lightbox">\
                    <div id="lumise-lightbox-body">\
                        <div id="lumise-lightbox-content" style="min-width:' + width + 'px">\
                            <div id="lumise-change-products-wrp" data="Choose product">\
                            <h2 data-view="top">Product Bases</h2>\
                                '+res+'\
                            </div>\
                        </div>\
                        '+footer+'\
                        <a class="kalb-close" href="javascript:void(0)" title="Close">\
                            <i class="lumisex-android-close"></i>\
                        </a>\
                    </div>\
                    <div class="kalb-overlay"></div>\
                </div>';
                
            $('.lumise-lightbox').remove();
            $('body').append(tmpl);
            $('.lumise-lightbox').hide();

            // Set product info
            var product_bases = $('body').find('#lumise-change-products-wrp ul[data-view="products"] li');
            var cur_url = new URL(window.location.href);
            var product_base_id = cur_url.searchParams.get('product_base');
            var leftNav = $('div#lumise-left>div.lumise-left-nav-wrp>ul.lumise-left-nav');
            $.each(product_bases, function(idx, item) {
                if($(item).attr('data-id') == product_base_id) {
                    $(item).attr('data-current', 'true');
                    var base_name = $(item).find('span[data-view="name"]').text();
                    var base_price = $(item).find('span[data-view="price"]').text();
                    leftNav.find('li[data-tab="mirtil_product"] ul[data-view="sub"] h3').text(base_name);
                    leftNav.find('li[data-tab="mirtil_product"] ul[data-view="sub"] p.price').text(parseFloat(base_price).toFixed(2) + ' ' + lumise.data.currency);
                }
            });

            if(window.width !== undefined && window.height !== undefined) {
                if(lumise.stage().product !== undefined) {
                    change_size(window.width, window.height);
                } else {
                    setTimeout(function(){
                        change_size(window.width, window.height);
                    }, 3000);
                }
            }
        }

        $('#lumise-lightbox').on('click', '.kalb-close', function(e) {
            $('.lumise-lightbox').hide();
        });
    });
}

function change_size(width, height) {

    console.log('change objects size');

    window.product.width = width;
    window.product.height = height;
    window.product.unit = $('#change_unit').attr('unit');

    var main = lumise.get.el('main'),
        mw = main.width() - (lumise.ops.window_width < 1025 ? 0 : 20),
        mh = main.height() - (lumise.ops.window_width < 1025 ? -40 : 10);

    var w = parseFloat(width),
        h = parseFloat(height),
        s = lumise.stage();

    // Store current size to old
    window.old_w = s.product.width;
    window.old_h = s.product.height;

    var r_screen = mw / mh;
    var r_self = w / h,
        nw, nh, pw, ph;
    // var s_url = 'products/jrqusxdg.png';
    // var s_image = lumise.data.upload_url + s_url;
    // In the case of width > height

    if (r_self > r_screen) {
        nw = mw * 0.9;
        nh = nw / r_self;
    } else {
        nh = mh * 0.9;
        nw = r_self * nh;
    }

    pw = parseInt(nw);
    ph = parseInt(nh);

    // s.canvas.width = pw + 50;
    // s.canvas.height = ph + 50;

    // Product Size;
    s.product.width = pw;
    s.product.height = ph;
    s.product.left = s.canvas.width / 2;
    s.product.top = (s.canvas.height - 40) / 2;

    if (s.backgrounds != undefined) {

        // Process mode here
        var bg_obj = s.backgrounds;

        s.canvas.remove(s.backgrounds);
        delete s.backgrounds;

        var objects = s.canvas.getObjects();

        fabric.util.loadImage(bg_obj.url, function (img) {

            // Process mode here
            var ops = {
                left: s.canvas.width / 2,
                top: (s.canvas.height - 40) / 2,
                width: s.product.width,
                height: s.product.height,
                selectable: false,
                evented: false,
                url: bg_obj.url,
                price: bg_obj.price
            };

            s.backgrounds = new fabric.Image(img);
            s.backgrounds.set(ops);

            objects.splice(1, 0, s.backgrounds);

            lumise.f(false);
            change_bg_mode();
            s.canvas.renderAll();
        });
    }

    // Product Color Area;
    s.productColor.width = pw - 2;
    s.productColor.height = ph - 2;
    s.productColor.left = s.canvas.width / 2;
    s.productColor.top = (s.canvas.height - 40) / 2;

    // Edit Zone and Limit Zone;
    var limit = {
        width: parseInt(pw - 4),
        height: parseInt(ph - 4),
        top: parseInt(s.productColor.top + ((s.productColor.height - ph + 4) / 2)),
        left: parseInt(s.productColor.left + ((s.productColor.width - pw + 4) / 2)),
    }

    s.limit_zone.width = limit.width;
    s.limit_zone.height = limit.height;
    s.limit_zone.left = limit.left - pw / 2;
    s.limit_zone.top = limit.top - ph / 2;

    var r_product = pw / s.product_width;
    var editing = {
        width: parseInt(s.edit_zone.width),
        height: parseInt(s.edit_zone.height / r_self),
        left: parseInt(s.edit_zone.left * r_product),
        top: parseInt(s.edit_zone.top * r_product),
    }

    // s.edit_zone.width = editing.width;
    s.edit_zone.height = editing.height;
    s.edit_zone.left = editing.left;
    s.edit_zone.top = editing.top;

    // Stage product size
    // s.product_width = parseInt(s.product_width * r_product);
    s.product_height = parseInt(s.product_width / r_self);

    // Set base Picture
    // s.image = s_image;
    // s.url = s_url;

    // Adjust objects
    var ratio = get_ratio();

    s.canvas.getObjects().map(function (o) {
        if (o.evented === true) {
            var o_w = o.width,
                o_h = o.height,
                o_l = o.left,
                o_t = o.top,
                o_f = o.fontSize;

            o_s = o.scaleX;
            o_z = o.zoomX;

            if (o.type != 'path') {
                o.width = o_w * ratio;
                o.height = o_h * ratio;
            } else {
                o.zoomX = o_z / ratio;
                o.zoomY = o_z / ratio;
            }

            o.left = s.product.left + (o_l - s.product.left) * ratio;
            o.top = s.product.top + (o_t - s.product.top) * ratio;

            if(o.type == 'curvedText') {
                var o_scaleX = o.scaleX;
                var o_scaleY = o.scaleY;
                var o_r = o.radius;

                o.scaleX = o_scaleX * ratio;
                o.scaleY = o_scaleY * ratio;
                o.radius = o_r * ratio;
            }

            // If object resourse is text
            o.fontSize = o_f * ratio;
            o.radius = o_r * ratio;
        }
    });

    // Set Size
    var print_size = {
        constrain: true,
        width: w,
        height: h,
        unit: "cm"
    }

    var s_unit = $('#change_unit').attr('unit');

    if (s_unit == 'm') {
        print_size.width = w * 100;
        print_size.height = h * 100;
    }
    s.size = print_size;
    lumise.get.el('print-nav').find('input[name="size"]').val(w + ' X ' + h);
    s.canvas.renderAll();

    var canvas_dimension_html = '<span>Width: '+ width + s_unit +'</span>, <span>Height: '+ height + s_unit +'</span>';
    $('#canvas-dimension').html(canvas_dimension_html);
    
    // draw_axis();
}

function draw_axis() {
    var cv = document.createElement('canvas'),
        ctx = cv.getContext('2d'),
        s = lumise.stage();
        
    var margin = 20;

    var limit = {
        width: s.productColor.cacheWidth - 4,
        height: s.productColor.cacheHeight - 4,
        left: s.productColor.left,
        top: s.productColor.top
    }

    console.log(s.productColor);
    console.log(limit);

    var pA_x = limit.left - (limit.width / 2);
    var pA_y = limit.top - (limit.height / 2);

    var pB_x = limit.left + (limit.width / 2);
    var PB_y = pA_y;

    var pC_x = pA_x;
    var pC_y = limit.top + (limit.height / 2);

    ctx.beginPath();
    ctx.moveTo(pA_x, pA_y - margin);
    ctx.lineTo(pB_x, PB_y - margin);

    ctx.moveTo(pA_x - margin, pA_y);
    ctx.lineTo(pC_x - margin, pC_y);
    ctx.lineWidth = 1;
    
    ctx.stroke();
}

// Add price to cart based on attr
function change_cart() {

    // Get Attrbuite Prices
    var base_price = lumise.cart.price.base;
    var attr_price = lumise.cart.price.attr;
    var color_price = lumise.cart.price.color;

    var origin_price = base_price + attr_price + color_price;
    var total_price = base_price * attr_price * color_price;
    var extra_price = total_price - origin_price;

    // Set Extra price to match Lumise cart calcuates
    lumise.cart.price.extra.values = [{
        price: extra_price
    }];

    // Set Vat price and Add to Element
    var vat_price = total_price * 0.2 * lumise.cart.qty;
    var ttc_price = total_price + vat_price;

    lumise.cart.price.vat = vat_price;
    var vat_ele = $('#vat_price');
    if (vat_ele.length == 0) {
        vat_ele = '<span id="vat_price">' + ttc_price.toFixed(2) + lumise.data.currency + '</span><span> TTC</span>';
        $(vat_ele).appendTo($('#lumise-navigations ul[data-block="right"]>li:first-child'));
    } else {
        vat_ele.text(ttc_price.toFixed(2) + lumise.data.currency);
    }

    // Display New Price
    lumise.cart.variations(this);
    lumise.cart.calc();
    lumise.render.cart_change();
    lumise.actions.do('cart-changed', true);
}

function get_ratio() {

    var s = lumise.stage();
    var pArea = {
        width: s.product.width,
        height: s.product.height,
        left: s.product.left,
        top: s.product.top
    };

    var vRect = {
        pA: {
            x: 0,
            y: 0
        },
        pB: {
            x: 0,
            y: 0
        },
        width: 0,
        height: 0
    };

    s.canvas.getObjects().map(function (o) {

        if (o.evented === true) {

            var oArea = {
                width: o.width * o.scaleX,
                height: o.height * o.scaleY,
                left: o.left,
                top: o.top
            };

            var pA_x = oArea.left - (oArea.width / 2);
            var pA_y = oArea.top - (oArea.height / 2);

            if (vRect.pA.x == 0) {
                vRect.pA.x = pA_x;
                vRect.pA.y = pA_y;
            } else {
                if (pA_x < vRect.pA.x) {
                    vRect.pA.x = pA_x;
                    vRect.pA.y = pA_y;
                }
            }

            var pB_x = oArea.left + (oArea.width / 2);
            var pB_y = oArea.top + (oArea.height / 2);

            if (vRect.pB.x == 0) {
                vRect.pB.x = pB_x;
                vRect.pB.y = pB_y;
            } else {
                if (pB_x > vRect.pB.x) {
                    vRect.pB.x = pB_x;
                    vRect.pB.y = pB_y;
                }
            }
        }
    });

    vRect.width = vRect.pB.x - vRect.pA.x;
    vRect.height = vRect.pB.y - vRect.pA.y;

    // Compare vRect size and product size
    var ratio = {
        x: 1,
        y: 1
    };

    ratio.x = pArea.width / vRect.width;
    ratio.y = pArea.height / vRect.height;

    if (ratio.x < ratio.y) {
        return ratio.x;
    } else {
        return ratio.y;
    }
}

function change_bg_mode() {

    var mode = 'tile';

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

}

function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  
    // we'll store the parameters here
    var obj = {};
  
    // if query string exists
    if (queryString) {
  
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
  
      // split our query string into its component parts
      var arr = queryString.split('&');
  
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
  
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
  
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
  
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
  
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
  
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
  
    return obj;
}