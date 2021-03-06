#!/bin/python

import csv, json

def _load_data(filename):
    _csv_file = open(filename,'r')
    ret = list(csv.DictReader(_csv_file))
    _csv_file.close()
    return ret

# load csv
stat_type_list = _load_data('stat-type.csv')
stat_list = _load_data('stat.csv')
part_type_list = _load_data('part-type.csv')

# make all stat become number
for stat_type in stat_type_list:
    stid = stat_type['id']
    for stat in stat_list:
        stat[stid] = float(stat[stid])

# make all stat become int
for stat_type in stat_type_list:
    stid = stat_type['id']
    for stat in stat_list:
        stat[stid] = round(stat[stid])

# Group same stat part
part_group_list = []
for stat in stat_list:
    if 'group' in stat:
        continue
    part_group_id = "group"+stat['id']
    part_group = {stat_type['id']:stat[stat_type['id']] for stat_type in stat_type_list}
    part_group['id'] = part_group_id
    part_group['type'] = stat['type']
    part_group['member'] = [stat['id']]
    part_group_list.append(part_group)
    
    stat['group'] = part_group_id
    for stat0 in stat_list:
        if 'group' in stat0:
            continue
        if stat0['type']!=part_group['type']:
            continue
        good = True
        for stat_type in stat_type_list:
            stat_id = stat_type['id']
            good = good and (stat0[stat_id] == part_group[stat_id])
        if not good:
            continue
        stat0['group'] = part_group_id
        part_group['member'].append(stat0['id'])

# Get the min max of each stat in each parts
for stat_type in stat_type_list:
    if stat_type['type'] != 'int':
        continue
    stid = stat_type['id']
    for part_type in part_type_list:
        stat_type[part_type['id']+'min'] = float('inf')
        stat_type[part_type['id']+'max'] = float('-inf')
    for stat in stat_list:
        value = stat[stid]
        part_type_id = stat['type']
        stat_type[part_type_id+'min'] = min(stat_type[part_type_id+'min'],value)
        stat_type[part_type_id+'max'] = max(stat_type[part_type_id+'max'],value)

# Get the min max of each stat
for stat_type in stat_type_list:
    if stat_type['type'] != 'int':
        continue
    stat_type['min'] = sum([stat_type[part_type['id']+'min'] for part_type in part_type_list])
    stat_type['max'] = sum([stat_type[part_type['id']+'max'] for part_type in part_type_list])

# Get the min max of all stat
stat_min = min([stat_type['min'] for stat_type in stat_type_list if stat_type['type'] == 'int'])
stat_max = max([stat_type['max'] for stat_type in stat_type_list if stat_type['type'] == 'int'])

# Group parts into different list by type
part_dict = {part_type['id']:[] for part_type in part_type_list}
for stat in stat_list:
    part_dict[stat['type']].append(stat)

# Group part group into different list by type
part_group_dict = {part_type['id']:[] for part_type in part_type_list}
for part_group in part_group_list:
    part_group_dict[part_group['type']].append(part_group)

output = {
    "stat_type_list":stat_type_list,
    "stat_list":stat_list,
    "stat_min":stat_min,
    "stat_max":stat_max,
    "part_dict":part_dict,
    "part_type_list":part_type_list,
    "part_group_dict":part_group_dict,
}

output = json.dumps(output,sort_keys=True,indent=2)
print(output)
