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
            start: 'September 2016',
            end: 'present',
            degree: 'Master of Sciences',
            major: 'Cartography and Geographic Information Systems',
            emphasis: 'Development',
            url: ''
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
            start: 'June 2014',
            end: 'May 2015',
            degree: 'Bachelor of Arts',
            major: 'Urban and Regional Studies',
            emphasis: 'Urban and Regional Planning',
            minor: ['Environmental Policy and Planning', 'Geography']
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
            start: 'June 2012',
            end: 'May 2013',
            degree: 'Associate of Arts',
            emphasis: 'Political Science'
        }
    }]
};

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
            start: 'May 2017',
            end: 'present'
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
            start: 'August 2015',
            end: 'May 2017'
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
            start: 'January 2015',
            end: 'April 2015'
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
        document.querySelector('#map').className = 'visible';
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