
//Url of the data
const url = '/data'
const topCountyUrl = '/topCounties'

// // Fetch the JSON data and console log it
// d3.json(url).then(function (data) {
//   console.log(data);
// });


// Create function to get the name of counties that are top 5
async function getCounties() {
  try {
    const data2 = await d3.json(topCountyUrl);
    const countyNames = data2.map((item) => item.county);
    return countyNames;
  } catch (error) {
    console.error('Error fetching county names:', error);
    throw error;
  }
}


// Initialize the dashboard
// Create dropdown for each year in our data
function init() {
  // Use D3 to select the dropdown menu
  let dropdownMenuYear = d3.select("#selYear").on("change", onChange ) 

  // Fetch the JSON data from your Flask endpoint
  d3.json(url).then(function (data) {
    // Extract the unique years from the JSON data
    let uniqueYears = [...new Set(data.map(item => item.year))];

    // Populate the dropdown menu with options
    uniqueYears.forEach(year => {
      dropdownMenuYear.append("option").text(year).property("value", year);
    });

    dropdownMenuYear.property("value", 2019);

    // Extract the unique county from the JSON data
    let uniqueCountiesSet = new Set(data.map(item => item.county));
    //output the set has unique counties
    console.log('set is : ', uniqueCountiesSet)
    // Populate the dropdown menu with options of county
    let dropdownMenuCounty = d3.select("#selCounty").on("change", onChange);
    for (let county of uniqueCountiesSet) {
      dropdownMenuCounty.append("option").text(county).property("value", county);
    }

  });

  google.charts.load('current', { 'packages': ['corechart'] });
  // google.charts.setOnLoadCallback();

  createBar(2019, 'Los Angeles County');
  drawVisualization(2019)

  // const map = createMap();
}

function onChange(){
  let dropdownMenuYear = d3.select("#selYear");
  let year = dropdownMenuYear.property("value");

  let dropdownMenuCounty = d3.select("#selCounty");
  let county = dropdownMenuCounty.property("value");

  console.log("year : ", year, " county: ", county)

  createBar(year, county)
  drawVisualization(year)

}
function createBar(year, county) {

  
  // d3.json(url).then((data) => {


  //   // Filter based on the value of the year and county
  //   let crimeData = data.filter(result => (result.year == year && result.county == county));
  //   //out put
  //   console.log(crimeData)

  //   //Create a dictionary object to hold each crim with it's initial value as 0
  //   var crimeDict = { "violent": 0, "homicide": 0, "rape": 0, "robbery": 0, "agg_assault": 0, "property": 0, "burglary": 0, "vehicle_theft": 0, "larceny_theft": 0 };
  //   // for loop gets each crime in crimeData
  //   for (let item of crimeData) {
  //     // for loop to get the value for each crime 
  //     for (let crime in crimeDict) {
  //       // sum the value of each crime
  //       crimeDict[crime] += item[crime];
  //     }
  //   }
  //   //log the dictionary object to see the output 
  //   console.log("Total of each crime : ", crimeDict);

  // });
  
  

}

// GoogleChart

function drawVisualization(year) {
   

  //5 highets population counties
  // 'Los Angeles County', 'San Diego County', 'Orange County', 'Riverside County', 'San Bernardino County'
  getCounties()
    .then((countyNames) => {
      console.log('County names:', countyNames);

      d3.json(url).then((data) => {
 


        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'County');
        dataTable.addColumn('number', 'Violent');
        dataTable.addColumn('number', 'Robbery');
        dataTable.addColumn('number', 'Property');
        dataTable.addColumn('number', 'Vehicle Theft');

        for (let c of countyNames) {
         

          let yearCrimes = data.filter(result => (result.year == year && result.county == c));
          // console.log( 'year crime ', yearCrimes)


          var hightCrimeDict = { "violent": 0, "robbery": 0, "property": 0, "vehicle_theft": 0 };
          // for loop gets each crime in highCrimeDict
          for (let item of yearCrimes) {
          // for loop to get the value for each crime 
            for (let crimes in hightCrimeDict) {
            // sum the value of each crime
                hightCrimeDict[crimes] += item[crimes];
            }
          }
          
        
          console.log('dic for county' , c, ' is ' , hightCrimeDict)

          dataTable.addRow(
            [c, hightCrimeDict['violent'], hightCrimeDict['robbery'], hightCrimeDict['property'], hightCrimeDict['vehicle_theft']]);
        }


        // Define the chart 
        var options = {
          title: 'Crime Rate for the most Populous Counteis',
          vAxis: { title: 'Number of Crimes' },
          hAxis: { title: 'Counties' },
          seriesType: 'bars',
          // series: { 5: { type: 'line' } }
        };

        var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        chart.draw(dataTable, options);

      });

      // Handle errors here
    }).catch((error) => {

      console.error('Error:', error);
    });


}

init();



