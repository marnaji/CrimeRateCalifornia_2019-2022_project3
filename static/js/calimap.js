//Map Of California

//Fetch crime data for a specific year and county.
async function getCrimeDataByYearAndCounty(year) {
    try {
        // Fetch the JSON data from your Flask endpoint
        const response = await fetch('/data');
        const data = await response.json();

        // Filter the data for the specified year
        const filteredData = data.filter((item) => item.year === year);

        // Create an empty dictionary to store data for each county
        const countyData = {};

        // Iterate through the filtered data
        filteredData.forEach((item) => {
            const county = item.county;

            // If the county dictionary doesn't exist, create it
            if (!countyData[county]) {
                countyData[county] = {
                    "violent": 0,
                    "homicide": 0,
                    "rape": 0,
                    "robbery": 0,
                    "agg_assault": 0,
                    "property": 0,
                    "burglary": 0,
                    "vehicle_theft": 0,
                    "larceny_theft": 0
                };
            }

            // Increment the crime counts for the county
            for (const crime in countyData[county]) {
                countyData[county][crime] += item[crime];
            }
        });

        // Compute the min and max values for each crime type across all counties
        const crimeMinMax = {};
        for (const county in countyData) {
            const countyCrimeData = countyData[county];
            for (const crime in countyCrimeData) {
                const crimeValue = countyCrimeData[crime];
                if (!crimeMinMax[crime]) {
                    crimeMinMax[crime] = { min: crimeValue, max: crimeValue };
                } else {
                    if (crimeValue < crimeMinMax[crime].min) {
                        crimeMinMax[crime].min = crimeValue;
                    }
                    if (crimeValue > crimeMinMax[crime].max) {
                        crimeMinMax[crime].max = crimeValue;
                    }
                }
            }
        }

        // Return an object containing both county data and min/max info
        return { countyData, crimeMinMax };
    } catch (error) {
        console.error("Error fetching data:", error);
        return null; 
    }
}

// fetch and process crime data for a specific year and county(Usage)
getCrimeDataByYearAndCounty(2019)
    .then((result) => {
        if (result) {
            const { countyData, crimeMinMax } = result;
            console.log('crime in 2019', crimeMinMax);
            console.log('map in 2019', countyData);
        } else {
            console.log("Error fetching data. Check the server or input parameters.");
        }
    });

// Function to create the Leaflet map with interactive controls
function createMap(geojsonData, initialYear, initialCrimeType) {
    // Create a Leaflet map centered on California
    const map = L.map('calimap').setView([37.5, -119], 6);

    // Create a tile layer for the base map
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Function to normalize a value based on min and max
    function normalize(value, min, max) {
        return (value - min) / (max - min);
    }
    function normalizeLog(value, min, max) {
        // Apply logarithmic transformation
        const logValue = Math.log(value - min + 1); // Add 1 to avoid logarithm of zero
        const logMin = Math.log(1); // Logarithm of 1 is zero
        const logMax = Math.log(max - min + 1); // Logarithm of (max - min + 1)
        
        // Normalize using the logarithmic values
        return (logValue - logMin) / logMax;
    }
    
    // Fetch the crime data for the specified year and crime type
    function fetchAndCreateMap(year, crimeType) {
        getCrimeDataByYearAndCounty(parseInt(year,10) )
            .then((crimeData) => {
                if (!crimeData) {
                    console.error('Failed to fetch crime data.');
                    return;
                }
                const { countyData, crimeMinMax } = crimeData;
                console.log(1,countyData)
                console.log(2,crimeMinMax)
                
                // Create a GeoJSON layer for California counties and add it to the map
                const countyLayer = L.geoJSON(geojsonData, {
                    style: function (feature) {
                        const countyName = feature.properties.name + ' County';

                        // Get the number of crimes for the specified year and county
                        const countyCrimes = countyData[countyName][crimeType];

                        // Get the min and max values for the specified crime type
                        const min = crimeMinMax[crimeType].min;
                        const max = crimeMinMax[crimeType].max;

                        function getColor(value, min, max) {
                            // Define cold (white) and warm (red) colors
                            const coldColor = [255, 255, 255]; // white
                            const warmColor = [255, 0, 0]; // Red
                    
                            // Normalize the value to the range [0, 1]
                            // const normalizedValue = (value - min) / (max - min);
                            const normalizedValue = normalizeLog(countyCrimes, min, max)
                            // Interpolate between cold and warm colors based on the normalized value
                            const r = Math.round(coldColor[0] + (warmColor[0] - coldColor[0]) * normalizedValue);
                            const g = Math.round(coldColor[1] + (warmColor[1] - coldColor[1]) * normalizedValue);
                            const b = Math.round(coldColor[2] + (warmColor[2] - coldColor[2]) * normalizedValue);
                    
                            return `rgb(${r},${g},${b})`;
                        }

                        // Calculate the normalized value
                        const normalizedValue = normalizeLog(countyCrimes, min, max);

                        // Generate a color based on the normalized value
                        // const fillColor = `rgba(255, 0, 0, ${normalizedValue})`;
                        const fillColor = getColor( countyCrimes, min, max)

                        return {
                            fillColor: fillColor,
                            weight: 2,
                            opacity: 0.5,
                            color: 'black',
                            fillOpacity: 0.7,
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        // Bind a popup with the county name
                        const countyName = feature.properties.name + ' County';
                        const countyCrimes = countyData[countyName];

                        // Create a popup content string with the county name and individual crime counts
                        let popupContent = `<strong>${countyName}</strong><br>`;
                        for (const crime in countyCrimes) {
                            if (countyCrimes.hasOwnProperty(crime)) {
                                popupContent += `${crime}: ${countyCrimes[crime]}<br>`;
                            }
                        }

                        // Bind the popup with the updated content
                        layer.bindPopup(popupContent);
                        
                    },
                });

                // Clear existing layers and add the new countyLayer
                map.eachLayer((layer) => {
                    if (layer !== map && layer !== streetmap ) {
                        map.removeLayer(layer);
                    }
                });
                countyLayer.addTo(map);
            })
            .catch((error) => {
                console.error('Error fetching crime data:', error);
            });
    }

    // Reference the HTML elements for the controls
    const crimeTypeSelect = document.getElementById('crime-type-select');
    const yearSelect = document.getElementById('year-select');

    // Add event listeners to the select elements
    crimeTypeSelect.addEventListener('change', () => {
        const selectedCrimeType = crimeTypeSelect.value;
        const selectedYear = yearSelect.value;
        fetchAndCreateMap(selectedYear, selectedCrimeType);
    });

    yearSelect.addEventListener('change', () => {
        const selectedCrimeType = crimeTypeSelect.value;
        const selectedYear = yearSelect.value;
        fetchAndCreateMap(selectedYear, selectedCrimeType);
    });

    // Initialize the map with the default year and crime type
    fetchAndCreateMap(initialYear, initialCrimeType);
}

// Call createMap with the GeoJSON data and initial year and crime type
fetch(geoJSONUrl)
    .then((response) => response.json())
    .then((data) => {
        createMap(data, '2019', 'violent'); // Set your initial year and crime type here
        // Call the updateLegend function initially to set up the legend
        updateLegend();
    });

// Function to update the legend
function updateLegend() {
    const legend = document.getElementById('legend');
    let legendContent = '<strong>Map Info</strong><br><br>';
  
    // Add legend items for your specific data
    // Replace with your own data and labels
    legendContent += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 0, 0, 0.0);border: 1px solid #000;"></div> Low Incidence of Crime</div>';
    legendContent += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 0, 0, 0.2);border: 1px solid #000;"></div> Moderate Crime Occurrence</div>';
    legendContent += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 0, 0, 0.5);border: 1px solid #000;"></div> High Crime Prevalence</div>';
    legendContent += '<div class="legend-item"><div class="legend-color" style="background-color: rgba(255, 0, 0, 1.0);border: 1px solid #000;"></div> Very High Rate of Crime</div>';
  
    // Set the legend content
    legend.innerHTML = legendContent;
  }


  