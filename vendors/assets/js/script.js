
/**
 * hermite-resize - Canvas image resize/resample using Hermite filter with JavaScript.
 * @version v2.2.4
 * @link https://github.com/viliusle/miniPaint
 * @license MIT
 */
function Hermite_class(){var t,a,e=[];this.init=void(t=navigator.hardwareConcurrency||4),this.getCores=function(){return t},this.resample_auto=function(t,a,e,r,i){var h=this.getCores();window.Worker&&h>1?this.resample(t,a,e,r,i):(this.resample_single(t,a,e,!0),void 0!=i&&i())},this.resize_image=function(t,a,e,r,i){var h=document.getElementById(t),o=document.createElement("canvas");if(o.width=h.width,o.height=h.height,o.getContext("2d").drawImage(h,0,0),void 0==a&&void 0==e&&void 0!=r&&(a=h.width/100*r,e=h.height/100*r),void 0==e){var n=h.width/a;e=h.height/n}a=Math.round(a),e=Math.round(e);var s=function(){var t=o.toDataURL();h.width=a,h.height=e,h.src=t,t=null,o=null};void 0==i||1==i?this.resample(o,a,e,!0,s):(this.resample_single(o,a,e,!0),s())},this.resample=function(r,i,h,o,n){var s=r.width,d=r.height;i=Math.round(i);var c=d/(h=Math.round(h));if(e.length>0)for(u=0;u<t;u++)void 0!=e[u]&&(e[u].terminate(),delete e[u]);e=new Array(t);for(var g=r.getContext("2d"),v=[],l=2*Math.ceil(d/t/2),f=-1,u=0;u<t;u++){var M=f+1;if(!(M>=d)){f=M+l-1,f=Math.min(f,d-1);var m=l;m=Math.min(l,d-M),v[u]={},v[u].source=g.getImageData(0,M,s,l),v[u].target=!0,v[u].start_y=Math.ceil(M/c),v[u].height=m}}!0===o?(r.width=i,r.height=h):g.clearRect(0,0,s,d);for(var w=0,u=0;u<t;u++)if(void 0!=v[u].target){w++;var p=new Worker(a);e[u]=p,p.onmessage=function(t){w--;var a=t.data.core;e[a].terminate(),delete e[a];var r=Math.ceil(v[a].height/c);v[a].target=g.createImageData(i,r),v[a].target.data.set(t.data.target),g.putImageData(v[a].target,0,v[a].start_y),w<=0&&void 0!=n&&n()};var _={width_source:s,height_source:v[u].height,width:i,height:Math.ceil(v[u].height/c),core:u,source:v[u].source.data.buffer};p.postMessage(_,[_.source])}},a=window.URL.createObjectURL(new Blob(["(",function(){onmessage=function(t){for(var a=t.data.core,e=t.data.width_source,r=t.data.height_source,i=t.data.width,h=t.data.height,o=e/i,n=r/h,s=Math.ceil(o/2),d=Math.ceil(n/2),c=new Uint8ClampedArray(t.data.source),g=(c.length,i*h*4),v=new ArrayBuffer(g),l=new Uint8ClampedArray(v,0,g),f=0;f<h;f++)for(var u=0;u<i;u++){var M=4*(u+f*i),m=0,w=0,p=0,_=0,y=0,b=0,C=0,I=f*n,D=Math.floor(u*o),R=Math.ceil((u+1)*o),U=Math.floor(f*n),A=Math.ceil((f+1)*n);R=Math.min(R,e),A=Math.min(A,r);for(var x=U;x<A;x++)for(var B=Math.abs(I-x)/d,L=u*o,j=B*B,k=D;k<R;k++){var q=Math.abs(L-k)/s,E=Math.sqrt(j+q*q);if(!(E>=1)){var W=4*(k+x*e);C+=(m=2*E*E*E-3*E*E+1)*c[W+3],p+=m,c[W+3]<255&&(m=m*c[W+3]/250),_+=m*c[W],y+=m*c[W+1],b+=m*c[W+2],w+=m}}l[M]=_/w,l[M+1]=y/w,l[M+2]=b/w,l[M+3]=C/p}var z={core:a,target:l};postMessage(z,[l.buffer])}}.toString(),")()"],{type:"application/javascript"})),this.resample_single=function(t,a,e,r){for(var i=t.width,h=t.height,o=i/(a=Math.round(a)),n=h/(e=Math.round(e)),s=Math.ceil(o/2),d=Math.ceil(n/2),c=t.getContext("2d"),g=c.getImageData(0,0,i,h),v=c.createImageData(a,e),l=g.data,f=v.data,u=0;u<e;u++)for(var M=0;M<a;M++){var m=4*(M+u*a),w=0,p=0,_=0,y=0,b=0,C=0,I=0,D=u*n,R=Math.floor(M*o),U=Math.ceil((M+1)*o),A=Math.floor(u*n),x=Math.ceil((u+1)*n);U=Math.min(U,i),x=Math.min(x,h);for(var B=A;B<x;B++)for(var L=Math.abs(D-B)/d,j=M*o,k=L*L,q=R;q<U;q++){var E=Math.abs(j-q)/s,W=Math.sqrt(k+E*E);if(!(W>=1)){var z=4*(q+B*i);I+=(w=2*W*W*W-3*W*W+1)*l[z+3],_+=w,l[z+3]<255&&(w=w*l[z+3]/250),y+=w*l[z],b+=w*l[z+1],C+=w*l[z+2],p+=w}}f[m]=y/p,f[m+1]=b/p,f[m+2]=C/p,f[m+3]=I/_}!0===r?(t.width=a,t.height=e):c.clearRect(0,0,i,h),c.putImageData(v,0,0)}};window.HERMITE = new Hermite_class();

jQuery(document).ready(function() {
	
	var validate_file = function(file) {
		
		if (file.size > 20485760)
			return false;
		
		return true;
		
	},
	create_thumbn = function(ops) {
				
		var img = new Image();
    		img.onload = function(){
	    		
	    		if (ops.width && ops.width > this.naturalWidth) {
		    		return ops.callback(ops.source, this);
	    		}
	    		
	    		let cv = window.creatThumbnCanvas ? 
	    				 window.creatThumbnCanvas : 
	    				 window.creatThumbnCanvas = document.createElement('canvas'),
					ctx = cv.getContext('2d'),
					w = (ops.width ? ops.width : (ops.height*(this.naturalWidth/this.naturalHeight))),
					h = (ops.height ? ops.height : (ops.width*(this.naturalHeight/this.naturalWidth))),
					type = this.src.indexOf('image/jpeg') > -1 ? 'jpeg' : 'png';
					
	    		_w = this.naturalHeight*(w/this.naturalWidth) >= h ? 
	    				w : this.naturalWidth*(h/this.naturalHeight);
	    		_h = (w == _w) ? this.naturalHeight*(w/this.naturalWidth) : h;
	    		
	    		
	    		cv.width = this.width;
	    		cv.height = this.height;
	    		
	    		if (type == 'jpeg') {
	    			ctx.fillStyle = ops.background? ops.background : '#eeeeee';
	    			ctx.fillRect(0, 0, cv.width, cv.height);
	    		};
				
	    		ctx.drawImage(this, 0, 0);
	    		
	    		HERMITE.resample_single(cv, _w, _h, true);
	    		
	    		ops.callback(cv.toDataURL('image/'+type, 100), this);
	    		
	    		delete ctx;
	    		delete cv;
	    		delete img;
	    		
    		}
    		
    	img.src = ops.source;
			
	},
	build_lumi = function(thumbn, img) {
		
		var w = 200,
			h = 200*(img.naturalHeight/img.naturalWidth),
			time = new Date().getTime(),
			data = {"stages":{"lumise":{"data":{"objects":[null,null,{"type":"image","originX":"center","originY":"center","left":w/2,"top":h/2,"width":w,"height":h,"fill":"rgb(0,0,0)","stroke":"","strokeWidth":0,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"visible":true,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"crossOrigin":"","alignX":"none","alignY":"none","meetOrSlice":"meet","src":img.src,"evented":true,"selectable":true,"filters":[],"resizeFilters":[]}],"background":"#ebeced","devicePixelRatio":2,"product_color":"#00ff7f","limit_zone":{"width":207.69375000000002,"height":332.31000000000006,"top":0,"left":0},"edit_zone":{"height":h,"width":w,"left":0,"top":0,"radius":"0"},"product_width":500,"product_height":500,"screenshot":thumbn},"screenshot":thumbn,"edit_zone":{"height":h,"width":w,"left":0,"top":0,"radius":"0"},"updated":time,"padding":[0,0]}},"updated":time}
		
		return 'data:application/octet-stream;base64,'+btoa(encodeURIComponent(JSON.stringify(data)));
		
	},
	before_submit_template = function(e) {
					
		var form = $(this),
			inp = form.find('#lumise-upload-input'), 
			old = form.find('#lumise-upload-input-old')
		
		if (inp.val() === '' || inp.val() == old.val()) {
			return true;
		}
		
		form.find('.lumise_form_submit *').hide();
		form.find('.lumise_form_submit').append('<button disabled="true" class="lumise-btn" id="lumise-files-form-submitting" style="margin-left: 180px;"><i class="fa fa-spin fa-spinner"></i> Uploading..</button>');
		
		
		var formData = new FormData();
		
		formData.append(inp.attr('name'), new Blob([btoa(encodeURIComponent(inp.val()))]));

		formData.append('action', 'addon');
		formData.append('component', 'upload-design');
		formData.append('nonce', 'LUMISE_NONCE:'+LumiseDesign.nonce); 
	
		$.ajax({
		    data	:	 formData,
		    type	:	 "POST",
		    url		:	 LumiseDesign.ajax,
		    contentType: false,
		    processData: false,
		    xhr: function() {
			    var xhr = new window.XMLHttpRequest();
			    xhr.upload.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
			        var percentComplete = evt.loaded / evt.total,
			        	txt = '<i class="fa fa-spin fa-spinner"></i>  '+parseInt(percentComplete*100)+'% upload complete';
			        if (percentComplete === 1)
			        	txt = '<i class="fa fa-spin fa-refresh"></i> Submitting..';
			       	$('#lumise-form-submitting').html(txt);
			      }
			    }, false);
			    return xhr;
			},
		    success: function (res, status) {
			    
			    res = JSON.parse(res);
			    
			    if (res.error) {
				    alert(res.error);
				    return;
			    };
			    
			    files = JSON.parse(decodeURIComponent(res.success));
			    inp.val(files[inp.attr('name')]);
			    
			    $(form).off('submit').submit();
			    
			}
		});
		
		return false;
	};
	
	$('.lumise_field_upload input[data-file-select]').on('change', function(e) {
		
		var type = this.getAttribute('data-file-select'),
			preview = this.getAttribute('data-file-preview'),
			_this = this,
			attr = function(s) { return _this.getAttribute('data-'+s); };
			
		if (this.files && this.files[0]) {
			
			if (!validate_file(this.files[0]))
				return alert('Error: Invalid upload file');
			
	        var reader = new FileReader();
			reader.file = this.files[0];
	        reader.onload = function (e) {
		       
		    	var result = e.target.result,
		    		data = {
						data: result,
						size: this.file.size,
						name: 'lumise-design-'+(new Date().getTime().toString(36))+'.lumi',
						type: this.file.type ? this.file.type : this.file.name.split('.').pop(),
						old: $(attr('file-input')+'-old').val(),
						path: $(attr('file-input')).attr('data-path')
					};
		       	
		       	if (result.indexOf('data:application/octet-stream') > -1) {	
			       	
					var deco = JSON.parse(decodeURIComponent(atob(result.split('base64,')[1]))),
						scre = deco.stages[Object.keys(deco.stages)[0]].screenshot;
					
					$(attr('file-preview')).attr('src', scre);
					data.thumbn = scre;
					
					$(attr('file-input')).val(JSON.stringify(data));
					
				} else if (result.indexOf('data:image/') > -1) {
					
					create_thumbn({
						source: result,
						width: 500,
						height: null,
						callback: function(thumbn, img) {
							
							data.thumbn = thumbn;
							data.data = img.src;
							data.type = '.'+(img.src.indexOf('data:image/png') > -1 ? 'png' : 'jpg');
							data.name = (new Date().getTime().toString(36))+data.type;
							
							$(attr('file-preview')).attr('src', thumbn);
							$(attr('file-input')).val(JSON.stringify(data));
							
						}
					});
					
				}
		       	
		    };
		    
		    reader.readAsDataURL(this.files[0]);
		    
		}	
		
	});
	
	$('.lumise_field_upload button[data-file-delete]').on('click', function(e) {
				
		var _this = this,
		attr = function(s){
			return _this.getAttribute('data-'+s);
		}
		
		if (attr('file-preview'))
			$(attr('file-preview')).attr('src', '').html('');
		if (attr('file-input'))
			$(attr('file-input')).val('');
		if (attr('file-thumbn')) {
			$(attr('file-thumbn')).val('');
		}
		
		e.preventDefault();
		return false;
		
	});
	
	$('#lumise-template-form').on('submit', before_submit_template);
	
});