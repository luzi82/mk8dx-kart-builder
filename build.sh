#!/bin/bash

set -e

NOW=`date "+%Y-%m-%dT%H:%M:%S%z"`
GITHASH=`git rev-parse HEAD`

rm -rf output
mkdir output

python3 data.py > data.json
php kartbuilder.php > kartbuilder.html

echo \{\"build\":\"${NOW}\",\"version\":\"${GITHASH}\"\} >> output/version.json
cp data.json output/
cp jquery-3.2.1.min.js output/
cp kartbuilder.html output/
cp kartbuilder.js output/
