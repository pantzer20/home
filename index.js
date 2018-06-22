'use strict';

const education = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-89.413, 43.076]
        },
        properties: {
            name: 'University of Wisconsin &ensp; Madison',
            locale: 'Madison, Wisconsin',
            start: new Date(2016, 8),
            end: new Date(),
            degree: 'Master of Sciences',
            major: 'Cartography and Geographic Information Systems',
            emphasis: 'Development',
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
            name: 'University of Wisconsin &ensp; Green Bay',
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
    }]
};

$('nav > div > div').on('mouseover', function() {
    $(this).find('.underline').css('width', $(this).width() + 'px');
});
$('nav > div > div').on('mouseout', function() {
    $('.underline').css('width', '0');
});

const employer = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-81.418, 28.5]
        },
        properties: {
            name: 'Orange County Board of County Commissioners',
            locale: 'Orlando, Florida',
            unit: 'Public Works Department',
            start: new Date(2017, 4),
            end: new Date(),
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
            coordinates: [-88.014, 44.514]
        },
        properties: {
            name: 'Brown County',
            locale: 'Green Bay, Wisconsin',
            unit: 'Planning and Land Services',
            start: new Date(2015, 0),
            end: new Date(2015, 3),
            narrative: ''
        }
    }]
};

mapboxgl.accessToken = 'pk.eyJ1IjoicGFudHplciIsImEiOiJjaXNna2wxbm0wMXc2MnludmJxc3QxanE5In0.z4TQn08v14lHWSgDJnWcDQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    dragRotate: false,
    touchZoomRotate: false
});

map.on('load', () => {
    map.fitBounds([[-105, 24], [-75, 51]], {
        duration: 0.1
    });
    map.on('moveend', () => {
        $('#map, header').addClass('visible');
    });
    map.addLayer({
        id: 'education',
        type: 'circle',
        source: {
            type: 'geojson',
            data: education
        }
    });
    map.addLayer({
        id: 'employer',
        type: 'circle',
        source: {
            type: 'geojson',
            data: employer
        }
    });
});