<?php
/*
Name: Sync design to Dropbox
Description: Auto sync printing ready files to Dropbox
Version: 1.0
Compatible: 1.7.3
*/

class lumise_addon_dropbox_sync extends lumise_addons {
	
	function __construct() {
		
		global $lumise;
		
		/*
		*	Access core js via your JS function name
		*/
		
		$this->access_corejs('lumise_addon_dropbox_sync');
		
		$lumise->add_action('editor-footer', array(&$this, 'editor_footer'));
		$lumise->add_action('addon-ajax', array(&$this, 'action_ajax'));
		
		$lumise->add_action('store-cart', array(&$this, 'store_cart'));
				
	}

	public function editor_footer() {
		
		global $lumise;
		
		if (!$this->is_backend()) {
			echo '<script type="text/javascript" src="'.$this->get_url('assets/js/dropbox_sync.js?ver=1').'"></script>';
		}
	}
	
	public function settings() {
		
		global $lumise;
		
		return array(
			array(
				'type' => 'input',
				'name' => 'dropbox_orders_folder',
				'desc' => 'Set the folder name to storage printing files',
				'label' => 'Dropbox folder',
				'default' => '/LUMISE_ORDERS'
			),
			array(
				'type' => 'input',
				'type_input' => 'password',
				'name' => 'dropbox_access_token',
				'label' => $lumise->lang('Dropbox Access Token'),
				'desc' => 
					'<font color="red">'.$lumise->lang('Notice: This API does not work on localhost, you need to install on the live server').'</font><br>'.
					$lumise->lang('Step 1: Login to your Dropbox and <a href="https://www.dropbox.com/developers/apps" target=_blank>Create a new APP</a>.').'<br>'.
					$lumise->lang('Step 2: Generate the access token in your APP under the OAuth section').
					'<br><br><a href="#" onclick="test_dropbox_api(this);">Test your Access Token</a>'.
					'<script>function test_dropbox_api(el) {
						el.innerHTML = \'<i class="fa fa-spinner fa-spin"></i> Please wait..\';
						jQuery.ajax({
							url: LumiseDesign.ajax,
							method: \'POST\',
							data: {
								action: \'addon\',
								component: \'dropbox_sync\',
								nonce: \'LUMISE_ADMIN:\'+LumiseDesign.nonce
							},
							success: function(res) {
								jQuery(el).html("Test your Access Token again").parent().find(\'pre\').remove();
								jQuery(el).parent().append(\'<pre style="border: 1px dashed #eee;padding: 10px;border-radius: 3px;">\'+res+\'</pre>\');
							}
						});
					}</script>'
			)
		);
		
	}
	
	public function action_ajax() {
		
		global $lumise;
		
		if (isset($_POST['component']) && $_POST['component'] == 'dropbox_sync') {
			
			$get = $this->remote('https://api.dropboxapi.com/2/users/get_current_account');
			
			$res = @json_decode($get);
			
			if (is_object($res) && isset($res->account_id)) {
				echo 'Name: '.strtoupper($res->name->display_name).'<br>';
				echo 'Type: '.strtoupper($res->account_type->{'.tag'}).'';
				if ($res->disabled === false)
					echo '<br><br><font color="green">Your access token is working fine.</font>';
				else echo '<br><br><font color="red">Your access token is not working now.</font>';
			} else echo '<font color="red">'.$get.'</font>';
			
			exit;
			
		}
		
	}
	
	public function store_cart ($order_id = 0) {
		
		global $lumise;
		
		$order_id = (Int)$order_id;
		$items = $lumise->db->rawQuery("SELECT `product_id`, `product_base`, `qty`, `print_files` FROM `{$lumise->db->prefix}order_products` WHERE `order_id`={$order_id}");
		
		if (count($items) === 0)
			return;
			
		$token = $lumise->get_option('dropbox_access_token');
		$folder = $lumise->get_option('dropbox_orders_folder');
		
		if ($folder === null || empty($folder))
			$folder = '/LUMISE_ORDERS';
		
		if (strpos($folder, '/') !== 0)
			$folder = '/'.$folder;
		
		$path =  $folder."/".date('Y/m', time());
		
		$stt = 0;
			
		foreach ($items as $item) {
			
			$stt++;
			
			$spath =  $path."/order#".$order_id.'/item#'.$stt.' - product#'.(!empty($item['product_id']) ? $item['product_id'] : $item['product_base']).' (qty '.$item['qty'].')';
			
			$this->remote(
				'https://api.dropboxapi.com/2/files/create_folder_v2',
				array(
					"path" => $spath,
					"autorename" => false
				)
			);
			
			if (!empty($item['print_files'])) {
				$files = @json_decode($item['print_files']);
				if (count($files) > 0) {
					foreach ($files as $file) {
						$f = explode('-stage', $file);
						$this->remote(
							'https://api.dropboxapi.com/2/files/save_url',
							array(
								"path" => $spath.'/stage-'.$f[1],
								"url" => $lumise->cfg->upload_url.'orders/'.str_replace(DS, '/', $file)
							)
						);
					}
				}
			}
			
		}
		
	}
	
	public function remote ($url = '', $body = null) {
		
		global $lumise;
		
		$ch = curl_init();
		$token = $lumise->get_option('dropbox_access_token');
		    
	    curl_setopt($ch, CURLOPT_URL, $url);
	   
	    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POST, 1);
		
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
	    
	    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			"Authorization: Bearer ".$token,
			"Content-Type: application/json; charset=utf-8"
		));
	    
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 	
	    curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		
	    $get = curl_exec($ch);
	    curl_close($ch);
	    
	    return $get;
		    
	}
	
}
