//Url of the data
const url = '/data'

// Fetch the JSON data and console log it
d3.json(url).then(function(data) {
  console.log(data);
});

// Initialize the dashboard
// Create dropdown for each year in our data
function init() {
    // Use D3 to select the dropdown menu
    let dropdownMenuYear = d3.select("#selYear").on("change", createBar);
    
    // Fetch the JSON data from your Flask endpoint
    d3.json(url).then(function(data) {
      // Extract the unique years from the JSON data
      let uniqueYears = [...new Set(data.map(item => item.year))];
  
      // Populate the dropdown menu with options
      uniqueYears.forEach(year => {
        dropdownMenuYear.append("option").text(year).property("value", year);
      });
  
      // Extract the unique county from the JSON data
      let uniqueCountiesSet =  new Set(data.map(item => item.county));
      //output the set has unique counties
      console.log('set is : ', uniqueCountiesSet)
      // Populate the dropdown menu with options of county
      let dropdownMenuCounty = d3.select("#selCounty").on("change", createBar);
      for (let county of uniqueCountiesSet){
        dropdownMenuCounty.append("option").text(county).property("value", county);
      }


    });

    
  }
function createBar(){
  
  let dropdownMenuYear = d3.select("#selYear");
  let year = dropdownMenuYear.property("value");

  let dropdownMenuCounty = d3.select("#selCounty");
  let county = dropdownMenuCounty.property("value");

  console.log( "year : ", year, " county: ", county)
  d3.json(url).then((data) => {
 

    // Filter based on the value of the year and county
    let crimeData = data.filter(result => (result.year == year && result.county == county) );
    //out put
    console.log( crimeData)
    
    //Create a dictionary object to hold each crim with it's initial value as 0
    var crimeDict = {"violent":0,"homicide":0,"rape":0,"robbery":0,"agg_assault":0,"property":0,"burglary":0,"vehicle_theft":0,"larceny_theft":0};
    // for loop gets each crime in crimeData
    for (let item of crimeData)
      {
        // for loop to get the value for each crime 
        for (let crime in crimeDict){
          // sum the value of each crime
          crimeDict[crime] += item[crime] ;
        }
      }
    //log the dictionary object to see the output 
    console.log("Total of each crime : ", crimeDict);
  });



}

init();
