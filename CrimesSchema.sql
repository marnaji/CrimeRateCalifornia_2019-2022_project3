-- DROP TABLE IF EXISTS crimes; 

-- Create crimes table 
CREATE TABLE Crimes(
    "id"  INTEGER PRIMARY KEY,
    "year" INTEGER NOT NULL, 
    "county" VARCHAR(100) NOT NULL, 
    "month" INTEGER NOT NULL,
    "county_pop" INTEGER NOT NULL,
    "violent" INTEGER NOT NULL,
    "homicide" INTEGER NOT NULL,
    "rape" INTEGER NOT NULL,
    "robbery" INTEGER NOT NULL,
    "agg_assault" INTEGER NOT NULL,
    "property" INTEGER NOT NULL, 
    "burglary" INTEGER NOT NULL,
    "vehicle_theft" INTEGER NOT NULL, 
    "larceny_theft" INTEGER NOT NULL
 );


