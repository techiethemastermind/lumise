function lumise_addon_mirtil_products(lumise) {

    lumise.design.nav.load.mirtil_products = function (e) {

        lumise.xitems.load('mirtil_products', {
            preview: 'image',
            response: function (res) {
                console.log(res);
            },
        });
    }
}