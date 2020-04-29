/* Create a Leaflet map in the "map" div */
let map = L.map('map', {
    /* Render with Canvas rather than the default SVG */
    renderer: L.canvas(),
    /* Restrict zooming to a few zoom levels */
    minZoom: 3,
    maxZoom: 7,
    /* Limit panning to the 50 states */
    maxBounds: [[8,-170],[68, -56]],
    maxBoundsViscosity: 0.9,
    /* Remove zoom buttons */
    zoomControl: false,
    /* Remove attribution control, as one has been made separately */
    attributionControl: false
});
/* Set the map's initial extent to the 48 continential states */
map.fitBounds([[24, -126], [50, -66]]);

/* Create the basemap */
let basemap = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	subdomains: 'abcd'
});
/* Add the basemap to the map */
basemap.addTo(map);

/* Function calculating radius of a circle from its area */
function areaToRadius(area) {
    return Math.sqrt(area / Math.PI);
}

/* Function called to update legend when a display change occurs */
function updateLegend(mode, min, max, minArea, maxArea) {
    /* Show the DOM elements that share a class name with the selected mode; this controls the display of circles and labels in the legend */
    $('.' + mode).show();
    /* If the display mode is "absolute": */
    if (mode === 'absolute') {
        /* Finish what was started on line 34, ensuring that the legend elements match the content */
        $('.relative').hide();
        /* Set the legend's title to match map content */
        $('#legend-title').html('Population');
        /* Set the "minimum" text value in the legend to indicate the population threshold for the smallest circle size, keeping only three significant figures of the population and adding digit grouping as necessary for readability */
        $('#legend-min').html('&le;&nbsp;' + Number(Number.parseFloat(min).toPrecision(3)).toLocaleString());
        /* Set the "maximum" text value in the legend to indicate the population threshold for the largest circle size, keeping three significant figures of the population and adding digit grouping as necessary */
        $('#legend-max').html('&ge;&nbsp;' + Number(Number.parseFloat(max).toPrecision(3)).toLocaleString());
    /* If the display mode is "relative": */
    } else if (mode === 'relative') {
        /* Finish what was started on line 34, ensuring that the legend elements match the content */
        $('.absolute').hide();
        /* Set the legend's title to match map content */
        $('#legend-title').html('10-year change, percent');
        /* Set the "minimum" text value in the legend, which reflects no change in this mode */
        $('#legend-min').html('&cong;&nbsp;0%');
        /* Set the "maximum increase" text value in the legend to indicate the percentage threshold for the largest blue circle size, keeping three significant figures of the percentage and adding digit grouping as necessary */
        $('#legend-max').html('&ge;&nbsp;' + Number(Number.parseFloat(max * 100).toPrecision(3)).toLocaleString() + '%');
        /* Set the "maximum decrease" text value in the legend to indicate the percentage threshold for the largest red-orange circle size, keeping three significant figures of the percentage and adding digit grouping as necessary */
        $('#legend-max-decrease').html('&le; ' + (((1 / max) - 1) * 100).toFixed(0) + '%');
    }
}

/* Function called when controls are adjusted or map is zoomed */
function changeHandler(event) {
    /* Get the value of the display mode selector */
    let mode = $('#mode-select').val();
    /* If the display mode is "absolute" (i.e. "Population"), set the text below the year selector to "Year", otherwise, set it to "Decade" */
    $('#year-hint').html((mode === 'absolute' ? 'Year' : 'Decade'));
    /* If the display mode is "absolute", set the minimum value of the year selector to 1790, otherwise, set it to 1800 */
    $('#year-select')[0].min = (mode === 'absolute' ? '1790' : '1800');
    /* Get the value of the year selector */
    let year = $('#year-select').val();
    /* If the display mode is "absolute", set the value displayed below the year selector to the selected value; otherwise, subtract 10 and add an "s" on the end to make it read like a decade */
    let yearText = (mode === 'absolute' ? year : (year - 10) + 's');
    $('#year-indicator').html(yearText);
    /* If the event that called this function was caused by zooming the map or making a change to the requested display mode: */
    if (['change', 'zoom'].includes(event.type)) {
        /* Call "addPoints" to redraw the points layer */
        addPoints(parseInt(year), mode);
    }
}

/* When the display mode selector or year selector is interacted with, or when the map is zoomed, call "changeHandler" */
$('#mode-select').on('change', changeHandler);
$('#year-select').on('change', changeHandler)
    .on('input', changeHandler);
map.on('zoom', function(event) {
    changeHandler(event);
});

/* Function to numerically sort arrays */
function sort(arr) {
    /* The ".sort()" method iterates through all values in an array, sorting it using the provided function */
    return arr.sort(function(a, b) {
        /* Compare the two values in this iteration */
        return a - b;
    });
}

/* Create a map layer to store the metro area features */
let points = L.geoJSON();

/* Function called to add features to the "points" layer */
function addPoints(year, mode) {
    /* Delete any existing features */
    points.clearLayers();
    
    /* Create an empty array to store the quasi-histogram about to be created */
    let values = [];
    /* If the display mode is "absolute": */
    if (mode === 'absolute') {
        /* For each feature in the GeoJSON: */
        metros.features.forEach(function(feature) {
            /* If the requested year does not have a null value: */
            if (feature.properties[year] !== null) {
                /* Add the year's population value to the histogram */
                values.push(feature.properties[year]);
            }
        });
    /* If the display mode is "relative": */
    } else if (mode === 'relative') {
        /* For each feature in the GeoJSON: */
        metros.features.forEach(function(feature) {
            /* If both the requested year and the year ten years prior do not have a null value: */
            if (feature.properties[year - 10] !== null && feature.properties[year] !== null) {
                /* Divide the population of the requested year by that of the year ten years prior */
                let pushValue = feature.properties[year] / feature.properties[year - 10];
                /* If the resulting value is less than 1 (i.e. the population decreased), invert the value - this ensures that, for example, a population decrease of 50% (halving) is considered as significant as an increase of 100% (doubling) */
                if (pushValue < 1) { pushValue = 1 / pushValue; };
                /* Add the value to the histogram */
                values.push(pushValue);
            }
        });
    }
    /* Get a sorted version of the histogram */
    let sorted = sort(values);
    /* Derive the 99th percentile value from the histogram */
    let max = sorted[(sorted.length * 0.99).toFixed(0) - 1];
    /* Derive the 1st percentile value from the histogram */
    let min = sorted[(sorted.length * 0.01).toFixed(0) - 1];
    
    /* Set the maximum area of a point symbol based on the map's zoom level; values increase as zoom level increases in a nearly exponential fashion */
    let maxArea = Math.PI * 0.8 * ((1.9 ** (map.getZoom() - 1)) ** 2);
    /* Set the minimum area of a point symbol to be 1/25th of the maximum area */
    let minArea = maxArea / 25;
    
    /* Update the legend */
    updateLegend(mode, min, max, minArea, maxArea);
    
    /* Reset the points layer, adding the new features */
    points = L.geoJSON(metros, {
        /* For each feature in the GeoJSON: */
        pointToLayer: function (feature, location) {
            /* If the display mode is "absolute": */
            if (mode === 'absolute') {
                /* Read the population for the selected year */
                let pop = feature.properties[year];
                /* If the population is not null: */
                if (pop !== null) {
                    /* Scale the population value to a value usually between 0 and 1, where 0 will represent the minimum symbol area and 1 the maximum */
                    let scaledPop = (pop - min) / (max - min);
                    /* Calculate an area from the scaled population value */
                    var area = ((maxArea - minArea) * scaledPop) + minArea;
                    /* If the calculated area exceeds the maximum allowed (only occurs if value exceeds 99th percentile), set it to the maxiumum allowed */
                    area = Math.min(maxArea, area);
                    /* Set the symbol's fill color to be blue */
                    var fillColor = '#4af';
                    /* Set the text that will display in the popup after the title, including the population and a note on the year it's from */
                    var specialText = '<p class="big">' + pop.toLocaleString() + '</p><p class="note">Population, ' + year + '</p>';
                /* If the population is null: */
                } else {
                    /* Stop trying to process this feature, as there are no data available to symbolize */
                    return null;
                }
            /* If the display mode is "relative": */
            } else if (mode === 'relative') {
                /* If the population in both the selected year and the year ten years prior are not null: */
                if (feature.properties[year - 10] !== null && feature.properties[year] !== null) {
                    /* Obtain the population change as a ratio by dividing the population in the selected year by the population ten years prior */
                    let change = feature.properties[year] / feature.properties[year - 10];
                    /* If the resulting ratio is less than 1 (loss in population), set the symbol's fill color to red-orange; if greater than 1 (gain in population), set to blue */
                    var fillColor = (change < 1 ? '#f64' : '#4af');
                    /* Convert the ratio to a percentage */
                    let changePct = (change - 1) * 100;
                    /* If the resulting percentage is less than zero, set the numeric sign to empty (it won't be needed for popup, as the negative sign will already be present); otherwise, set it to "+" */
                    let sign = (changePct < 0 ? '' : '+');
                    /* If the change ratio is less than 1 (loss in population), invert the value */
                    if (change < 1) {change = 1 / change};
                    /* Scale the change ratio to a value usually between 0 and 1, where 0 will represent the minimum symbol area and 1 the maximum */
                    let scaledChange = (change - min) / (max - min);
                    /* Calculate an area from the scaled ratio value */
                    var area = ((maxArea - minArea) * scaledChange) + minArea;
                    /* If the calculated area exceeds the maximum allowed (only occurs if value exceeds 99th percentile), set it to the maxiumum allowed */
                    area = Math.min(maxArea, area);
                    /* Convert the change percent to a more readable value, keeping only three significant figures and adding digit grouping as needed */
                    let changePctDisplay = Number(Number.parseFloat(changePct).toPrecision(3)).toLocaleString();
                    /* Set the text that will display in the popup after the title, including the percentage of change and a note on the years the value is dervied from */
                    var specialText = '<p class="big" style="color:' + (changePct < 0 ? '#f64' : '#4af') + '">' + sign + changePctDisplay + '%</p><p class="note">Change, ' + (year - 10) + ' to ' + year + '</p>';
                /* If either of the two population values (the selected year or ten years prior) are null: */
                } else {
                    /* Stop trying to process this feature, as there are no data available to symbolize */
                    return null;
                }
            }
            /* Create a style for the point symbol using the area and fill color determined above */
            let style = {
                radius: areaToRadius(area),
                fillColor: fillColor,
                color: '#fff',
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.7
            };
            /* Create a marker using the feature's geometry and the above style */
            let marker = L.circleMarker(location, style);
            /* Set some popup content, including the name of the metro area and the other text determined earlier (lines 166 and 195); also create a div that will contain a list of population values for every year available */
            let popupText = '<p class="title">' + feature.properties.NAME  + '</p>' + specialText + '<hr><div class="column">';
            /* For every possible year of data (1790 to 2010 in increments of 10): */
            for (i = 1790; i <= 2010; i += 10) {
                /* Read the population for year "i" */
                let pop = feature.properties[i];
                /* If the population of year "i" is not null: */
                if (pop !== null) {
                    /* If the user-selected year equals year "i", or if the display mode is "relative" and year "i" is ten years less than the user-selected year: */
                    if ((year === i) || (year - 10 === i && mode === 'relative')) {
                        /* Add year "i" and its population to the list of population values in the popup (text will be bold) */
                        popupText += '<p class="title">' + i + ': ' + pop.toLocaleString() + '</p>';
                    /* If the conditions on line 222 are not met, i.e. year "i" has nothing to do with the user-selected year: */
                    } else {
                        /* Add year "i" and its population to the list of population values in the popup (text will NOT be bold) */
                        popupText += '<p>' + i + ': ' + pop.toLocaleString() + '</p>';
                    }
                }
            }
            /* Close the div containing population values for every year */
            popupText += '</div>';
            /* Bind a popup to the marker with the now-complete popup content */
            marker.bindPopup(popupText);
            /* Return the now-complete marker, adding it to the layer */
            return marker;
        }
    });
    /* Add the points layer to the map if it isn't added already */
    points.addTo(map);
}

/* GET request for population values; only invoked once, at the initialization of the page */
$.get({
    /* URL to GeoJSON storing metro areas and related population values */
    url: 'data/population.json',
    /* Type of data to expect in return (JSON) */
    dataType: 'json',
    /* If the GET request succeeds: */
    success: function(response) {
        /* Dump the response into a "metros" object */
        metros = response;
        /* Add the metro area points to the map; initial view is for 2000s decade in "relative" display mode  */
        addPoints(2010, 'relative');
    }
});