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
    let dropdownMenu = d3.select("#selDataset");
  
    // Fetch the JSON data from your Flask endpoint
    d3.json(url).then(function(data) {
      // Extract the unique years from the JSON data
      let uniqueYears = [...new Set(data.map(item => item.year))];
  
      // Populate the dropdown menu with options
      uniqueYears.forEach(year => {
        dropdownMenu.append("option").text(year).property("value", year);
      });
  
      
    });
  }


init();