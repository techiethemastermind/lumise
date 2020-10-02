<?php
/**
*
*	(c) copyright:	Lumise
*	(i) website:	Lumise.com
*
*/

$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';

if(empty($referer)) {
	header('HTTP/1.0 403 Forbidden');
	exit;
}

$api = json_decode(urldecode(base64_decode($_GET['api'])));

$api->actv = explode(',', $api->actv);

$sources = array();

if (isset($_GET['ss']) && $_GET['ss'] == 'picture') {
	
	foreach ($api->actv as $a) {
		if ($a == 'pi' && isset($api->pi) && !empty($api->pi))
			array_push($sources, '<li data-source="pixabay">Pixabay</li>');
	
		if ($a == 'un' && isset($api->un) && !empty($api->un))
			array_push($sources, '<li data-source="unsplash">Unsplash</li>');
			
		if ($a == 'op' && isset($api->op) && !empty($api->op))
			array_push($sources, '<li data-source="openclipart">Openclipart</li>');
	}
}else if (isset($_GET['ss']) && $_GET['ss'] == 'social') {
	foreach ($api->actv as $a) {
		if ($a == 'fb' && isset($api->fb) && !empty($api->fb))
			array_push($sources, '<li data-source="facebook">Facebook</li>');
			
		if ($a == 'in' && isset($api->in) && !empty($api->in))
			array_push($sources, '<li data-source="instagram">Instagram</li>');
	}
}



?><!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="utf-8">
      <title>Lumise Services</title>
      <link href="assets/css/external.css?r=2.4" media="all" rel="stylesheet" />
      <?php if (isset($_GET['instagram_callback'])) { ?>
      <script type="text/javascript">if (window.location.hash.indexOf('access_token=') > -1) {localStorage.setItem('instat', window.location.hash.split('access_token=').pop());}else{alert('There was an error, we could not get your access_token.');}window.opener.window.postMessage({action: 'reload'}, "*");window.close();</script>
   </head>
   <body class="lumise-images">
      <p>Reloading...</p>
   </body>
</html>
<?php exit; } ?></head>
<body class="lumise-images">
	<?php
		if (count($sources) === 0) {
			echo '<p class="empty">You have not configured any online resource</p>';
		} else {
	?>
   <div id="lumise-images">
      <header id="lumise-header">
         <div class="input-wrp">
            <input type="search" id="search-input" placeholder="Search.." />
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 56.966 56.966" xml:space="preserve">
               <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"/>
            </svg>
            <div class="sources-wrp">
               <span>
                  <label></label>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 284.929 284.929" xml:space="preserve">
                     <path d="M282.082,76.511l-14.274-14.273c-1.902-1.906-4.093-2.856-6.57-2.856c-2.471,0-4.661,0.95-6.563,2.856L142.466,174.441   L30.262,62.241c-1.903-1.906-4.093-2.856-6.567-2.856c-2.475,0-4.665,0.95-6.567,2.856L2.856,76.515C0.95,78.417,0,80.607,0,83.082   c0,2.473,0.953,4.663,2.856,6.565l133.043,133.046c1.902,1.903,4.093,2.854,6.567,2.854s4.661-0.951,6.562-2.854L282.082,89.647   c1.902-1.903,2.847-4.093,2.847-6.565C284.929,80.607,283.984,78.417,282.082,76.511z"/>
                  </svg>
               </span>
               <ul id="search-sources"><?php echo implode('', $sources); ?></ul>
            </div>
         </div>
      </header>
      <div id="lumise-images-manager"></div>
   </div>
   <script type="text/javascript">
	   var api_cfg = "<?php echo $_GET['api']; ?>";
   </script>
   <script type="text/javascript" src="assets/js/external_vendors.js?r=2"></script>
   <script type="text/javascript" src="assets/js/external.js?r=2.3"></script>
   <?php } ?>
</body>
</html>