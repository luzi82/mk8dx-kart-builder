DATA = null;
PART_STAT_DICT = null;

BOOL_LIST = [
	{'id':'b0','value':0},
	{'id':'b1','value':1},
];

function init_PART_STAT_DICT(){
	PART_STAT_DICT={};
	DATA["stat_list"].forEach(function(stat){
		PART_STAT_DICT[stat['id']] = stat;
	});
}

function getCondition(){
	stat = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		stat[stat_type["id"]] = {};
		if(stat_type['type']=='v100'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=25){
				key = "stat_"+stat_type["id"]+"_"+i;
				value = $('#'+key+'_box').is(":checked");
				stat[stat_type["id"]][i] = value;
			}
		}
		if(stat_type['type']=='bool'){
			BOOL_LIST.forEach(function(boool){
				key = "stat_"+stat_type["id"]+"_"+boool['id'];
				value = $('#'+key+'_box').is(":checked");
				stat[stat_type["id"]][boool['value']] = value;
			});
		}
	});
	
	filter = {};
	DATA["part_type_list"].forEach(function(part_type){
		filter[part_type["id"]] = {};
		DATA["part_dict"][part_type["id"]].forEach(function(part){
			key = part_type["id"]+"_"+part["id"];
			value = $('#'+key+'_box').is(":checked");
			filter[part_type["id"]][part["id"]] = value;
		});
	});
	
	return {
		'stat':stat,
		'filter':filter,
	};
}

function getDummyCondition(){
	stat = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		stat[stat_type["id"]] = {};
		if(stat_type['type']=='v100'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=25){
				stat[stat_type["id"]][i] = false;
			}
		}
		if(stat_type['type']=='bool'){
			BOOL_LIST.forEach(function(boool){
				stat[stat_type["id"]][boool['value']] = false;
			});
		}
	});
	
	filter = {};
	DATA["part_type_list"].forEach(function(part_type){
		filter[part_type["id"]] = {};
		DATA["part_dict"][part_type["id"]].forEach(function(part){
			filter[part_type["id"]][part["id"]] = false;
		});
	});
	
	return {
		'stat':stat,
		'filter':filter,
	};
}

function searchSolution(condition){
	kart_list = [];
	condition0 = getDummyCondition();
	
	DATA['part_dict']['char'].forEach(function(char_part){
	if(!condition['filter']['char'][char_part['id']])return;
	DATA['part_dict']['body'].forEach(function(body_part){
	if(!condition['filter']['body'][body_part['id']])return;
	if(!condition['stat']['isd'][body_part['isd']])return; // speed hack
	DATA['part_dict']['tire'].forEach(function(tire_part){
	if(!condition['filter']['tire'][tire_part['id']])return;
	DATA['part_dict']['glider'].forEach(function(glider_part){
	if(!condition['filter']['glider'][glider_part['id']])return;
		var good = true;
		stat = {};
		DATA['stat_type_list'].forEach(function(stat_type){
			var stat_id = stat_type['id'];
			var value = 0;
			value += char_part[stat_id];
			value += body_part[stat_id];
			value += tire_part[stat_id];
			value += glider_part[stat_id];
			stat[stat_id] = value;
			good = good && condition['stat'][stat_id][value];
		});
		if(!good)return;

		kart_list.push({
			'char':char_part,
			'body':body_part,
			'tire':tire_part,
			'glider':glider_part,
			'stat':stat,
		});
		for(var stat_id in stat){
			condition0['stat'][stat_id][stat[stat_id]] = true;
		}
		condition['filter']['char'][char_part['id']] = true;
		condition['filter']['body'][body_part['id']] = true;
		condition['filter']['tire'][tire_part['id']] = true;
		condition['filter']['glider'][glider_part['id']] = true;
	});
	});
	});
	});
	
	return {
		"kart_list":kart_list,
		"condition":condition0,
	};
}

function set_all(key,value){
	$('.'+key).prop('checked',value);
}

function box_click(){
}

function updateAll(){
	condition = getCondition();
	// console.log(condition);
	solution = searchSolution(condition);
	console.log(solution);
	console.log("updateAll done");
}

function search_click(){
	$("#search_result").empty();
	var condition = getCondition();
	console.log(condition);
	solution = searchSolution(condition);
	console.log(solution);
	kart_list_length = solution['kart_list'].length;
	if(kart_list_length < 100){
		$("#search_count").text("Count: "+kart_list_length);
		solution['kart_list'].forEach(function(kart){
			var kart_html = "<td>"+kart["char"]["name"]+"</td><td>"+kart["body"]["name"]+"</td><td>"+kart["tire"]["name"]+"</td><td>"+kart["glider"]["name"]+"</td>";
			var stat_html = "";
			DATA["stat_type_list"].forEach(function(stat_type){
				var stat_id = stat_type['id'];
				stat_html += "<td>"+kart["stat"][stat_id]+"</td>";
			});
			$("#search_result").append("<tr>"+kart_html+stat_html+"</tr>");
		});
	}else{
		$("#search_count").text("Count: "+kart_list_length+" > 100, not show");
	}
}

function filter_click(){
	var condition = getCondition();
	var stat_filter = calc_stat_filter(condition);
	draw_stat_filter(stat_filter);
}

function calc_stat_filter(condition){
	ret = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		var stat_id = stat_type["id"];
		var condition0 = JSON.parse(JSON.stringify(condition));
		for(var value in condition0['stat'][stat_id]){
			condition0['stat'][stat_id][value] = true;
		}
		var solution = searchSolution(condition0);
		ret[stat_id] = solution['condition']['stat'][stat_id];
	});
	console.log(ret);
	return ret;
}

function draw_stat_filter(stat_filter){
	DATA["stat_type_list"].forEach(function(stat_type){
		var stat_id = stat_type["id"];
		if(stat_type['type']=='v100'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=25){
				key = "stat_"+stat_type["id"]+"_"+i;
				$("#"+key+"_bg").css("background-color",stat_filter[stat_id][i]?"green":"red");
			}
		}
		if(stat_type['type']=='bool'){
			BOOL_LIST.forEach(function(boool){
				key = "stat_"+stat_type["id"]+"_"+boool['id'];
				$("#"+key+"_bg").css("background-color",stat_filter[stat_id][boool['value']]?"green":"red");
			});
		}
	});
}

$.getJSON('data.json',function(output){
	DATA=output;
	init_PART_STAT_DICT();
	set_all("box",true);
});
