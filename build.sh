#!/bin/bash

rm -rf output
mkdir output

python3 data.py > data.json
php kartbuilder.php > kartbuilder.html

cp data.json output/
cp jquery-3.2.1.min.js output/
cp kartbuilder.html output/
cp kartbuilder.js output/
