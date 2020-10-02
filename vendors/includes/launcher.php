<?php

class lumise_launcher {
	
	public $url;
	public $path;
	public $cfg;
    
    public function __construct() {
	    
	    global $lumise_woo, $lumise;    
		$lumise_woo->load_core();
		
		$this->url = $lumise->cfg->upload_url.'addons/vendors/';
		$this->path = $lumise->cfg->upload_path.'addons'.DS.'vendors'.DS.'launcher'.DS;
		
		$store_url = get_option( 'woocommerce_myaccount_page_id' );
		
		if ( $store_url ) {
			$store_url = get_permalink( $store_url ).'store';
		}
		
		@ini_set('upload_max_filesize', '500M');
		@ini_set('post_max_size', '500M');
		
		$this->cfg = array(
			"version" => '1.2',
			"url" => $this->url,
			"upload_url" => $lumise->cfg->upload_url,
			"tool_assests" => $lumise->cfg->assets_url,
			"checkout_url" => "",
			"dashboard_url" => "",
			"store_url" => $store_url,
			"cart_url" => "",
			"ajax" => $lumise->cfg->ajax_url,
			"assets" => $this->url."assets/",
			"max_size" => (int)ini_get('post_max_size'),
			"nonce" => lumise_secure::create_nonce('LAUNCHER-SECURITY')
		);
		
	}
	
	public function cms_product($id) {
		
		$wc_product = wc_get_product($id);
		
		return array(
			'id' => $id,
			'title' => html_entity_decode( get_the_title($id) ),
			'image' => get_the_post_thumbnail_url($id),
			'price' => $wc_product->get_price()
		);
		
	}
	
	private function valid_upload_designs() {
		
		@ini_set('upload_max_filesize', '500M');
		@ini_set('post_max_size', '500M');
		
		global $lumise;
		
		$time = time();
		$check = $lumise->check_upload($time);
		
		if ($check !== 1) {
			echo $lumise->lang($check);
			exit;
		}
		
		$max_size = (int)ini_get('post_max_size');
		$upload_size = ((int)$_POST['upload_size'])/1024000;
		
		if ( $max_size > 0 && $upload_size > $max_size ) {
			echo $lumise->lang('Error: The upload file size is larger than the server configuration').' (upload '.$upload_size.' of max '.$max_size.'MB)';
			exit;
		}
		
		return true;
		
	}
		
	private function upload_designs() {
		
		global $lumise;
		
		$time = time();
		$this->valid_upload_designs();
		
		$designs = $lumise->lib->dejson($_POST['designs']);
		
		if (count(array_keys((Array)$designs)) === 0) {
			echo 'Error: no designs uploaded';
			exit;
		}
		
		foreach ($designs as $id => $design) {
			if (!isset($_FILES[$id])) {
				echo 'Error: failed on uploading designs';
				exit;
			}
		}
		
		$path = $lumise->cfg->upload_path;
		$dpath = 'templates'.DS.date('Y', $time).DS.date('m', $time).DS;
		$durl = $lumise->cfg->upload_url.'templates/'.date('Y', $time).'/'.date('m', $time).'/';
		
		$uid = (string)get_current_user_id();
		$lumise->set_vendor($uid);
		
		/*
		*	@ move design file & design thumbnail to upload folder
		*/
		
		foreach ($designs as $id => $design){
			
			$check = $lumise->db->rawQuery("SELECT `id` FROM {$lumise->db->prefix}templates WHERE `name`='{$id}' AND `author`={$uid}");
			
			if (filesize($_FILES[$id]['tmp_name']) === 0) {
				echo 'Error while upload design file';
				exit;
			}
				
			if (count($check) > 0) {
				$designs->{$id}->db_id = $check[0]['id'];
				continue;
			}
			
			if (
				move_uploaded_file($_FILES[$id]['tmp_name'], $path.$dpath.$design->file) &&
				move_uploaded_file($_FILES[$id.'-thumbnail']['tmp_name'], $path.$dpath.$design->thumbnail)
			) {
				
				/*
				*	@ create template
				*/
				$designs->{$id}->db_id = $lumise->lib->add_row( array(
					'name' => $id,
					'price' => 0,
					'screenshot' => $durl.$design->thumbnail,
					'upload' => $dpath.$design->file,
					'featured' => 0,
					'active' => 1,
					'tags' => '',
					'order' => 0,
					'updated' => date("Y-m-d").' '.date("H:i:s"),
					'created' => date("Y-m-d").' '.date("H:i:s")
				), 'templates' );
				
			}
			
		}
		
		return $designs;
		
	}
	
	private function create_products($designs = array()) {
		
		global $lumise;
		
		require_once('wp-admin/includes/image.php');
		require_once('wp-admin/includes/file.php');
		require_once('wp-admin/includes/media.php');
		
		$products = $lumise->lib->dejson($_POST['products']);
		$user_id = get_current_user_id();
		$time = time();
		$first_product = 0;
		$dpath = 'templates'.DS.date('Y', $time).DS.date('m', $time).DS;
		
        if ( dokan_is_seller_trusted( $user_id ) ) {
            $status = get_post_status_object('publish') ? 'publish' : 'draft';
        } else {
            $status = dokan_get_option( 'product_status', 'dokan_selling', 'pending' );
            $status = get_post_status_object( $status ) ? $status : 'draft';
        }
		
		if (!is_array($products) || count($products) === 0) {
			echo 'Error: no product base found';
			exit;
		}
		
		foreach ($products as $i => $product) {
			
			$objProduct = new WC_Product();
			$objProduct->set_name($product->name);
			$objProduct->set_status($status);
			$objProduct->set_catalog_visibility('visible');
			$objProduct->set_description($product->description);
			$objProduct->set_price($product->price+$product->design_price);
			$objProduct->set_regular_price($product->price+$product->design_price);
			
			/*$objProduct->set_manage_stock(true); // true or false
			$objProduct->set_stock_quantity(10);
			$objProduct->set_stock_status('instock');
			$objProduct->set_backorders('no');
			$objProduct->set_reviews_allowed(true);
			$objProduct->set_sold_individually(false);
			$objProduct->set_category_ids(array(1,2,3));*/
			
			$media_ids = array();
			/*
			*	@ move screenshots to product images
			*/
			foreach ($product->designs as $s => $design) {
				
				if (
					!isset($design->id) ||
					!isset($designs->{$design->id}) ||
					!isset($design->screenshot) || 
					!isset($_FILES[str_replace('.', '_', $design->screenshot)])
				) continue;
					
				$media_id = media_handle_sideload(
					$_FILES[str_replace('.', '_', $design->screenshot)], 0, null
				);
				
				if ($media_id) {
					array_push($media_ids, $media_id);
				}
				
				/*
				*	@ update id of design template & thumbnail
				*/
				
				$product->designs->{$s}->screenshot = $dpath.$designs->{$design->id}->thumbnail;
				$product->designs->{$s}->id = $designs->{$design->id}->db_id;
				
			}
			/*
			*	@ Create product gallery incase has more than 1 screenshot
			*/
			if (count($media_ids) > 0) {
				
				$objProduct->set_image_id($media_ids[0]);
				
				if (count($media_ids) > 1){
					$objProduct->set_gallery_image_ids($media_ids);
				}
				
			}
			/*
			*	@ Create new product
			*/
			$products[$i]->product_id = $objProduct->save();
			/*
			*	@ Add Lumise design data to product
			*/
			update_post_meta($products[$i]->product_id, 'lumise_product_base', $product->id);
			update_post_meta($products[$i]->product_id, 'lumise_customize', 'no');
			update_post_meta($products[$i]->product_id, 'lumise_disable_add_cart', 'no');
			update_post_meta($products[$i]->product_id, 'lumise_design_template', urlencode(json_encode($product->designs)));
			
			if ($first_product === 0) {
				$first_product = $products[$i]->product_id;
			}
			
		}
		
		return $first_product;
		
	}
		
	public function ajax_init() {
		
		global $lumise;
		
		header("content-type: application/json");
		
		$products = $lumise->lib->get_products(array(
					's' => '',
					'category' => '',
					'limit' => 100,
					'index' => 0,
					'no_cms_filter' => true
				));
		
		foreach ($products['products'] as $i => $product) {
			
			$products['products'][$i]['details'] = array(
				"price" => 0,
				"name" => $product['name'],
				"description" => $product['description']
			);
			
			if (
				isset($product['product']) && 
				!empty($product['product']) && 
				$product['product'] !== 0
			) {
				$products['products'][$i]['cms_product'] = $this->cms_product($product['product']);
			}
			
			$products['products'][$i]['categories'] = $lumise->db->rawQuery("SELECT `category_id` FROM `{$lumise->db->prefix}categories_reference` WHERE `item_id`=".$product['id']);
			if (count($products['products'][$i]['categories']) > 0) {
				foreach ($products['products'][$i]['categories'] as $j => $cat) {
					if (isset($cat['category_id']))
						$products['products'][$i]['categories'][$j] = $cat['category_id'];
				}
				$products['products'][$i]['categories'] = implode(',', $products['products'][$i]['categories']);
			} else $products['products'][$i]['categories'] = "";
		}
		
		echo json_encode(array(
			"cfg" => $this->cfg,
			"data" => array(
				"profit_percent" => 10,
				"currency" => $lumise->cfg->settings['currency'],
				"thousand_separator" => isset(
						$lumise->cfg->settings['thousand_separator']
					) ? $lumise->cfg->settings['thousand_separator'] : ',',
				"decimal_separator" => isset(
						$lumise->cfg->settings['decimal_separator']
					)? $lumise->cfg->settings['decimal_separator'] : '.',
				"number_decimals" => isset(
						$lumise->cfg->settings['number_decimals']
					) ? $lumise->cfg->settings['number_decimals'] : 2,
				"currency_position" => $lumise->cfg->settings['currency_position'],
				"products" => $products,
				"cms_products" => array(),
				"selected_products" => array(),
				"selected_products" => array(),
				"selected_product" => 0,
				"type" => "sell",			
				"size_default" => array(
					'A0' => array(
						'cm' => '84.1 x 118.9',
						'in' => '33.1 x 46.8',
						'px' => '9933 x 14043'
					),
					'A1' => array(
						'cm' => '59.4 x 84.1',
						'in' => '23.4 x 33.1',
						'px' => '7016 x 9933'
					),
					'A2' => array(
						'cm' => '42 x 59.4',
						'in' => '16.5 x 23.4',
						'px' => '4960 x 7016'
					),
					'A3' => array(
						'cm' => '29.7 x 42',
						'in' => '11.7 x 16.5',
						'px' => '3508 x 4960'
					),
					'A4' => array(
						'cm' => '21 x 29.7',
						'in' => '8.3 x 11.7',
						'px' => '2480 x 3508'
					),
					'A5' => array(
						'cm' => '14.8 x 21.0',
						'in' => '5.8 x 8.3',
						'px' => '1748 x 2480'
					),
					'A6' => array(
						'cm' => '10.5 x 14.8',
						'in' => '4.1 x 5.8',
						'px' => '1240 x 1748'
					),
					'A7' => array(
						'cm' => '7.4 x 10.5',
						'in' => '2.9 x 4.1',
						'px' => '874 x 1240'
					),
					'A8' => array(
						'cm' => '5.2 x 7.4',
						'in' => '2 x 2.9',
						'px' => '614 x 874'
					),
					'A9' => array(
						'cm' => '3.7 x 5.2',
						'in' => '1.5 x 2',
						'px' => '437 x 614'
					),
					'A10' => array(
						'cm' => '2.6 x 3.7',
						'in' => '1 x 1.5',
						'px' => '307 x 437'
					)
				),
				"min_ppi" => 100,
				"max_ppi" => 300,
				"campaign" =>  array(
					"title" => "", 
					"desc" => "", 
					"slug" => "", 
					"selling" => 1
				)
			),
			"lang" => array(
			    'continue' => $lumise->lang('Continue'),
			    'back' => $lumise->lang('Back'),
			    'close' => $lumise->lang('Close'),
			    '1' => $lumise->lang('Choose products'),
				'2' => $lumise->lang('Upload Designs'),
				'3' => $lumise->lang('Publish'),
				'4' => $lumise->lang('You have choosed %s of max 10 products'),
				'5' => $lumise->lang('Continue'),
				'6' => $lumise->lang('Error, you can not add more than 10 products'),
				'7' => $lumise->lang('Starting from'),
				'8' => $lumise->lang('Back'),
				'9' => $lumise->lang('Price'),
				'10' => $lumise->lang('Profit'),
				'11' => $lumise->lang('Are you sure that you want to delete this product from your list?'),
				'12' => $lumise->lang('Product options'),
				'13' => $lumise->lang('Design'),
				'14' => $lumise->lang('Preview'),
				'15' => $lumise->lang('Pricing'),
				'16' => $lumise->lang('Select colors'),
				'17' => $lumise->lang('Upload Design'),
				'18' => $lumise->lang('Center alignment'),
				'19' => $lumise->lang('Bottom alignment'),
				'20' => $lumise->lang('Top alignment'),
				'21' => $lumise->lang('Left alignment'),
				'22' => $lumise->lang('Right alignment'),
				'23' => $lumise->lang('File type .PNG & minimum'),
				'24' => $lumise->lang('Product details'),
				'25' => $lumise->lang('Campaign details'),
				'26' => $lumise->lang('Title'),
				'27' => $lumise->lang('Description'),
				'28' => $lumise->lang('Custom link'),
				'29' => $lumise->lang('Error: The resolution of your design image is too low'),
				'30' => $lumise->lang('Preparing to upload...'),
				'31' => $lumise->lang('Max 1000 characters'),
				'32' => $lumise->lang('upload complete'),
				'33' => $lumise->lang('Upload completed, data is being processed..'),
				'34' => $lumise->lang('Details'),
				'35' => $lumise->lang('Actions'),
				'36' => $lumise->lang('Congratulation!'),
				'37' => $lumise->lang('Your designs have been uploaded successfully'),
				'38' => $lumise->lang('Enable selling your designs?'),
				'39' => $lumise->lang('Uncheck this if you only want to buy your design'),
				'40' => $lumise->lang('Order it now!'),
				'41' => $lumise->lang('Upload new design'),
				'42' => $lumise->lang('View the product'),
				'43' => $lumise->lang('Go to dashboard'),
				'44' => $lumise->lang('Upload failed!'),
				'45' => $lumise->lang('An error occurred during upload your designs'),
				'46' => $lumise->lang('Try again'),
				'47' => $lumise->lang('Which do you want?'),
				'48' => $lumise->lang('Sell my designs'),
				'49' => $lumise->lang('Print my designs'),
				'50' => $lumise->lang('Order'),
				'51' => $lumise->lang('Order your designs to print'),
				
				'138'=> $lumise->lang('Apply Now'),
				'139'=> $lumise->lang('Colors Manage'),
				'140'=> $lumise->lang('Add to list'),
				'141'=> $lumise->lang('Select all'),
				'142'=> $lumise->lang('Unselect all'),
				'143'=> $lumise->lang('List of your colors'),
				'144'=> $lumise->lang('No item found, please add new color to your list'),
				'145'=> $lumise->lang('Add new color'),
				'146'=> $lumise->lang('Delete selection'),
				'147'=> $lumise->lang('No items found'),
				'148'=> $lumise->lang('Campaign drafts'),
				'149' => $lumise->lang('Error: The resolution of your design image is too large'),
				'150' => $lumise->lang('Are you sure that you want to delete this draft?'),
				'151' => $lumise->lang('Updated at'),
				'152' => $lumise->lang('Enter the draft label'),
				'153' => $lumise->lang('Start New'),
				'154' => $lumise->lang('Design Drafts'),
				'155' => $lumise->lang('Pricing & Details'),
				'156' => $lumise->lang('Recent designs'),
				'157' => $lumise->lang('Clear design'),
				'158' => $lumise->lang('Name'),
				'159' => $lumise->lang('Description')
		    )
		));
	}
	
	public function ajax_campaign_custom_link() {
		
		global $wpdb;
		
		$slug = sanitize_title($_POST['slug']);
		
		if (strlen($slug)<5) {
			echo '0';
		} else {
			if ($wpdb->get_row("SELECT post_name FROM {$wpdb->prefix}posts WHERE post_name = '".$slug."'", 'ARRAY_A'))
				echo '0';
			else echo $slug;
		}
		
		exit;
		
	}
	
	public function ajax_publish() {
		
		if (!current_user_can( 'dokan_add_product' )) {
			echo 'Error: You don\'t have permission to publish designs';
			exit;
		}
		
		global $lumise;
		
		$designs = $this->upload_designs();
		
		$product_id = $this->create_products($designs);
		
		header("content-type: application/json");
		echo json_encode(array(
			"success" => true,
			"link" => get_permalink($product_id)
		));
		exit;
		
	}
	
}

global $launcher;
$launcher = new lumise_launcher();