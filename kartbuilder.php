<?php
$DATA = file_get_contents("data.json");
$DATA = json_decode($DATA, true);

$BOOL_LIST = [
	['id'=>"b0",'name'=>'OFF','value'=>0],
	['id'=>"b1",'name'=>'ON', 'value'=>1],
];
?>
<html>
<head>
</head>
<body>
<h2>Stat</h2>
<table>
<tr>
<th></th>
<?php
for($i=$DATA["stat_min"];$i<=$DATA["stat_max"];$i+=25){
	print("<th>".$i."</th>\n");
}
?>
</tr>
<?php
foreach($DATA["stat_type_list"] as $stat_type){
	print("<tr>\n");
	if($stat_type["type"]=="v100"){
		print("<th>".$stat_type["name"]."</th>\n");
		for($i=$DATA["stat_min"];$i<=$DATA["stat_max"];$i+=25){
			$key = "stat_".$stat_type["id"]."_".$i;
			print("<td id='".$key."_bg'><input class='box' onclick='box_click()' type='checkbox' id='".$key."_box'/></td>\n");
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
	print("<button onclick='set_all(\"".$part_type["id"]."_box\",true)'>All</button>\n");
	print("<button onclick='set_all(\"".$part_type["id"]."_box\",false)'>None</button>\n");
	print("<table>\n");
	foreach($DATA["part_dict"][$part_type["id"]] as $part){
		$key = $part_type["id"]."_".$part["id"];
		print("<tr><th>".$part["name"]."</th><td id='".$key."_bg'><input class='box ".$part_type["id"]."_box' onclick='box_click()' type='checkbox' id='".$key."_box'/></td></tr>\n");
	}
	print("</table>\n");
}

?>

<button onclick="search_click()">Search</button>
<button onclick="filter_click()">Update all filter</button>

<h2>Search result</h2>
<div id="search_count"></div>
<table id="search_result">
</table>

<script src="jquery-3.2.1.min.js"></script>
<script src="kartbuilder.js"></script>

</body>
</html>
