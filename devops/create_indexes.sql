CREATE INDEX pasture_year_idx ON pasture USING BRIN(year, wkb_geometry);
CREATE INDEX pasture_cd_geocmu_year_idx ON pasture USING BRIN(cd_geocmu, year, wkb_geometry);
CREATE INDEX pasture_uf_year_idx ON pasture USING BRIN(year, uf, wkb_geometry);
CREATE INDEX pasture_bioma_year_idx ON pasture USING BRIN(year, bioma, wkb_geometry);
CREATE INDEX pasture_arcodesmat_year_idx ON pasture USING BRIN(year, arcodesmat, wkb_geometry);
CREATE INDEX pasture_matopiba_year_idx ON pasture USING BRIN(year, matopiba, wkb_geometry);