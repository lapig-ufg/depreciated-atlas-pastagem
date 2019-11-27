# Pastagem.org - Digital Atlas of the Brazilian Pasturelands 

Pasture areas are approximately 20% of national territory, contituting the largest land use and cover class in Brazil. As most of the Brazilian cattle herd is pasture-fed, these areas are very relevant to the livestock activity of the country. In this direction, this work presents the design and development of the Digital Atlas of Brazilian Pastures, a platform that consolidated data and information of this important class. In its first version, we of er a whole series of pasture mappings with 33 maps for all Brazil, from 1985 to 2017, which allow us to analyze the value of pasture areas in several regions of interest (e.g. biomes, states, municipalities. In future versions, other data will be inserted (e.g. historical bovine stocking, intensification potential) and new functionalities will be developments, thus seeking contribute to the multiple stakeholders of the Brazilian livestock chain. 

[See the conference paper for more info](https://proceedings.science/sbsr-2019/papers/atlas-digital-das-pastagens-brasileiras--dados-e-informacoes-sobre-a-maior-classe-de-uso-da-terra-do-brasil)

Link to access: [https://pastagem.org/atlas](https://pastagem.org/atlas)

![alt tag](https://raw.githubusercontent.com/lapig-ufg/atlas-pastagem/master/proj/application.png)

## Running:
 1. Start PostgreSQL (with PostGIS)
 ```
 systemctl start postgresql
 ```
 2. Start Server
 ```
 ./prod-start.sh
 ```