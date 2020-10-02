<?php
/*
Name: Mirtil Images
Description: Cliparts, Upload, Shapes, Drawings
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_mirtil_images extends lumise_addons {

    function __construct() {

        global $lumise;

        /*
		*	Access core js via your JS function name
		*/
        $this->access_corejs('lumise_addon_mirtil_images');

        $this->add_component(
            array(
                "mirtil_images" => array(
                    "label" => "Images",
                    "icon" => "lumise-icon-picture",
                    "load" => "mirtil_images",
                    "class" => "lumise-x-thumbn",
                    "content" => ''
                )
            )
        );
        
        $lumise->add_filter('editor_menus', array(&$this, 'editor_menus'));

        /*
		*	Insert your code like css, js into header and footer
		*/
		
		$lumise->add_action('editor-header', array(&$this, 'editor_header'));
        $lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
        
        /*
		*	Action ajax
		*/
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
    }

    public function editor_menus($args) {
		
		global $lumise;
		
		$args['mirtil_images']['content'] = (
			($lumise->connector->is_admin() || $lumise->cfg->settings['disable_resources'] != 1) 
			? '<header class="lumise_form_group">
				<button class="active" data-nav="mirtil_cliparts">
					<i class="lumise-icon-picture"></i>
					<br>
					'.$lumise->lang('Images').'
				</button>
				<button data-nav="mirtil_upload">
					<i class="nxi nxi-upload"></i>
					<br>
					'.$lumise->lang('Upload').'
				</button>
				<button data-nav="mirtil_shapes" style="height: 52px;">
					<i class="nxi nxi-shapes"></i>
					<br>
					'.$lumise->lang('Shapes').'
				</button>
				<button data-nav="mirtil_drawings">
					<i class="lumise-icon-note"></i>
					<br>
					'.$lumise->lang('Drawings').'
				</button>
			</header>' : ''
			).
			'<div data-tab="mirtil_cliparts" class="active mirtil-images">'.
				$this->render_xitems(array(
					"component" => "mirtil_images",
					"search" => false,
					"category" => true,
					"preview" => true,
					"price" => true
				)).'
			</div>
			<div data-tab="mirtil_upload" class="mirtil-images" id="lumise-mirtil_upload">
				<div id="lumise-upload-form">
					<i class="lumise-icon-cloud-upload"></i>
					<span>'.$lumise->lang('Click or drop images here').'</span>
					<input type="file" multiple="true" />
				</div>
				<div id="lumise-upload-list">
					<ul class="lumise-list-items"></ul>
				</div>
			</div>
			<div data-tab="mirtil_shapes" class="mirtil-images" id="lumise-mirtil_shapes"></div>
            <div data-tab="mirtil_drawings" class="mirtil-images lumise-tab-body-wrp lumise-left-form" id="lumise-mirtil_drawing">'.
                '<h3>'.$lumise->lang('Free drawing mode').'</h3>
                <div>
                    <label>'.$lumise->lang('Size').'</label>
                    <inp data-range="helper" data-value="1">
                        <input id="lumise-drawing-width" data-callback="drawing" value="1" min="1" max="100" data-value="1" type="range" />
                    </inp>
                </div>
                <div'.($lumise->cfg->settings['enable_colors'] == '0' ? ' class="hidden"' : '').'>
                    <input id="lumise-drawing-color" placeholder="'.$lumise->lang('Click to choose color').'" type="search" class="color" />
                    <span class="lumise-save-color" data-tip="true" data-target="drawing-color">
                        <i class="lumisex-android-add"></i>
                        <span>'.$lumise->lang('Save this color').'</span>
                    </span>
                </div>
                <div>
                    <ul class="lumise-color-presets" data-target="drawing-color"></ul>
                </div>
                <div class="gray">
                    <span>
                        <i class="lumisex-android-bulb"></i>
                        '.$lumise->lang('Tips: Mouse wheel on the canvas to quick change the brush size').'
                    </span>
                </div>'.
            '</div>';
			
		return $args;
		
    }

    public function editor_header() {
        // Loading CSS in Editor Header
		if (!$this->is_backend()) {	
			echo '<link rel="stylesheet" href="'.$this->get_url('assets/css/mirtil_images.css?ver=1').'" type="text/css" media="all" />';
		}
    }
    
    public function editor_footer() {
        // Loading JavaScript in Editor Footer	
		if (!$this->is_backend()) {
            echo '<script type="text/javascript" src="'.$this->get_url('assets/js/mirtil_images.js?ver=1').'"></script>';
        }
    }

    public function ajax_action($comp) {
		
        global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'mirtil_images') {
            echo $lumise->lib->x_items('cliparts');
        }
        
        if (isset($_POST['component']) && $_POST['component'] == 'mirtil_shapes') {
            echo $lumise->lib->x_items('shapes');
		}
	}
    
    static function active() {
        global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (!in_array('mirtil_images', $comps))
            array_unshift($comps, 'mirtil_images');
            
        $lumise->set_option('components', implode(',', $comps));
    }

    static function deactive() {
		
		global $lumise;
		
		$comps = explode(',', $lumise->cfg->settings['components']);
		
		if (in_array('mirtil_images', $comps))
			unset($comps[array_search('mirtil_images', $comps)]);
		
		$lumise->set_option('components', implode(',', $comps));
	}
}