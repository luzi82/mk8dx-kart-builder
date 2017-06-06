<?php
$DATA = file_get_contents("data.json");
$DATA = json_decode($DATA, true);

$BOOL_LIST = array(
	array('id'=>"b0",'name'=>'OFF','value'=>0),
	array('id'=>"b1",'name'=>'ON', 'value'=>1),
);
?>
<html>
<head>
<title>Mario Kart 8 Kart builder</title>
</head>
<body>
<p>Data based on <a href="http://amzn.asia/g64LQEj">"マリオカート8 デラックス パーフェクトガイド超∞"</a>.  <a href="stat.csv">Here</a> is my data copy for calculation.  <a href="https://github.com/luzi82/mk8dx-kart-builder">Github link</a></p>
<h2>Stat</h2>
<button onclick='click_set_all("stat_box",true)'>All</button>
<table>
<tr>
<th></th>
<?php
for($i=$DATA["stat_min"];$i<=$DATA["stat_max"];$i+=1){
	print("<th>".$i."</th>\n");
}
?>
</tr>
<?php
foreach($DATA["stat_type_list"] as $stat_type){
	print("<tr>\n");
	if($stat_type["type"]=="int"){
		print("<th>".$stat_type["name"]."</th>\n");
		for($i=$DATA["stat_min"];$i<=$DATA["stat_max"];$i+=1){
			$key = "stat_".$stat_type["id"]."_".$i;
			
			print("<td id='".$key."_bg'>\n");
			print("<input class='box stat_box' onclick='box_click()' type='checkbox' id='".$key."_box'/>\n");
			print("<span style='cursor:pointer' onclick='stat_arrow_click(\"".$stat_type["id"]."\",".$i.")'>&#9664;</span>\n");
			print("</td>\n");
		}
		print("</tr>\n");
	}
}
?>
<tr>
<th></th>
<?php
foreach($BOOL_LIST as $bool){
	print("<th>".$bool["name"]."</th>\n");
}
?>
</tr>
<?php
foreach($DATA["stat_type_list"] as $stat_type){
	if($stat_type["type"]=="bool"){
		print("<tr>\n");
		print("<th>".$stat_type["name"]."</th>\n");
		foreach($BOOL_LIST as $bool){
			$key = "stat_".$stat_type["id"]."_".$bool['id'];
			print("<td id='".$key."_bg'><input class='box' onclick='box_click()' type='checkbox' id='".$key."_box'/></td>\n");
		}
		print("</tr>\n");
	}
}
?>
</table>


<?php
foreach($DATA["part_type_list"] as $part_type){
	print("<h2>".$part_type["name"]."</h2>\n");
	print("<button onclick='click_set_all(\"".$part_type["id"]."_box\",true)'>All</button>\n");
	print("<button onclick='click_set_all(\"".$part_type["id"]."_box\",false)'>None</button>\n");
	print("<table>\n");
	foreach($DATA["part_dict"][$part_type["id"]] as $part){
		$key = $part_type["id"]."_".$part["id"];
		print("<tr><th>".$part["name"]."</th><td id='".$key."_bg'><input class='box ".$part_type["id"]."_box' onclick='box_click()' type='checkbox' id='".$key."_box'/></td></tr>\n");
	}
	print("</table>\n");
}

?>

<h2>Search result</h2>
<div id="search_count"></div>
<table id="search_result">
</table>

<p>Version: <span id="ver_version"></span>, Build: <span id="ver_build"></span></p>

<script src="jquery-3.2.1.min.js"></script>
<script src="kartbuilder.js"></script>

</body>
</html>
