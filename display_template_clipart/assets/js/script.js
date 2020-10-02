(function($) {
    var cate_id = 0;
    var cate_type = '';
    var search = '';
    var c_page = 0;
    var limit;
    var column;

    function getData(){

        var limit = $('input[name="lumise_shortcode_per_page"]').val();
        var column = $('input[name="lumise_shortcode_columns"]').val();

        cate_id = $('#cate_id').val();
        cate_type = $('#cate_type').val();
        search = $('#search_adon').val();

        $('.lumise-addon-shortcode-tc-list').html('<img style="margin: 0 auto;" src="'+lumiseAddonDesign.loading_gif+'">');

        // $.ajax({
        //     url: my_ajax_object.ajax_url,
        //     dataType: "json",
        //     type: 'POST',
        //     // async: true,
        //     // cache: false,
        //     data: {
        //        action: 'get_lumise_tc',
        //        cate_id: cate_id,
        //        cate_type: cate_type,
        //        search: search,
        //        c_page: c_page,
        //        limit: limit
        //     },
        //     success: function(result) {
        //         var html = '';
        //         if(result.status == 0){
        //             html = result.message;
        //         }

        //         if(result.status == 1){
        //             c_page =  parseInt(result.message.cpage);
        //             total_page =  result.message.count_page;
        //             $.each(result.message.list, function(index, detailData){
        //                 if(detailData.type == 'cliparts'){
        //                     html += '<div data-id="'+detailData.id+'" class="lumise-addon-shortcode-tc-xs-6 lumise-addon-shortcode-tc-sm-'+Math.round(12/parseInt(column))+'"><a href="'+result.message.design_editor_url+'cliparts='+detailData.id+'"><img src="'+detailData.thumbnail_url+'" alt=""></a></div>';
        //                 }
        //                 if(detailData.type == 'templates'){
        //                     html += '<div data-id="'+detailData.id+'" class="lumise-addon-shortcode-tc-xs-6 lumise-addon-shortcode-tc-sm-'+Math.round(12/parseInt(column))+'"><a href="'+result.message.design_editor_url+'templates='+detailData.id+'"><img src="'+detailData.screenshot+'" alt=""></a></div>';
        //                 }
        //             });

        //             var pagination = '<ul>';
        //             pagination += '<li data-page="0" class="list-pagination"><i class="fa fa-angle-double-left" aria-hidden="true"></i></li>';
        //             if(total_page > 4 && c_page == 0){
        //                 pagination += '<li data-page="0" class="list-pagination pagnation-active">1</li>';
        //                 pagination += '<li data-page="1" class="list-pagination">2</li>';
        //                 pagination += '<li data-page="2" class="list-pagination">3</li>';
        //                 pagination += '<span class="">......</span>';
        //             }
        //             if(total_page > 4 && c_page != 0 && c_page != total_page){
        //                 pagination += '<span class="">......</span>';
        //                 pagination += '<li data-page="'+(c_page-1).toString()+'" class="list-pagination">'+c_page.toString()+'</li>';
        //                 pagination += '<li data-page="'+c_page.toString()+'" class="list-pagination pagnation-active">'+(c_page+1).toString()+'</li>';
        //                 pagination += '<li data-page="'+(c_page+1).toString()+'" class="list-pagination">'+(c_page+2).toString()+'</li>';
        //                 pagination += '<span class="">......</span>';
        //             }
        //             if(total_page > 4 && c_page != 0 && c_page == total_page){
        //                 pagination += '<span class="">......</span>';
        //                 pagination += '<li data-page="'+(c_page-2).toString()+'" class="list-pagination">'+(c_page-3).toString()+'</li>';
        //                 pagination += '<li data-page="'+(c_page-1).toString()+'" class="list-pagination">'+(c_page-2).toString()+'</li>';
        //                 pagination += '<li data-page="'+c_page.toString()+'" class="list-pagination pagnation-active">'+(c_page-1).toString()+'</li>';
        //             }
        //             if(total_page <= 4){
        //                 for (let index = 0; index < total_page; index++) {
        //                     let active = '';
        //                     if(index == c_page){
        //                         active = 'pagnation-active';
        //                     }
        //                     pagination += '<li data-page="'+index+'" class="list-pagination '+active+'">'+(index+1).toString()+'</li>';
        //                 }
        //             }
        //             pagination += '<li data-page="'+total_page+'" class="list-pagination"><i class="fa fa-angle-double-right" aria-hidden="true"></i></li>';
        //             pagination += '</ul>';
        //         }

        //         $('.lumise-addon-shortcode-tc-list').html(html);
        //         $('.lumise-addon-shortcode-tc-pagination').html(pagination);
        //     }
        // });

        $.ajax({
            url: LumiseDesign.ajax,
            type: 'POST',
            dataType: "json",
            data: {
                nonce: 'LUMISE_ADMIN:'+LumiseDesign.nonce,
                ajax: 'frontend',
                action: 'addon',
                component: 'get_lumise_tc',
                cate_id: cate_id,
                cate_type: cate_type,
                search: search,
                c_page: c_page,
                limit: limit
            },
            success: function(result) { 
                var html = '';
                if(result.status == 0){
                    html = result.message;
                }

                if(result.status == 1){
                    c_page =  parseInt(result.message.cpage);
                    total_page =  result.message.count_page;
                    $.each(result.message.list, function(index, detailData){
                        if(detailData.type == 'cliparts'){
                            var href =  result.message.design_editor_url+'cliparts='+detailData.id;
                            if(window.template !== undefined) {
                                href += '&bid='+window.template.base+'&pid='+window.template.product+'&width='+window.template.width+'&height='+window.template.height+'&qty=1';
                            }
                            
                            html += '<div data-id="'+detailData.id+'" class="lumise-addon-shortcode-tc-xs-6 lumise-addon-shortcode-tc-sm-'+Math.round(12/parseInt(column))+'"><a href="'+ href +'"><img src="'+detailData.thumbnail_url+'" alt=""></a></div>';
                        }
                        if(detailData.type == 'templates'){
                            var href =  result.message.design_editor_url+'templates='+detailData.id;
                            if(window.template !== undefined) {
                                href += '&bid='+window.template.base+'&pid='+window.template.product+'&width='+window.template.width+'&height='+window.template.height+'&qty=1';
                            }
                            
                            html += '<div data-id="'+detailData.id+'" class="lumise-addon-shortcode-tc-xs-6 lumise-addon-shortcode-tc-sm-'+Math.round(12/parseInt(column))+'"><a href="'+result.message.design_editor_url+'templates='+detailData.id+'"><img src="'+detailData.screenshot+'" alt=""></a></div>';
                        }
                    });

                    var pagination = '<ul>';
                    pagination += '<li data-page="0" class="list-pagination"><i class="fa fa-angle-double-left" aria-hidden="true"></i></li>';
                    if(total_page > 4 && c_page == 0){
                        pagination += '<li data-page="0" class="list-pagination pagnation-active">1</li>';
                        pagination += '<li data-page="1" class="list-pagination">2</li>';
                        pagination += '<li data-page="2" class="list-pagination">3</li>';
                        pagination += '<span class="">......</span>';
                    }
                    if(total_page > 4 && c_page != 0 && c_page != total_page){
                        pagination += '<span class="">......</span>';
                        pagination += '<li data-page="'+(c_page-1).toString()+'" class="list-pagination">'+c_page.toString()+'</li>';
                        pagination += '<li data-page="'+c_page.toString()+'" class="list-pagination pagnation-active">'+(c_page+1).toString()+'</li>';
                        pagination += '<li data-page="'+(c_page+1).toString()+'" class="list-pagination">'+(c_page+2).toString()+'</li>';
                        pagination += '<span class="">......</span>';
                    }
                    if(total_page > 4 && c_page != 0 && c_page == total_page){
                        pagination += '<span class="">......</span>';
                        pagination += '<li data-page="'+(c_page-2).toString()+'" class="list-pagination">'+(c_page-3).toString()+'</li>';
                        pagination += '<li data-page="'+(c_page-1).toString()+'" class="list-pagination">'+(c_page-2).toString()+'</li>';
                        pagination += '<li data-page="'+c_page.toString()+'" class="list-pagination pagnation-active">'+(c_page-1).toString()+'</li>';
                    }
                    if(total_page <= 4){
                        for (let index = 0; index < total_page; index++) {
                            let active = '';
                            if(index == c_page){
                                active = 'pagnation-active';
                            }
                            pagination += '<li data-page="'+index+'" class="list-pagination '+active+'">'+(index+1).toString()+'</li>';
                        }
                    }
                    pagination += '<li data-page="'+total_page+'" class="list-pagination"><i class="fa fa-angle-double-right" aria-hidden="true"></i></li>';
                    pagination += '</ul>';
                }

                $('.lumise-addon-shortcode-tc-list').html(html);
                $('.lumise-addon-shortcode-tc-pagination').html(pagination);
            }
        });
    };

    $(document).on('click', '.lumise_addon_tc_tabs_title', function(){

        if($(this).hasClass('active')) {
            $('.lumise_addon_tc_tabs_title').removeClass('active');
            $('.lumise_addon_tc_tabs_title').removeClass('active');
            $('.data-tab-content-clipart').removeClass('active');
            $('.data-tab-content-template').removeClass('active');

            return false;
        }
        
        $('.lumise_addon_tc_tabs_title').removeClass('active');
        $('.lumise_addon_tc_tabs_title').removeClass('active');
        $('.data-tab-content-clipart').removeClass('active');
        $('.data-tab-content-template').removeClass('active');
        
        $(this).addClass('active');
        let tab = $(this).attr('data-tab');
        if(tab == 'clipart'){
            $('.data-tab-content-clipart').addClass('active');
        }
        if(tab == 'template'){
            $('.data-tab-content-template').addClass('active');
        }
    });

    $(document).on('keyup', '#search_adon', function(e){
        let keycode = e.keyCode;
        if(keycode == 13){
            getData();
        }
    });

    $(document).on('change', '#lumise-addon-shortcode-dropdown-cliparts', function(){
        $('#cate_id').val($(this).val());
        $('#cate_type').val('cliparts');
        getData();
    });

    $(document).on('change', '#lumise-addon-shortcode-dropdown-templates', function(){
        $('#cate_id').val($(this).val());
        $('#cate_type').val('templates');
        getData();
    });

    $(document).on('click', '.lumise-addon-shortcode-list-cliparts', function(){
        let cat_id = $(this).attr('data-cat');
    });

    $(document).on('click', '.lumise-addon-shortcode-list-templates', function(){
        $(this).addClass('active');
    });

    $(document).on('click', '.list_name', function(){
        $('.list_name').removeClass('active');
        $(this).addClass('active');
        $('#cate_id').val($(this).attr('data-cat'));
        var cate_type = $(this).attr('data-type');
        $('#cate_type').val(cate_type);
        getData();
    })
    // $('.list_name').click(function(){
    //     $('.list_name').removeClass('active');
    //     $(this).addClass('active');
    //     $('#cate_id').val($(this).attr('data-cat'));
    //     var cate_type = $(this).attr('data-type');
    //     $('#cate_type').val(cate_type);
    //     getData();
    // })

    $(document).on('click', '.list_icon', function(){
        let cat_id = $(this).attr('data-cat');
        if($('ul[data-id="child_'+cat_id+'"]').length != 0){
            $('ul[data-id="child_'+cat_id+'"]').slideToggle( "slow" );
        }
    });

    // $('.list_icon').click(function(){
    //     let cat_id = $(this).attr('data-cat');
    //     if($('ul[data-id="child_'+cat_id+'"]').length != 0){
    //         $('ul[data-id="child_'+cat_id+'"]').slideToggle( "slow" );
    //     }
    // });

    $(document).on('click', '.list-pagination', function(){
        c_page = $(this).attr('data-page');
        getData();
    });

    if($('#lumise_template_clipart_list').length > 0){
        $.ajax({
            url: LumiseDesign.ajax,
            method: 'POST',
            data: {
                nonce: 'LUMISE_ADMIN:'+LumiseDesign.nonce,
                ajax: 'frontend',
                action: 'addon',
                component: 'clipart_templates_shortcode_html',
                per_page: $('#lumise_template_clipart_list').attr('per_page'),
                left_column: $('#lumise_template_clipart_list').attr('left_column'),
                columns: $('#lumise_template_clipart_list').attr('columns'),
                search: $('#lumise_template_clipart_list').attr('search')
            },
            statusCode: {
                403: function(){
                    alert('Error 403');
                }
            },
            success: function(result) {
                $('#lumise_template_clipart_list').html(result);
                getData();
            }
        });
    } else {
        getData();
    }
})(jQuery);