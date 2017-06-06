var DATA = null;
var PART_STAT_DICT = null;
var PART_GROUP_DICT_DICT = null;
var STATTYPE_OBJ_DICT = null;

var BOOL_LIST = [
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
function init_STATTYPE_OBJ_DICT(){
	STATTYPE_OBJ_DICT={};
	for(var stattype_idx in DATA['stat_type_list']){
		var stattype_obj = DATA['stat_type_list'][stattype_idx];
		STATTYPE_OBJ_DICT[stattype_obj['id']] = stattype_obj;
	}
}

function getCondition(){
	var stat = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		stat[stat_type["id"]] = {};
		if(stat_type['type']=='int'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=1){
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
		if(stat_type['type']=='int'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=1){
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

function searchSolution(condition,filter_stat_id=null,filter_part_id=null){
	var kart_group_list = [];
	var kart_count = 0;
	var condition0 = getDummyCondition();
	var condition1 = clone(condition);
	
	// detect group
	var part_group_dict_dict = {}; // part-id, group-id
	for(var part_type_id in condition1['part']){
		var part_group_dict = {};
		part_group_dict_dict[part_type_id] = part_group_dict;
		var part_dict = condition1['part'][part_type_id];
		for(var part_id in part_dict){
			if(!part_dict[part_id])continue;
			var group_id = PART_STAT_DICT[part_id]['group'];
			if(!(group_id in part_group_dict)){
				part_group_dict[group_id] = clone(PART_GROUP_DICT_DICT[part_type_id][group_id]);
				part_group_dict[group_id]['member_list'] = [];
				part_group_dict[group_id]['ignore'] = false;
			}
			part_group_dict[group_id]['member_list'].push(PART_STAT_DICT[part_id]);
		}
	}
	
	// scan layer range
	var layer_stat_dict_dict_dict = {}; // part-id, stattype-id, min/max
	for(var part_idx in DATA["part_type_list"]){
		var part_id = DATA["part_type_list"][part_idx]['id'];
		layer_stat_dict_dict_dict[part_id] = {};
		for(var stattype_idx in DATA["stat_type_list"]){
			var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
			var layer_stat_dict = layer_stat_dict_dict_dict[part_id][stattype_id] = {};
			layer_stat_dict['min'] = DATA['stat_max'] + 100;
			layer_stat_dict['max'] = DATA['stat_min'] - 100;
			for(var group_id in part_group_dict_dict[part_id]){
				var part_group = part_group_dict_dict[part_id][group_id];
				var value = part_group[stattype_id];
				layer_stat_dict['min'] = minn(layer_stat_dict['min'],value);
				layer_stat_dict['max'] = maxx(layer_stat_dict['max'],value);
			}
		}
	}
	
	var last_part_id = null;
	for(var part_idx=DATA["part_type_list"].length-1;part_idx>=0;--part_idx){
		var part_id = DATA["part_type_list"][part_idx]['id'];
		for(var stattype_idx in DATA["stat_type_list"]){
			var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
			layer_stat_dict_dict_dict[part_id][stattype_id]['minsum'] = layer_stat_dict_dict_dict[part_id][stattype_id]['min'];
			layer_stat_dict_dict_dict[part_id][stattype_id]['maxsum'] = layer_stat_dict_dict_dict[part_id][stattype_id]['max'];
			if(last_part_id!=null){
				layer_stat_dict_dict_dict[part_id][stattype_id]['minsum'] += layer_stat_dict_dict_dict[last_part_id][stattype_id]['minsum'];
				layer_stat_dict_dict_dict[part_id][stattype_id]['maxsum'] += layer_stat_dict_dict_dict[last_part_id][stattype_id]['maxsum'];
			}
		}
		last_part_id = part_id;
	}
	
	var kart_stat_dict = {};
	for(var stattype_idx in DATA["stat_type_list"]){
		var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
		kart_stat_dict[stattype_id] = 0;
	}
	
	// stat accumulate
	var stat_accumuate_dict_dict = {}; // [stattypeid,value] = sum([stattypeid,0-value])
	for(var stattype_idx in DATA["stat_type_list"]){
		var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
		var stat_accumuate_dict = stat_accumuate_dict_dict[stattype_id] = {};
		
		var min=0;var max=0;var step=0;
		if(DATA["stat_type_list"][stattype_idx]['type']=='int'){
			min=DATA['stat_min'];max=DATA['stat_max'];step=1;
		}else{
			min=0;max=1;step=1;
		}
		
		var v = 0;
		stat_accumuate_dict[min-step]=v;
		for(var i=min;i<=max;i+=step){
			v+=condition1['stat'][stattype_id][i]?1:0;
			stat_accumuate_dict[i]=v;
		}
	}
	//console.log(stat_accumuate_dict_dict);

	for(var char_part_group_id   in part_group_dict_dict['char'])  {
		var char_part_group   = part_group_dict_dict['char'  ][char_part_group_id];
		if(char_part_group['ignore'])continue;
		var kart_stat_dict_0 = add_stat(kart_stat_dict,char_part_group);
		if(!check_range(kart_stat_dict_0,layer_stat_dict_dict_dict['body'],stat_accumuate_dict_dict))continue;
	for(var body_part_group_id   in part_group_dict_dict['body'])  {
		var body_part_group   = part_group_dict_dict['body'  ][body_part_group_id];
		if(char_part_group['ignore']||body_part_group['ignore'])continue;
		var kart_stat_dict_1 = add_stat(kart_stat_dict_0,body_part_group);
		if(!check_range(kart_stat_dict_1,layer_stat_dict_dict_dict['tire'],stat_accumuate_dict_dict))continue;
	for(var tire_part_group_id   in part_group_dict_dict['tire'])  {
		var tire_part_group   = part_group_dict_dict['tire'  ][tire_part_group_id];
		if(char_part_group['ignore']||body_part_group['ignore']||tire_part_group['ignore'])continue;
		var kart_stat_dict_2 = add_stat(kart_stat_dict_1,tire_part_group);
		if(!check_range(kart_stat_dict_2,layer_stat_dict_dict_dict['glider'],stat_accumuate_dict_dict))continue;
	for(var glider_part_group_id in part_group_dict_dict['glider']){
		var glider_part_group = part_group_dict_dict['glider'][glider_part_group_id];
		if(char_part_group['ignore']||body_part_group['ignore']||tire_part_group['ignore']||glider_part_group['ignore'])continue;

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
			good = good && condition1['stat'][stat_id][value];
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
		
		if(filter_stat_id!=null){
			condition1['stat'][filter_stat_id][stat[filter_stat_id]] = false;
			
			var stattype_id = filter_stat_id;
			var stat_accumuate_dict = stat_accumuate_dict_dict[stattype_id];
			var min=0;var max=0;var step=0;
			if(STATTYPE_OBJ_DICT[stattype_id]['type']=='int'){
				min=DATA['stat_min'];max=DATA['stat_max'];step=1;
			}else{
				min=0;max=1;step=1;
			}
			
			var v = 0;
			stat_accumuate_dict[min-step]=v;
			for(var i=min;i<=max;i+=step){
				v+=condition1['stat'][stattype_id][i]?1:0;
				stat_accumuate_dict[i]=v;
			}
		}
		if(filter_part_id=='char')char_part_group['ignore']=true;
		if(filter_part_id=='body')body_part_group['ignore']=true;
		if(filter_part_id=='tire')tire_part_group['ignore']=true;
		if(filter_part_id=='glider')glider_part_group['ignore']=true;
	}}}}
	
	return {
		"kart_group_list":kart_group_list,
		"condition":condition0,
		"kart_count":kart_count,
	};
}

function add_stat(stat_dict,group){
	var ret = {};
	for(var stattype_idx in DATA["stat_type_list"]){
		var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
		ret[stattype_id]=stat_dict[stattype_id]+group[stattype_id];
	}
	return ret;
}

function check_range(stat_dict,layer_stat_dict_dict,stat_accumuate_dict_dict){
//	console.log(stat_dict,layer_stat_dict_dict);
	for(var stattype_idx in DATA["stat_type_list"]){
		var stattype_id = DATA["stat_type_list"][stattype_idx]['id'];
		var step = 1;
		var min=stat_dict[stattype_id]+layer_stat_dict_dict[stattype_id]['minsum'];
		var max=stat_dict[stattype_id]+layer_stat_dict_dict[stattype_id]['maxsum'];
		var good = (stat_accumuate_dict_dict[stattype_id][max]-stat_accumuate_dict_dict[stattype_id][min-step])>0;
		if(!good)return false;
	}
	return true;
}

function click_set_all(key,value){
	set_all(key,value)
	updateAll();
}

function set_all(key,value){
	$('.'+key).prop('checked',value);
}

function box_click(){
	updateAll();
}

function stat_arrow_click(type,value){
	//console.log(type);
	//console.log(value);
	var stat_min = DATA['stat_min'];
	var all_zero = true;
	for(var i=stat_min;i<=value;i+=1){
		var key = "stat_"+type+"_"+i;
		var v = $('#'+key+'_box').is(":checked");
		all_zero = all_zero && (!v);
	}
	//console.log(all_zero);
	var set_value = all_zero;
	for(var i=stat_min;i<=value;i+=1){
		var key = "stat_"+type+"_"+i;
		//console.log($('#'+key+'_box').is(":checked"));
		$('#'+key+'_box').prop('checked',set_value);
	}
	updateAll();
}

function updateAll(){
	var condition = getCondition();
	solution = searchSolution(condition);
	var stat_filter = calc_stat_filter(condition,solution);
	draw_stat_filter(stat_filter);
	var part_filter = calc_part_filter(condition);
	draw_part_filter(part_filter);
	update_solution(solution);
}

function update_solution(solution){
	$("#search_result").empty();
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

function calc_stat_filter(condition,solution0){
	ret = {};
	DATA["stat_type_list"].forEach(function(stat_type){
		var stat_id = stat_type["id"];
		var condition0 = clone(condition);
		for(var value in condition0['stat'][stat_id]){
			condition0['stat'][stat_id][value] = (!condition['stat'][stat_id][value]);
		}
		var solution = searchSolution(condition0,stat_id);
		var ret_stat_id = ret[stat_id] = solution['condition']['stat'][stat_id];
		var solution0_condition_stat_stat_id = solution0['condition']['stat'][stat_id];
		for(var value in ret[stat_id]){
			ret_stat_id[value] = ret_stat_id[value] || solution0_condition_stat_stat_id[value];
		}
	});
	//console.log(ret);
	return ret;
}

function draw_stat_filter(stat_filter){
	DATA["stat_type_list"].forEach(function(stat_type){
		var stat_id = stat_type["id"];
		if(stat_type['type']=='int'){
			for(i=DATA['stat_min'];i<=DATA['stat_max'];i+=1){
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
		var condition0 = clone(condition);
		var part_dict = condition0['part'][part_type_id];
		for(var part_id in part_dict){
			part_dict[part_id] = true;
		}
		var solution = searchSolution(condition0,null,part_type_id);
		ret[part_type_id] = solution['condition']['part'][part_type_id];
	};
	return ret;
}

function draw_part_filter(part_filter){
	//console.log(part_filter);
	for(var part_type_id in part_filter){
		var part_dict = part_filter[part_type_id];
		for(var part_id in part_dict){
			var key = part_type_id+"_"+part_id;
			var value = part_dict[part_id];
			$("#"+key+"_bg").css("background-color",value?"green":"red");
		}
	}
}

function maxx(a,b){return (a>b)?a:b;}
function minn(a,b){return (a<b)?a:b;}
function clone(x){return JSON.parse(JSON.stringify(x));}

$.getJSON('version.json',function(version){
	$("#ver_version").text(version['version']);
	$("#ver_build").text(version['build']);
});

$.getJSON('data.json',function(output){
	DATA=output;
	init_PART_STAT_DICT();
	init_PART_GROUP_DICT_DICT();
	init_STATTYPE_OBJ_DICT();
	set_all("box",true);
	//set_all("char_box",false);
	//$('#char_charinklinggirl_box').prop('checked',true);
	updateAll();
});
