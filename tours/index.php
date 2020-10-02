<?php
/*
Name: Tours
Description: Create and manage tours/guide for end-users
Version: 1.0
Compatible: 1.7
*/

class lumise_addon_tours extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_tours');
		
		/*
		*	Action ajax
		*/
		
		$lumise->add_action('addon-ajax', array(&$this, 'ajax_action'));
		
		/*
		*	Insert your code like css, js into header or footer
		*/
		
		$lumise->add_action('editor-header', array(&$this, 'editor_header'));
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		
		if ($lumise->connector->is_admin()) {
			$lumise->add_action('nav-left-after', array(&$this, 'nav_left_after'));
		}
			
	}
	
	public function ajax_action() {
		
		global $lumise;
		
		if (
			$lumise->connector->is_admin() &&
			isset($_POST['component']) &&
			$_POST['component'] == 'tours' &&
			isset($_POST['task']) &&
			$_POST['task'] == 'save' &&
			isset($_POST['data'])
		) {
			$lumise->set_option('tours', $_POST['data']);
			echo 1;
			return;
		}
		
	}
	
	public function editor_header() {
		
		global $lumise;
		
		if (!$this->is_backend()) {
			$color = explode(':', $lumise->cfg->settings['colors'])[0];
			echo '		<link rel="stylesheet" href="'.$this->get_url('assets/css/tours.css?ver=1').'" type="text/css" media="all" />';
			echo '		<style type="text/css">
				.lumise-tour-wrp[data-arr="rb"]:after {border-left-color: '.$color.';}
				.lumise-tour-wrp[data-arr="lb"]:after {border-right-color: '.$color.';}
				.lumise-tour-wrp[data-arr="bl"]:after, 
				.lumise-tour-wrp[data-arr="bc"]:after, 
				.lumise-tour-wrp[data-arr="br"]:after {border-top-color: '.$color.';}
				div#LumiseDesign #lumise-tours-nav li[data-active="true"],.lumise-tour-wrp-start foot a[href="#start"]{background: '.$color.' !important;}
			</style>';
		}
	}
	
	public function editor_footer() {
		
		global $lumise;
		
		if (!$this->is_backend()) {
		
			$data = $lumise->get_option('tours');
			
			if ($data === null || empty($data))
				$data = '%7B%22publish%22%3A0%2C%22version%22%3A%221.0%22%2C%22data%22%3A%5B%7B%22arr%22%3A%22lt%22%2C%22content%22%3A%22First%20step%22%2C%22pin%22%3A%22tl%22%2C%22pos%22%3A%22left%3A%20100px%3B%20top%3A%20120px%3B%22%7D%5D%7D';
				
			echo '<script type="text/javascript">var lumise_tours_data = "'.$data.'";</script>';
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/tours.js?ver=1').'"></script>';
		}
	}
	
	public function nav_left_after() {
		
		global $lumise;
		
		echo '<li data-tool="tours" data-callback="designs">
				<span>'.$lumise->lang('Tours').'</span>
				<ul data-view="sub" id="lumise-tours-nav">
					<header>
						<h3>
							'.$lumise->lang('Tours manage').'
						</h3>
						<i class="lumisex-android-close close" title="'.$lumise->lang('Close').'"></i>
					</header>
					<li data-row="public">
						<label>'.$lumise->lang('Publish tours?').'</label>
						<div class="lumise-switch">
							<input type="checkbox" name="publish" class="lumise-toggle-button inps">
							<span class="lumise-toggle-label" data-on="YES" data-off="NO"></span>
							<span class="lumise-toggle-handle"></span>
						</div>
					</li>
					<li data-row="version">
						<label>'.$lumise->lang('Tours version').':</label>
						<input type="text" placeholder="'.$lumise->lang('Change version to reset').'" name="version" class="inps">
					</li>
					<li data-row="current">
						<ul></ul>
						<p>
							<label>'.$lumise->lang('Call to action').':</label>
							<input type="text" name="action" class="inps" placeholder="Eg: your_js_function();" />
						</p>
						<p>
							<label>'.$lumise->lang('Box arrow').':</label>
							<select name="arr" class="inps">
								<option value="tl">Top left</option>
								<option value="tc">Top center</option>
								<option value="tr">Top right</option>
								<option value="lt">Left top</option>
								<option value="lc">Left center</option>
								<option value="lb">Left bottom</option>
								<option value="bl">Bottom left</option>
								<option value="bc">Bottom center</option>
								<option value="br">Bottom right</option>
								<option value="rt">Right top</option>
								<option value="rc">Right center</option>
								<option value="rb">Right bottom</option>
							</select>
						</p>
						<p>
							<label>'.$lumise->lang('Pinned by').':</label>
							<select name="pin" class="inps">
								<option value="tl">Top left</option>
								<option value="tr">Top right</option>
								<option value="bl">Bottom left</option>
								<option value="br">Bottom right</option>
							</select>
						</p>
						<p data-view="content">
							<textarea class="inps" placeholder="'.$lumise->lang('Tour content in plain text or html, Drag the box to set possition').'" name="content"></textarea>
						</p>
						<p data-view="btns">
							<button class="lumise-btn" data-func="save">'.$lumise->lang('Save tours').'</button>
						</p>
					</li>
				</ul>
			</li>';	
	}
		
	/*
		Actions on active or deactive this addon
	*/
	
	static function active() {
		
		global $lumise;
		
		
	}
	
}