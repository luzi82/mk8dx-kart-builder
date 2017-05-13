DATA = null;
PART_STAT_DICT = null;
PART_GROUP_DICT_DICT = null;

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
function init_PART_GROUP_DICT_DICT(){
	PART_GROUP_DICT_DICT={};
	for(var type_id in DATA['part_group_dict']){
		var part_group_list = DATA['part_group_dict'][type_id];
		PART_GROUP_DICT_DICT[type_id]={};
		for(var part_group_idx in part_group_list){
			var part_group = part_group_list[part_group_idx];
			PART_GROUP_DICT_DICT[type_id][part_group['id']] = part_group;
		}
	}
}

function getCondition(){
	var stat = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		stat[stat_type["id"]] = {};
		if(stat_type['type']=='v100'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=25){
				var key = "stat_"+stat_type["id"]+"_"+i;
				var value = $('#'+key+'_box').is(":checked");
				stat[stat_type["id"]][i] = value;
			}
		}
		if(stat_type['type']=='bool'){
			BOOL_LIST.forEach(function(boool){
				var key = "stat_"+stat_type["id"]+"_"+boool['id'];
				var value = $('#'+key+'_box').is(":checked");
				stat[stat_type["id"]][boool['value']] = value;
			});
		}
	});
	
	var part_dict = {};
	DATA["part_type_list"].forEach(function(part_type){
		part_dict[part_type["id"]] = {};
		DATA["part_dict"][part_type["id"]].forEach(function(part){
			var key = part_type["id"]+"_"+part["id"];
			var value = $('#'+key+'_box').is(":checked");
			part_dict[part_type["id"]][part["id"]] = value;
		});
	});

	return {
		'stat':stat,
		'part':part_dict,
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
	
	var part_dict = {};
	DATA["part_type_list"].forEach(function(part_type){
		part_dict[part_type["id"]] = {};
		DATA["part_dict"][part_type["id"]].forEach(function(part){
			part_dict[part_type["id"]][part["id"]] = false;
		});
	});

	return {
		'stat':stat,
		'part':part_dict,
	};
}

function searchSolution(condition){
	var kart_group_list = [];
	var kart_count = 0;
	var condition0 = getDummyCondition();
	
	// detect group
	var part_group_dict_dict = {};
	for(var part_type_id in condition['part']){
		var part_group_dict = {};
		part_group_dict_dict[part_type_id] = part_group_dict;
		var part_dict = condition['part'][part_type_id];
		for(var part_id in part_dict){
			if(!part_dict[part_id])continue;
			var group_id = PART_STAT_DICT[part_id]['group'];
			if(!(group_id in part_group_dict)){
				part_group_dict[group_id] = JSON.parse(JSON.stringify(PART_GROUP_DICT_DICT[part_type_id][group_id]));
				part_group_dict[group_id]['member_list'] = [];
			}
			part_group_dict[group_id]['member_list'].push(PART_STAT_DICT[part_id]);
		}
	}

	for(var char_part_group_id   in part_group_dict_dict['char'])  {var char_part_group   = part_group_dict_dict['char'  ][char_part_group_id];
	for(var body_part_group_id   in part_group_dict_dict['body'])  {var body_part_group   = part_group_dict_dict['body'  ][body_part_group_id];
	for(var tire_part_group_id   in part_group_dict_dict['tire'])  {var tire_part_group   = part_group_dict_dict['tire'  ][tire_part_group_id];
	for(var glider_part_group_id in part_group_dict_dict['glider']){var glider_part_group = part_group_dict_dict['glider'][glider_part_group_id];
		var good = true;
		stat = {};
		DATA['stat_type_list'].forEach(function(stat_type){
			var stat_id = stat_type['id'];
			var value = 0;
			value += char_part_group[stat_id];
			value += body_part_group[stat_id];
			value += tire_part_group[stat_id];
			value += glider_part_group[stat_id];
			stat[stat_id] = value;
			good = good && condition['stat'][stat_id][value];
		});
		if(!good)continue;
		
		var k_count = 1;
		k_count *= char_part_group['member_list'].length;
		k_count *= body_part_group['member_list'].length;
		k_count *= tire_part_group['member_list'].length;
		k_count *= glider_part_group['member_list'].length;
		kart_count += k_count;

		kart_group_list.push({
			'char':char_part_group,
			'body':body_part_group,
			'tire':tire_part_group,
			'glider':glider_part_group,
			'stat':stat,
		});

		for(var stat_id in stat){
			condition0['stat'][stat_id][stat[stat_id]] = true;
		}
		for(var part_id_idx in char_part_group['member_list']){
			var part_id = char_part_group['member_list'][part_id_idx]['id'];
			condition0['part']['char'][part_id] = true;
		}
		for(var part_id_idx in body_part_group['member_list']){
			var part_id = body_part_group['member_list'][part_id_idx]['id'];
			condition0['part']['body'][part_id] = true;
		}
		for(var part_id_idx in tire_part_group['member_list']){
			var part_id = tire_part_group['member_list'][part_id_idx]['id'];
			condition0['part']['tire'][part_id] = true;
		}
		for(var part_id_idx in glider_part_group['member_list']){
			var part_id = glider_part_group['member_list'][part_id_idx]['id'];
			condition0['part']['glider'][part_id] = true;
		}
	}}}}
	
	return {
		"kart_group_list":kart_group_list,
		"condition":condition0,
		"kart_count":kart_count,
	};
}

function set_all(key,value){
	$('.'+key).prop('checked',value);
	updateAll();
}

function box_click(){
	updateAll();
}

function updateAll(){
	var condition = getCondition();
	var stat_filter = calc_stat_filter(condition);
	draw_stat_filter(stat_filter);
	var part_filter = calc_part_filter(condition);
	draw_part_filter(part_filter);
	update_search();
}

function update_search(){
	$("#search_result").empty();
	var condition = getCondition();
	console.log(condition);
	solution = searchSolution(condition);
	console.log(solution);
	kart_list_length = solution['kart_count'];
	if(kart_list_length < 100){
		$("#search_count").text("Count: "+kart_list_length);
		for(var kart_group_idx in solution['kart_group_list']){var kart_group = solution['kart_group_list'][kart_group_idx];
			for(var char_part_id   in kart_group['char'  ]['member_list']){var char_part   = kart_group['char'  ]['member_list'][char_part_id];
			for(var body_part_id   in kart_group['body'  ]['member_list']){var body_part   = kart_group['body'  ]['member_list'][body_part_id];
			for(var tire_part_id   in kart_group['tire'  ]['member_list']){var tire_part   = kart_group['tire'  ]['member_list'][tire_part_id];
			for(var glider_part_id in kart_group['glider']['member_list']){var glider_part = kart_group['glider']['member_list'][glider_part_id];
				var kart_html = "<td>"+char_part["name"]+"</td><td>"+body_part["name"]+"</td><td>"+tire_part["name"]+"</td><td>"+glider_part["name"]+"</td>";
				var stat_html = "";
				DATA["stat_type_list"].forEach(function(stat_type){
					var stat_id = stat_type['id'];
					stat_html += "<td>"+kart_group["stat"][stat_id]+"</td>";
				});
				$("#search_result").append("<tr>"+kart_html+stat_html+"</tr>");
			}}}}
		}
	}else{
		$("#search_count").text("Count: "+kart_list_length+" > 100, not show");
	}
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

function calc_part_filter(condition){
	ret = {};
	for(var part_type_id in condition['part']){
		var condition0 = JSON.parse(JSON.stringify(condition));
		var part_dict = condition0['part'][part_type_id];
		for(var part_id in part_dict){
			part_dict[part_id] = true;
		}
		var solution = searchSolution(condition0);
		ret[part_type_id] = solution['condition']['part'][part_type_id];
	};
	return ret;
}

function draw_part_filter(part_filter){
	console.log(part_filter);
	for(var part_type_id in part_filter){
		var part_dict = part_filter[part_type_id];
		for(var part_id in part_dict){
			var key = part_type_id+"_"+part_id;
			var value = part_dict[part_id];
			$("#"+key+"_bg").css("background-color",value?"green":"red");
		}
	}
}

$.getJSON('data.json',function(output){
	DATA=output;
	init_PART_STAT_DICT();
	init_PART_GROUP_DICT_DICT();
	set_all("box",true);
});
