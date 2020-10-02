<tmpl id="main">
	<div id="lumise-steps-nav">
		<a href="#back"><i class="iconk-android-arrow-back"></i> {{launcher.lang['back']}}</a>
		<ul>
			<li data-step="products" class="lumise-active">{{launcher.lang['1']}}</li>	
			<li data-step="designs">{{launcher.lang['2']}}</li>
			<li data-step="details">{{launcher.lang['155']}}</li>
		</ul>
		<button data-btn="continue">{{launcher.lang['continue']}} <i class="iconk-android-arrow-forward"></i></button>
	</div>
	<div id="lumise-steps-body">
		<div id="lumise-step-products" class="lumise-step lumise-active" data-step="products"></div>
		<div id="lumise-step-designs" class="lumise-step" data-step="designs"></div>
		<div id="lumise-step-details" class="lumise-step" data-step="details"></div>
	</div>
</tmpl>

<tmpl id="products">
<div>
<#

	launcher.data.current_step = 1;
	
	var other = [],
		categories = $.extend([], launcher.data.products.categories, true);
		
	categories.push({
			id: '',
			name: 'Other'
		});
	
	categories.map(function(category) {
#>
	<h3 class="lumise-list-category" data-category="{{category.id}}">
		{{category.name}}
	</h3>
	<ul class="lumise-list-products" data-category="{{category.id}}">
		<#
		
			launcher.data.products.products.map(function(product) {
				
				if (launcher.data.type == 'print' && product.product === 0) {
					launcher.data.selected_products.map(function(p, i) {
						if (p.id == product.id) {
							delete launcher.data.selected_products[i];
							launcher.data.selected_products = launcher.data.selected_products.filter(function() {return 1==1;});
						}
					});
					if (launcher.data.selected_product == product.id)
						launcher.data.selected_product = 0;
					return;
				};
					
				var cates = product.categories !== undefined && product.categories !== '' ? product.categories.split(',') : [];
				
				if (product.is_rendered !== true) {
					
					if (product.profit === undefined)
						product.profit = ((product.price*launcher.data.profit_percent)/100).toFixed(2);
					
					try {
						product.stages = launcher.fn.dejson(product.stages);
						product.attributes = launcher.fn.dejson(product.attributes);
						product.variations = launcher.fn.dejson(product.variations);
					} catch (ex) {}
					
					var color = launcher.fn.get_color(product.attributes),
						stages = product.stages,
						sname = Object.keys(stages)[0],
						img = launcher.fn.pimg(stages[sname]);
					
					product.image = img;
					product.color = color;
					
					product.is_rendered = true;
					
				};
					
				if (
					(category.id !== '' && cates.indexOf(category.id.toString()) > -1) ||
					(category.id === '' && product.categories === '')
				) {
					
					var is_activ = launcher.data.selected_products !== undefined && launcher.data.selected_products.filter(function(p){return p.id == product.id;}).length > 0 ? ' data-active="true"' : '';
					
				#>
					<li data-product="{{product.id}}"{{{is_activ}}}>
						<div class="lumise-product-image">
							<img style="background: {{product.color}}" src="{{{product.image}}}" alt="" />
						</div>
						<div class="lumise-product-text">
							<div>{{product.name}}</div>
							<em>{{launcher.lang['7']}} {{launcher.fn.price(product.price)}}</em>
						</div>
					</li>
				<#
				}
			});
		#>
	</ul>
<#
	});
#>
</div>
</tmpl>

<tmpl id="design">
	<div id="lumise-design-screen">
		<div id="lumise-left-side">
			<ul id="lumise-selected-products"></ul>
			<div id="lumise-left-side-btns">
				<button data-func="back"><i class="iconk-android-add"></i> <text>{{launcher.lang['1']}}</text></button>
			</div>
		</div>
		<div id="lumise-design-upload"></div>
	</div>
</tmpl>

<tmpl id="selected_products">
<#
	if (
		launcher.data.selected_products !== undefined && 
		launcher.data.selected_products.length > 0
	) {
		
		if (
			launcher.data.selected_product === undefined || 
			launcher.data.selected_products.filter(function(p) { return p.id == launcher.data.selected_product; }).length === 0
		) launcher.data.selected_product = launcher.data.selected_products[0].id;
		
		launcher.data.selected_products.map(function(p) { 
			
			var activ = (launcher.data.selected_product == p.id ? ' class="lumise-active"' : ''),
				s = Object.keys(p.stages)[0];
			
		#>
			<li data-product="{{p.id}}"{{{activ}}}>
				<span data-view="p1">
					<img style="background:{{p.color}}" src="{{{p.stages[s].screenshot !== undefined ? p.stages[s].screenshot : p.image}}}" />
				</span>
				<span data-view="p2">
					<label>{{p.name}}</label>
					<price>{{launcher.lang['7']}} <span>{{launcher.fn.price(p.price)}}</span></price>
					<em>{{(Object.keys(p.stages).length > 1 ? Object.keys(p.stages).length+' stages' : '1 stage')}}</em>
				</span>
				<i class="iconk-arrow-move" data-func="arrange"></i>
				<i class="iconk-android-close" data-func="delete"></i>
			</li>
		<# });
	}
#>
</tmpl>

<tmpl id="design_screen">
<#
	if (
		launcher.data.selected_product === undefined ||
		launcher.data.selected_products.filter(function(p) {return p.id == launcher.data.selected_product;}).length === 0
	) launcher.data.selected_product = launcher.data.selected_products[0].id;
	
	var product = launcher.data.selected_products.filter(function(p) {return p.id == launcher.data.selected_product;})[0];
	
#>
	<div id="lumise-design-preview"{{{product.is_preview === true ? ' class="is-preview"' : ''}}}>
		<ul data-view="stages-nav">
			<#
				
				if (product.active_stage === undefined)
					product.active_stage = Object.keys(product.stages)[0];
					
				if (Object.keys(product.stages).length > 1) {
					Object.keys(product.stages).map(function(s, i) {
						if (product.stages[s].image === undefined)
							product.stages[s].image = launcher.fn.pimg(product.stages[s]);
						#><li{{{(product.active_stage == s ? ' class="lumise-active"' : '')}}} data-stage="{{s}}"><img style="background:{{{product.color}}}" src="{{{product.stages[s].screenshot ? product.stages[s].screenshot : product.stages[s].image}}}" /><span>{{product.stages[s].label}}</span></li><#
					});
				}
			#>
		</ul>
		<div data-view="upload">
			<button id="lumise-upload-file"><i class="iconk-cloud-upload"></i> {{launcher.lang['17']}}</button>
			<span>({{launcher.lang['23']}} {{launcher.data.min_ppi}}PPI)</span>
			<div data-view="notice" id="lumise-upload-notice">
				<i class="iconk-android-close"></i> 
				<span></span>
			</div>
		</div>
		<div id="lumise-design-wrap" style="background: {{{product.color}}};">
		<#
			
			var stage = product.stages[product.active_stage],
				etop = (stage.edit_zone.top/stage.product_height)*100,
				eleft = (stage.edit_zone.left/stage.product_width)*100;
			
			if (stage.image === undefined)
				stage.image = launcher.fn.pimg(stage);
			
			var slabel = 'Size '+stage.size+' cm';
			
			if (stage.size === undefined || stage.size === '') {
				slabel = 'Custom size '+stage.edit_zone.width+' x '+stage.edit_zone.height;
			} else if (typeof stage.size == 'string') {
				Object.keys(launcher.data.size_default).map(function(s) {
					if (launcher.data.size_default[s].cm == stage.size)
						slabel = 'Size '+s+' ('+stage.size+' cm)';
				});
			} else if (typeof stage.size == 'object') {
				slabel = 'Custom size '+stage.size.width+' x '+stage.size.height+' '+stage.size.unit;
			}
			
			
		#>
			<img class="base-view" onload="this.parentNode.style.minHeight='0px'" src="{{stage.image}}" />
			<div id="lumise-edit-zone" data-overlay="{{stage.overlay}}" style="width: {{((stage.edit_zone.width/stage.product_width)*100)}}%;height: {{((stage.edit_zone.height/stage.product_height)*100)}}%;top:{{etop+50}}%;left:{{eleft+50}}%;border-color:{{launcher.fn.invert(product.color)}}" data-info="{{{slabel}}}"></div>
		</div>
		<ul id="lumise-design-tools" data-view="tools"></ul>
		<#
			var colors = launcher.fn.get_color(product.attributes, true);
			if (typeof colors == 'object' && colors.length > 0) {
		#>
			<ul data-view="colors">
				<#
					if (product.selected_colors === undefined)
						product.selected_colors = [colors[0]];
						
					product.selected_colors.map(function(c) {
						c = c.split('|');
						#><li data-func="select" data-color="{{c.join('|')}}" style="background:{{c[0]}}"{{{c[0].trim() == product.color ? ' class="lumise-active"' : ''}}}><span>{{c[1] !== undefined ? c[1].trim() : c[0].trim()}}</span></li><#		
					});
				#>
				<li data-func="add" data-float>
					<i class="iconk-android-add" data-func="add"></i>
					<span>{{launcher.lang['16']}}</span>
				</li>
			</ul>
			<ul data-float-global data-float data-view="list-colors">
				<li data-func="close">
					{{launcher.lang['close']}}
					<svg data-func="close" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="12" height="12" viewBox="0 0 284.929 284.929" xml:space="preserve"><path data-func="close" d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"></path></svg>
				</li>
				<#
					colors.map(function(c) {
						c = c.split('|');
						#><li data-color="{{c.join('|')}}" data-c={{c[0].trim()}} style="background:{{c[0].trim()}}"{{{product.selected_colors.indexOf(c.join('|')) > -1 ? ' class="lumise-active"' : ''}}}><span>{{(c[1] !== undefined ? c[1].trim() : c[0].trim())}}</span></li><#
					});
				#>
			</ul>
		<# } #>
		<svg is="exit-preivew" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="30" height="30" viewBox="0 0 485.213 485.213" xml:space="preserve">
<path d="M363.909,181.955C363.909,81.473,282.44,0,181.956,0C81.474,0,0.001,81.473,0.001,181.955s81.473,181.951,181.955,181.951    C282.44,363.906,363.909,282.437,363.909,181.955z M181.956,318.416c-75.252,0-136.465-61.208-136.465-136.46    c0-75.252,61.213-136.465,136.465-136.465c75.25,0,136.468,61.213,136.468,136.465    C318.424,257.208,257.206,318.416,181.956,318.416z"></path><path d="M471.882,407.567L360.567,296.243c-16.586,25.795-38.536,47.734-64.331,64.321l111.324,111.324    c17.772,17.768,46.587,17.768,64.321,0C489.654,454.149,489.654,425.334,471.882,407.567z"></path></svg>
	</div>
</tmpl>

<tmpl id="aligns">
<li data-func="preview">
	<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="20" height="20" viewBox="0 0 485.213 485.213" xml:space="preserve">
<path d="M363.909,181.955C363.909,81.473,282.44,0,181.956,0C81.474,0,0.001,81.473,0.001,181.955s81.473,181.951,181.955,181.951    C282.44,363.906,363.909,282.437,363.909,181.955z M181.956,318.416c-75.252,0-136.465-61.208-136.465-136.46    c0-75.252,61.213-136.465,136.465-136.465c75.25,0,136.468,61.213,136.468,136.465    C318.424,257.208,257.206,318.416,181.956,318.416z"></path><path d="M471.882,407.567L360.567,296.243c-16.586,25.795-38.536,47.734-64.331,64.321l111.324,111.324    c17.772,17.768,46.587,17.768,64.321,0C489.654,454.149,489.654,425.334,471.882,407.567z"></path></svg> 
	<span>{{launcher.lang['14']}}</span>
</li>
<li data-clear="design">
	<svg version="1.1" width="20" height="20" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 298.667 298.667" style="enable-background:new 0 0 298.667 298.667;" xml:space="preserve"><polygon points="298.667,30.187 268.48,0 149.333,119.147 30.187,0 0,30.187 119.147,149.333 0,268.48 30.187,298.667 149.333,179.52 268.48,298.667 298.667,268.48 179.52,149.333"/></svg>
	<span>{{launcher.lang['157']}}</span>
</li>
<#
if (data.el.parentNode.offsetWidth/data.el.offsetWidth < data.el.parentNode.offsetHeight/data.el.offsetHeight) {
#>
	<li data-align="top">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 384 384" style="transform:rotate(180deg)" width="20" height="20" xml:space="preserve">
<polygon points="277.333,213.333 213.333,213.333 213.333,0 170.667,0 170.667,213.333 106.667,213.333 192,298.667    "></polygon><rect x="21.333" y="341.333" width="341.333" height="42.667"></rect></svg>
		<span>{{launcher.lang['20']}}</span>
	</li>
	<li data-align="center">
		<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 469.333 469.333" xml:space="preserve">
<polygon points="320,85.333 256,85.333 256,0 213.333,0 213.333,85.333 149.333,85.333 234.667,170.667 "></polygon><polygon points="149.333,384 213.333,384 213.333,469.333 256,469.333 256,384 320,384 234.667,298.667 "></polygon><rect x="20" y="213.333" width="420" height="42.667"></rect></svg>
		<span>{{launcher.lang['18']}}</span>
	</li>
	<li data-align="bottom">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 384 384" width="20" height="20" xml:space="preserve">
<polygon points="277.333,213.333 213.333,213.333 213.333,0 170.667,0 170.667,213.333 106.667,213.333 192,298.667    "></polygon><rect x="21.333" y="341.333" width="341.333" height="42.667"></rect></svg>
		<span>{{launcher.lang['19']}}</span>
	</li>
<# } else { #>
	<li data-align="left">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 384 384" style="transform:rotate(90deg)" width="20" height="20" xml:space="preserve">
<polygon points="277.333,213.333 213.333,213.333 213.333,0 170.667,0 170.667,213.333 106.667,213.333 192,298.667    "></polygon><rect x="21.333" y="341.333" width="341.333" height="42.667"></rect></svg>
		<span>{{launcher.lang['21']}}</span>
	</li>
	<li data-align="center">
		<svg width="20" height="20" style="transform:rotate(90deg)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 469.333 469.333" xml:space="preserve">
<polygon points="320,85.333 256,85.333 256,0 213.333,0 213.333,85.333 149.333,85.333 234.667,170.667 "></polygon><polygon points="149.333,384 213.333,384 213.333,469.333 256,469.333 256,384 320,384 234.667,298.667 "></polygon><rect x="20" y="213.333" width="420" height="42.667"></rect></svg>
		<span>{{launcher.lang['18']}}</span>
	</li>
	<li data-align="right">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 384 384" width="20" height="20" style="transform:rotate(-90deg)" xml:space="preserve">
<polygon points="277.333,213.333 213.333,213.333 213.333,0 170.667,0 170.667,213.333 106.667,213.333 192,298.667    "></polygon><rect x="21.333" y="341.333" width="341.333" height="42.667"></rect></svg>
		<span>{{launcher.lang['22']}}</span>
	</li>
<# } #>
</tmpl>

<tmpl id="recent_designs">
<#
	var designs = {};
	launcher.data.selected_products.map(function(p) {
		Object.values(p.stages).map(function(s) {
			if (s.design && s.design.print_thumbnail && s.design.id !== undefined)
				designs[s.design.id] = s.design.url;
		});
	});
	if (Object.keys(designs).length > 0) {
#>
<li is="recent">
	<ul>
		<# Object.keys(designs).map(function(d) { #><li><img data-id="{{d}}" src="{{designs[d]}}" /></li><# });#>
	</ul>
	<span>{{launcher.lang['156']}}</span>
</li>
<# } #>
</tmpl>

<tmpl id="details">
	<div>
		<h3>{{launcher.lang[24]}}</h3>
		<table id="lumise-product-details">
			<thead>
				<tr>
					<td width="50">#</td>
					<td>{{launcher.lang['34']}}</td>
					<td>{{launcher.lang['2']}}</td>
					<td width="150">{{launcher.lang['35']}}</td>
				</tr>
			</thead>
			<tbody>
			<#
				launcher.data.selected_products.map(function(p, i) {
					#><tr>
						<td>{{i+1}}</td>
						<td data-view="form">
							<p>
								<label>{{launcher.lang['158']}}</label>
								<input name="name" data-inp="{{p.id}}" value="{{p.details.name}}" />
							</p>
							<p>
								<label>{{launcher.lang['9']}} (price base {{p.price}}{{launcher.data.currency}})</label>
								<input name="price" data-inp="{{p.id}}" value="{{p.details.price}}" placeholder="0.00" />
							</p>
							<p>
								<label>{{launcher.lang['159']}}</label>
								<textarea data-inp="{{p.id}}" name="description">{{p.details.description}}</textarea>
							</p>
						</td>
						<td data-view="screenshot">
							<# Object.keys(p.stages).map(function(s) { #>
								<img style="background:{{p.color}}" src="{{p.stages[s].screenshot !== undefined ? p.stages[s].screenshot : p.stages[s].image}}" />
							<# }); #>
						</td>
						<td data-view="actions">
							<a href="#edit" data-product="{{p.id}}">Edit</a> <span>|</span> 
							<a href="#delete" data-product="{{p.id}}">Delete</a>
						</td>
					</tr><#	
				});	
			#>
			</tbody>
		</table>
	</div>
</tmpl>

<tmpl id="success">
	<div id="lumise-publish-success">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 52 52" xml:space="preserve" width="120" height="120"><g>
	<path d="M26,0C11.664,0,0,11.663,0,26s11.664,26,26,26s26-11.663,26-26S40.336,0,26,0z M26,50C12.767,50,2,39.233,2,26   S12.767,2,26,2s24,10.767,24,24S39.233,50,26,50z" style="fill: rgb(145, 220, 90);"></path>
	<path d="M38.252,15.336l-15.369,17.29l-9.259-7.407c-0.43-0.345-1.061-0.274-1.405,0.156c-0.345,0.432-0.275,1.061,0.156,1.406   l10,8C22.559,34.928,22.78,35,23,35c0.276,0,0.551-0.114,0.748-0.336l16-18c0.367-0.412,0.33-1.045-0.083-1.411   C39.251,14.885,38.62,14.922,38.252,15.336z" style="fill: rgb(145, 220, 90);"></path>
</g></svg>
		<h3>{{launcher.lang[36]}}</h3>
		<p data-view="desc">{{launcher.lang[37]}}</p>
		<p data-view="btn"><a href="{{{data.link}}}">{{launcher.lang[40]}}</a></p>
		<p data-view="links">
			<a href="{{{launcher.cfg.url}}}ref=success">{{launcher.lang[41]}}</a>
			<a href="{{{data.link}}}">{{launcher.lang[42]}}</a>
			<a href="{{{launcher.cfg.dashboard_url}}}">{{launcher.lang[43]}}</a>
		</p>
	</div>
</tmpl>

<tmpl id="fail">
	<div id="lumise-publish-fail">
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 512 512" xml:space="preserve" width="120" height="120"><path d="M507.333,424.604c0,0,0,0-0.01-0.01C473.238,354.677,416.1,255.51,365.692,168.021     c-26.376-45.792-51.294-89.031-69.305-121.896c-8.5-15.521-23.605-24.792-40.398-24.792s-31.897,9.271-40.397,24.792     c-18.022,32.885-42.95,76.167-69.357,121.99C95.858,255.583,38.741,354.708,4.667,424.604C1.573,430.969,0,437.708,0,444.615     c0,25.396,20.511,46.052,45.731,46.052L256,490.646l210.269,0.021c25.22,0,45.731-20.656,45.731-46.052     C512,437.708,510.427,430.969,507.333,424.604z M466.271,469.344H45.75c-13.448,0-24.396-11.104-24.396-24.729     c0-3.646,0.844-7.24,2.51-10.667c33.75-69.229,90.667-168.021,140.875-255.177c26.458-45.927,51.448-89.313,69.573-122.396     c9.396-17.167,33.979-17.167,43.375,0c18.115,33.063,43.083,76.406,69.521,122.292c50.24,87.188,107.177,186.021,140.938,255.271     c1.677,3.438,2.521,7.031,2.521,10.677C490.667,458.24,479.719,469.344,466.271,469.344z" style="fill: rgb(255, 218, 68);"></path>
			<path d="M256,128.01c-5.896,0-10.667,4.771-10.667,10.667V352.01c0,5.896,4.771,10.667,10.667,10.667s10.667-4.771,10.667-10.667     V138.677C266.667,132.781,261.896,128.01,256,128.01z" style="fill: rgb(255, 218, 68);"></path>
			<circle cx="256" cy="416" r="10.667" style="fill: rgb(255, 218, 68);"></circle></svg>
		<h3>{{launcher.lang[44]}}</h3>
		<p data-view="desc">{{launcher.lang[45]}}</p>
		<pre style="display: inline-block">{{{data.res}}}</pre>
		<p data-view="btn"><button data-func="try">{{launcher.lang[46]}}</button></p>
	</div>
</tmpl>

<tmpl id="draft">
<#
	var draft = localStorage.getItem('LUMISE-DRAFT'),
		cur = launcher.fn.get_url('auto-draft');
	if (draft !== null && draft !== '') {
		draft = JSON.parse(draft);
	
	var objs = Object.keys(draft).filter(function(d) {
		return draft[d].type == launcher.data.type;
	});
	
#>
<div>
	<i class="iconk-files" data-count="{{objs.length}}"></i>
	<ul>
		<li>{{(launcher.data.type == 'sell' ? launcher.lang['148'] :  launcher.lang['154'])}}</li>
		<# objs.map(function(d) {
			#><li title="{{launcher.lang['151']}} {{new Date(draft[d].updated).toString().split('GMT')[0]}}" data-id="{{d}}" {{{(cur==d)?' class="active"':''}}}>
				<text>{{draft[d].label}}</text>
				<i class="iconk-android-close" data-func="delete" title="Delete"></i>
			</li><#
		}); #>
		<li data-func="new">{{launcher.lang['153']}}</li>
	</ul>
</div>
<# } #>
</tmpl>

<---END-CONFIRMED--->