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
    // Calling the createBar function so it displays the graphs for 2019, Alameda County
    createBar(uniqueCountiesSet[0]);
    });

  }

// Create a function to calculate the values for plotting visualizations
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
    // log the dictionary object to see the output 
    console.log("Total of each crime : ", crimeDict);

    // Calling the chart functions to pass crimeDict as an argument for further manipulation
    createBarChart(crimeDict);
    createPieChart(crimeDict);
    
  });

  // Create a bar chart function to plot crime count vs name for user selected year and county 
  function createBarChart(barChartDict){

    // Extracting keys and values from the dict to convert it into a two dimensional array 
    var items = Object.keys(barChartDict).map(function(key) {
      return [key, barChartDict[key]];
    });
    
    // Sorting the two dimensional array in descending order 
    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    // Extracting the first array from the two dimensional array and assigning it to a variable (sorted keys from crimeDict)
    let xValues = items.map(d => d[0]);
    console.log("X values");
    console.log(xValues);

    // Extracting the second array from the two dimensional array and assigning it to a variable (sorted values from crimeDict)
    let yValues = items.map(d => d[1]);
    console.log("Y values");
    console.log(yValues);

    // Creating the bar chart with the arrays stored in the above variables (sorted keys and values from crimeDict)
    let trace1 = {
      x: xValues,
      y: yValues,
      type: "bar",
      // This allows modification of the standard hover text in the chart
      hoverlabel: {
        bgcolor: 'black',
        bordercolor: 'black',
        font: {
          family: 'Lato',
          color: 'white',
          size: 16
        }
      },

    };

    let data = [trace1];

    let layout = {
      title: {
        text: 'Aggregate Crime Statistics by Year and County ',
        // This allows modification of the standard title font and size
        font: {
          size: 22,
          family: 'Arial',
          color: 'black'
        }
      },
      margin: { t: 40, l: 35 }
    };

    Plotly.newPlot("bar", data, layout);

  };

  // Create a pie chart function to plot aggregate crime rate by year and county
  function createPieChart(chartDict){

    // Extracting keys and values from the dict to convert it into a two dimensional array
    var items1 = Object.keys(chartDict).map(function(key) {
      return [key, chartDict[key]];
    });

    // Sorting the two dimensional array in descending order
    items1.sort(function(first, second) {
      return second[1] - first[1];
    });

    // Extracting the first array from the two dimensional array and assigning it to a variable (sorted keys from crimeDict)
    let xVals = items1.map(d => d[0]);

    // Extracting the second array from the two dimensional array and assigning it to a variable (sorted values from crimeDict)
    let yVals = items1.map(d => d[1]);

    // Initialize aggregate sum and aggregate crime rates to a variable and empty array
    let aggSum = 0;
    let aggYVals = [];

    // Calculate the sum of the crime counts in the array
    for (let i=0; i<yVals.length; i++) {
        aggSum += yVals[i];
    };

    // Calculate the average of the crime counts and push it to aggYVals array
    for (let j=0; j<yVals.length; j++) {
      console.log(yVals[j])
      aggYVals.push(((yVals[j]/aggSum)*100).toFixed(2));
    };
    console.log(aggSum, aggYVals);

    // Use the above arrays to create a donut chart with crime rate by year and county
    let trace2 = [
      {
        values: aggYVals,
        labels: xVals,
        domain: { column: 0 },
        hoverinfo: 'label+percent',
        marker: {
          line: {
            color: 'white',
            width: 1
          }
        },
        textfont: {
          family: 'Lato',
          color: 'white',
          size: 18
        },
        hoverlabel: {
          bgcolor: 'black',
          bordercolor: 'black',
          font: {
            family: 'Lato',
            color: 'white',
            size: 20
          }
        },
        hole: .4,
        type: "pie",
      }
    ];

    // Create a layout for the donut chart 
    let layout = {

      title: {
        text: 'Aggregate Crime Rate by Year and County',
        font: {
          size: 22,
          family: 'Arial',
          color: 'black'
        }
      },
      // Specifies the text that goes inside the donut hole 
      annotations: [
        {
          font: {
            size: 20
          },
          showarrow: false,
          text: 'Crime Rate',
          textposition: 'inside',
          x: 0.5,
          y: 0.5
        },

      ],
      height: 600,
      width: 600,
      showlegend: false,
      grid: { rows: 1, columns: 1 }
    };
  
    Plotly.newPlot("pie", trace2, layout);
  };
};

init();


