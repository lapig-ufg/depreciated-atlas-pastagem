CREATE INDEX pasture_year_idx ON pasture(year);
CREATE INDEX pasture_geometry_idx ON pasture USING GIST(wkb_geometry);
CREATE INDEX pasture_uf_idx ON pasture(uf);
CREATE INDEX pasture_geocmu_idx ON pasture(cd_geocmu);
CREATE INDEX pasture_bioma_idx ON pasture(bioma);
CREATE INDEX pasture_matopiba_idx ON pasture(arcodesmat);
CREATE INDEX pasture_arcodesmat_idx ON pasture(arcodesmat);

INSERT into spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text)
VALUES (10000, 'EPSG', 10000,
'PROJCS["unnamed", GEOGCS["Australian Natl & S. Amer. 1969", DATUM["unknown", SPHEROID["aust_SA",6378160,298.25]], PRIMEM["Greenwich",0], UNIT["degree",0.0174532925199433]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",-2], PARAMETER["standard_parallel_2",-22], PARAMETER["latitude_of_center",-12], PARAMETER["longitude_of_center",-54], PARAMETER["false_easting",0], PARAMETER["false_northing",0], UNIT["Meter",1]]'
,'+proj=aea +lat_1=-2 +lat_2=-22 +lat_0=-12 +lon_0=-54 +x_0=0 +y_0=0 +ellps=aust_SA +units=m +no_defs');