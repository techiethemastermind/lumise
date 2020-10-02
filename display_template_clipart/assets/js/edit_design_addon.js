function lumise_addon_display_template_clipart_js(lumise) {

	window.lm = lumise;

	// first load
	lumise.add_action('first-completed', function(){
		var url = window.location.href;

		if( (typeof getAllUrlParams(url).cliparts != 'undefined' || typeof getAllUrlParams(url).templates != 'undefined' ) && typeof getAllUrlParams(url).product_base != 'undefined'  ){

			let resource = '';
			let id = '';
			if(typeof getAllUrlParams(url).cliparts != 'undefined'){
				resource = 'cliparts';
				id = getAllUrlParams(url).cliparts;
			}
			if(typeof getAllUrlParams(url).templates != 'undefined'){
				resource = 'templates';
				id = getAllUrlParams(url).templates;
			}
			

			lumise.f('Loading..');
			$.ajax({
				url: lumise.data.ajax,
				method: 'POST',
				dataType: "json",
				data: {
					nonce: 'LUMISE-SECURITY:'+lumise.data.nonce,
					ajax: 'frontend',
					action: 'addon',
					component: 'clipart_templates_shortcode',
					id: id,
					resource: resource
				},
				statusCode: {
					403: function(){
						alert('Error 403');
					}
				},
				success: function(result) {
					if(result.status == 0){
						lumise.f(result.message);
						return;
					}
					if(result.status == 1){
						// var ops = [
						// 	{
						// 		cates: '',
						// 		id: '4108',
						// 		name: 'cat',
						// 		price: 0,
						// 		resource: resource,
						// 		resource_id: 4108,
						// 		tags: '',
						// 		type: 'image',
						// 		url: 'http://localhost/wp3/wp-content/uploads/lumise_data/cliparts/2017/08/cat.svg'
						// 	}
						// ]
						if(resource == 'cliparts'){
							var ops = result.message;
							lumise.fn.preset_import(ops, {});
						}
						if(resource == 'templates'){
							lumise.itemInStage('add');

							var ops = result.message;

							lumise.itemInStage('add');
								
							lumise.templates.load({
								upload: ops[0].url,
								id: ops[0].id,
								price: ops[0].price
							});
							if (lumise.stage().template !== undefined){
								lumise.stage().template.loaded = true;
							}
						}
					}
					lumise.f(false);
		        }
			});
			

			// change product
		}

	});


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

}