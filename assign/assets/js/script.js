var firstload = false;

$(document).on('click', '[data-tab="templates"]', function(e){
    if(firstload == false){
        firstload = true;
        return false;
    }

    if(firstload == true && typeof lumise.design.nav.load['templates'] == 'function'){
        $('.lumise-list-items').html('<i class="lumise-spinner white x3 mt2"></i>');
        lumise.design.nav.load['templates'](e);
    }
});