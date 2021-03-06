'use strict';

const present = new Date();

const data = {
    colors: {
        education: 'hsl(0, 70%, 65%)',
        employers: 'hsl(210, 70%, 65%)'
    },
    education: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-81.305, 28.744]
            },
            properties: {
                name: 'Seminole State College of Florida',
                locale: 'Sanford, Florida',
                start: new Date(2012, 5),
                end: new Date(2013, 11),
                degree: 'Associate of Arts',
                emphasis: 'Political Science',
                grade: 4,
                narrative: ''
            }
        }, {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-87.922, 44.532]
            },
            properties: {
                name: 'University of Wisconsin &ndash; Green Bay',
                locale: 'Green Bay, Wisconsin',
                start: new Date(2014, 4),
                end: new Date(2015, 4),
                degree: 'Bachelor of Arts',
                major: 'Urban and Regional Studies',
                emphasis: 'Urban and Regional Planning',
                minor: ['Environmental Policy and Planning', 'Geography'],
                grade: 3.78,
                narrative: ''
            }
        }, {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-89.413, 43.076]
            },
            properties: {
                name: 'University of Wisconsin &ndash; Madison',
                locale: 'Madison, Wisconsin',
                start: new Date(2016, 8),
                end: present,
                degree: 'Master of Sciences',
                major: 'Cartography and Geographic Information Systems',
                emphasis: 'Development',
                grade: 4,
                narrative: ''
            }
        }]
    },
    employers: {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-88.014, 44.514]
            },
            properties: {
                name: 'Brown County',
                short: 'Brown County (Wisconsin)',
                locale: 'Green Bay, Wisconsin',
                unit: 'Planning and Land Services',
                start: new Date(2015, 0),
                end: new Date(2015, 3),
                narrative: ''
            }
        }, {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-98.486, 45.463]
            },
            properties: {
                name: 'City of Aberdeen',
                short: 'Aberdeen (South Dakota)',
                locale: 'Aberdeen, South Dakota',
                unit: 'Planning and Zoning Department',
                start: new Date(2015, 7),
                end: new Date(2017, 4),
                narrative: ''
            }
        }, {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [-81.418, 28.5]
            },
            properties: {
                name: 'Orange County Board of County Commissioners',
                short: 'Orange County (Florida)',
                locale: 'Orlando, Florida',
                unit: 'Public Works Department',
                start: new Date(2017, 4),
                end: present,
                narrative: ''
            }
        }]
    },
    works: [{
        title: 'Sharing the Glass',
        subtitle: 'Achieving clean water and sanitation for all',
        medium: 'Web Map',
        date: new Date(2018, 4),
        narrative: '',
        thumbnail: '',
        url: 'https://jpantzlaff.github.io/water-sanitation-hygiene-map/'
    }, {
        title: 'Stacking the Deck',
        subtitle: 'Indicators of gerrymandering in United States congressional districts',
        medium: 'Web Map',
        date: new Date(2018, 3),
        narrative: '',
        thumbnail: '',
        url: ''
    }, {
        title: 'Boom, Bust, and Renewal',
        subtitle: 'The growth and demise of urban areas throughout American history',
        medium: 'Web Map',
        date: new Date(2018, 2),
        narrative: '',
        thumbnail: '',
        url: 'https://jpantzlaff.github.io/us-urban-population-history/'
    }, {
        title: 'All Votes Are Not Created Equal',
        subtitle: 'Disparities in the Electoral Power of American Citizens',
        medium: 'Web Map',
        date: new Date(2017, 7),
        narrative: '',
        thumbnail: '',
        url: ''
    }, {
        title: 'Vancouver Walkability',
        subtitle: '',
        medium: 'Web Map',
        date: new Date(2017, 4),
        narrative: '',
        thumbnail: '',
        url: ''
    }]
};

mapboxgl.accessToken = 'pk.eyJ1IjoicGFudHplciIsImEiOiJjaXNna2wxbm0wMXc2MnludmJxc3QxanE5In0.z4TQn08v14lHWSgDJnWcDQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    dragRotate: false,
    touchZoomRotate: false
});

let hoverPopup = new mapboxgl.Popup({
    closeButton: false,
    className: 'hover-popup'
});
let clickPopup = new mapboxgl.Popup({
    closeButton: false,
    className: 'click-popup'
});

map.on('load', () => {
    map.fitBounds([[-100, 27.3], [-79, 46.3]], {
        duration: 0.1,
        padding: {
            top: $('header').height(),
            bottom: 0,
            left: 0,
            right: 0
        }
    });
    
    map.on('moveend', () => {
        $('#map, header').addClass('visible');
    });
    
    map.addLayer({
        id: 'education',
        type: 'circle',
        source: {
            type: 'geojson',
            data: data.education
        },
        paint: {
            'circle-radius': 10,
            'circle-color': data.colors.education,
            'circle-blur': 0.5,
            'circle-opacity': 0,
            'circle-opacity-transition': {
                duration: 1000,
                delay: 0
            }
        }
    });
    
    map.addLayer({
        id: 'employers',
        type: 'circle',
        source: {
            type: 'geojson',
            data: data.employers
        },
        paint: {
            'circle-radius': 10,
            'circle-color': data.colors.employers,
            'circle-blur': 0.5,
            'circle-opacity': 0,
            'circle-opacity-transition': {
                duration: 1000,
                delay: 0
            }
        }
    });
    
    function featureHover(e) {
        const f = e.features[0];
        hoverPopup
            .setLngLat(f.geometry.coordinates)
            .setHTML(!!f.properties.short ? f.properties.short : f.properties.name)
            .addTo(map);
        console.log(e);
    }
    
    map.on('mouseenter', 'education', e => featureHover(e));    
    map.on('mouseenter', 'employers', e => featureHover(e));
    map.on('mouseleave', 'education', () => hoverPopup.remove());
    map.on('mouseleave', 'employers', () => hoverPopup.remove());
    
    setTimeout(() => makeActive('employers'), 800);
});

$('nav > div > div').on('mouseover', function() {
    $(this)
        .find('.underline')
        .css('width', $(this).width() + 'px');
});
$('nav > div > div').on('mouseout', function() {
    $('.underline:not(.active)').css('width', '0');
});
$('#education, #employers').on('click', function() {
    makeActive($(this).prop('id'));
});

function formatDate(date) {
    if (date === present) return 'present';
    else {
        const split = date.toDateString().split(' ');
        return split[1] + ' ' + split[3];
    }
}

function makeActive(layer) {
    const otherLayer = (layer === 'education' ? 'employers' : 'education');
    
    $(`#${layer}`)
        .find('.underline')
        .addClass('active')
        .css('width', $(`#${layer}`).width() + 'px');
    $(`#${otherLayer}`)
        .find('.underline')
        .removeClass('active')
        .css('width', 0);
    
    $('#timeline').removeClass('ready');
    
    map.setPaintProperty(otherLayer, 'circle-opacity', 0);
    setTimeout(() => {
        if (map.getPaintProperty(otherLayer, 'circle-opacity') === 0) map.setLayoutProperty(otherLayer, 'visibility', 'none');
    }, 1000);
    map.setLayoutProperty(layer, 'visibility', 'visible');
    map.setPaintProperty(layer, 'circle-opacity', 0.85);
    
    setTimeout(() => {
        const f = data[layer].features;
        const minDate = f[0].properties.start;
        const maxDate = f[f.length - 1].properties.end;
        const minVal = minDate.valueOf();
        const maxVal = maxDate.valueOf();
        const span = maxVal - minVal;
        $('#min-year').html(minDate.getFullYear());
        $('#max-year').html(maxDate.getFullYear());

        $('#timeline > div').html('');

        for (let i = 0; i < f.length; i++) {
            let width = (f[i].properties.end.valueOf() - f[i].properties.start.valueOf()) / span * 100;
            let margin;
            if (i < f.length - 1) {
                margin = (f[i + 1].properties.start.valueOf() - f[i].properties.end.valueOf()) / span * 100;
                if (margin < 0.5) {
                    margin = 0.5;
                    width -= 0.5;
                }
            }
            $('#timeline > div').append('<div>');
            $('#timeline > div > div:last-child')
                .css('width', width + '%')
                .css('background-color', data.colors[layer])
                .css('margin-right', (!!margin ? margin + '%' : '0'))
                .css('cursor', 'pointer')
                .on('click', [f[i].properties, layer], timelineHandler)
                .on('mouseover', [f[i].properties, layer], timelineHandler)
                .on('mouseout', [f[i].properties, layer], timelineHandler)
                .on('mousemove', [f[i].properties, layer], timelineHandler);
        }
        $('#timeline').addClass('ready');
    }, 500);
}

function activateFeature(layer, props) {
    
}

function timelineHandler(e) {
    const props = e.data[0];
    const layer = e.data[1];
    if (e.type === 'click') activateFeature(layer, props);
    else if (e.type === 'mousemove') {
        $('#timeline-tooltip')
            .css('top', (e.pageY - 30) + 'px')
            .css('left', (e.pageX + 10) + 'px')
    } else if (e.type === 'mouseover') {
        $('#timeline-tooltip')
            .html(`
                <div>
                    <p>${!!props.short ? props.short : props.name}</p>
                    <p>${formatDate(props.start)} - ${formatDate(props.end)}</p>
                    <p>Click for more information</p>
                </div>
            `)
            .css('top', (e.pageY - 30) + 'px')
            .css('left', (e.pageX + 10) + 'px')
            .css('opacity', '0.93');
    } else if (e.type === 'mouseout') $('#timeline-tooltip').css('opacity', '0');
}