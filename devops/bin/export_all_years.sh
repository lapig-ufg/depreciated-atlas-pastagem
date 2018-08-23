#!/bin/bash

for year in $(seq 1985 2017); do
	ogr2ogr -f "ESRI Shapefile" pasture_go_$year.shp PG:"host=localhost user=postgres dbname=atlas_pastagem" -sql "SELECT * FROM pasture WHERE uf = 'GO' AND year = '$year'"
done