'use strict';

let inPark = true;
let welcomed = false;
let autopan = true;
let currentPosition;
const reposition = new Event('reposition');

mapboxgl.accessToken = 'pk.eyJ1IjoicGFudHplciIsImEiOiJjaXNna2wxbm0wMXc2MnludmJxc3QxanE5In0.z4TQn08v14lHWSgDJnWcDQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    bounds: [[-73.97301, 40.76231], [-73.95814, 40.80261]],
    maxBounds: [[-73.993, 40.75231], [-73.939, 40.81261]],
    pitchWithRotate: false,
    dragRotate: false
})
    .setBearing(29)
    .addControl(new mapboxgl.NavigationControl());

const mapLoaded = new Promise((resolve) => {
    map.once('load', () => resolve(map));
});

/* Park boundaries */
const bounds = new Promise((resolve, reject) => {
    $.get('https://johnathon.pantzlaff.net/projects/park/services/layer/bounds').then(
        (data) => resolve(topojson.feature(data, data.objects.bounds)),
        (error) => reject(error)
    );
});

const updateActivities = function(reason=null) {
    const text = $('#help-text');
    if (welcomed) {
        if (inPark) text.html("What else would you like to do?");
        else text.html("What else do you like to do?");
    } else {
        if (inPark) $('.in-park').css('display', 'block');
        else $('.out-park').css('display', 'block');
        if (reason) {
            if (reason === 'outside') {
                $('#help-text').html("You're not at the park, but you can still plan your next trip! What do you like to do?");
            } else if (reason === 'unavailable') {
                $('#help-text').html("We can't find your location, but we can still help you explore the park! What do you like to do?");
            } else {
                $('#help-text').html("Okay, we understand. We won't be able to help you find your way, but you can still explore the park! What do you like to do?");
            }
        } else {
            $('#help-text').html("Welcome to the park! What would you like to do?");
        }
        welcomed = true;
    }
    mapLoaded.then((map) => map.resize());
};

const submitPhoto = function() {
    $('#image-form').css('display', 'none');
    $('#submitting').css('display', 'flex');
    $('#lat').val(currentPosition[1].toString());
    $('#lon').val(currentPosition[0].toString());
    const form = $('#image-form').get(0);
    const data = new FormData(form);
    $.post({
        url: 'services/submit/photo',
        data: data,
        cache: false,
        contentType: false,
        processData: false
    }).done(() => {
        form.reset();
        $('#camera-modal').css('display', 'none');
        $('#submitting').css('display', 'none');
        $('#image-form').css('display', 'flex');
    }).fail(() => {
        form.reset();
        $('#camera-modal').css('display', 'none');
        $('#submitting').css('display', 'none');
        $('#image-form').css('display', 'flex');
    });
};
$('#image-file').on('change', () => submitPhoto());

if ('geolocation' in navigator) {
    $('#permissions-modal').css('display', 'flex');
    const g = navigator.geolocation;
    const reqLocPerm = g.getCurrentPosition(
        (position) => {
            $('#permissions-modal').css('display', 'none');
            bounds.then((b) => {
                const c = position.coords;
                /* If inside the park: */
                if (turf.booleanWithin(turf.point([c.longitude, c.latitude]), turf.polygon(b.features[0].geometry.coordinates))) {
                    currentPosition = [c.longitude, c.latitude];
                    let positionLayerLoaded;
                    mapLoaded.then((map) => {
                        map.addSource('position', {
                            type: 'geojson',
                            data: {
                                type: 'Point',
                                coordinates: currentPosition
                            }
                        });
                        positionLayerLoaded = new Promise((resolve) => {
                            const resolver = () => {
                                if (map.isSourceLoaded('position')) {
                                    map.addLayer({
                                        id: 'position',
                                        type: 'circle',
                                        source: 'position',
                                        paint: {
                                            'circle-radius': 8,
                                            'circle-color': '#4285f4',
                                            'circle-stroke-width': 2,
                                            'circle-stroke-color': '#ffffff'
                                        }
                                    });
                                    resolve();
                                    map.off('sourcedata', resolver);
                                }
                            };
                            map.on('sourcedata', resolver);
                        });
                        if (autopan) {
                            map.jumpTo({
                                center: currentPosition,
                                zoom: 18,
                                bearing: 29
                            });
                        }
                    });
                    const locWatch = g.watchPosition(
                        (success) => {
                            const c = success.coords;
                            currentPosition = [c.longitude, c.latitude];
                            mapLoaded.then((map) => {
                                positionLayerLoaded.then(() => {
                                    $('body').trigger('reposition');
                                    map.getSource('position').setData({
                                        type: 'Point',
                                        coordinates: currentPosition
                                    });
                                    if (autopan) {
                                        map.easeTo({
                                            center: currentPosition,
                                            zoom: 18,
                                            bearing: 29
                                        });
                                    }
                                });
                            });
                        },
                        (error) => console.error(error),
                        {
                            enableHighAccuracy: true,
                            maximumAge: 5000
                        }
                    );
                    updateActivities();
                } else {
                    inPark = false;
                    updateActivities('outside');
                }
            });
        },
        (error) => {
            inPark = false;
            $('#permissions-modal').css('display', 'none');
            if (error.code === 1) updateActivities('denied');
            else updateActivities('unavailable');
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000
        }
    );
} else {
    inPark = false;
    updateActivities('unavailable');
}

const Layer = class {
    constructor(options) {
        this.options = options;
        this.parent = this.options.container;
        this.element = $('<div class="layer"></div>');
        this.parent.append(this.element);
        this.options.button.on('click', () => {
            $('#help-text').html(this.options.message);
            $('#activities').css('display', 'none');
            mapLoaded.then((map) => map.resize());
            for (let layer of Object.values(layers)) {
                layer.visible = false;
            }
            if (inPark) this.near(currentPosition);
            else this.populateResults();
            this.visible = true;
        });
        this.url = 'services/layer/' + this.options.name;
        $.get(this.url).then((data) => {
            this.geojson = topojson.feature(data, data.objects[this.options.name]);
            this.features = this.geojson.features;
            this.geomType = this.features[0].geometry.type;
            this.coordIndex = {};
            for (let i = 0, l = this.features.length; i < l; i++) {
                const feature = Object.assign({}, this.features[i]);
                const c = ((feature.geometry.type === 'Point') ? feature.geometry.coordinates : turf.centerOfMass(feature).geometry.coordinates).toString();
                this.coordIndex[c] = feature;
                this.coordIndex[c].origIndex = i;
            }
            mapLoaded.then((map) => {
                map.loadImage(`img/${this.options.name}.png`, (error, image) => {
                    map.addImage(this.options.name, image);
                    map.addLayer({
                        id: this.options.name,
                        type: 'symbol',
                        source: {
                            type: 'geojson',
                            data: this.geojson
                        },
                        layout: {
                            visibility: 'none',
                            'icon-image': this.options.name,
                            'icon-size': 0.1
                        }
                    });
                    if (this.options.name === 'playground') {
                        setTimeout(() => {
                            $('body').css('visibility', 'visible');
                        }, 1500);
                    }
                });
            });
            if (this.options.search) {
                this.fuse = new Fuse(
                    Array.from(this.features, (feature) => feature.properties[this.options.search]),
                    {
                        shouldSort: true,
                        threshold: 0.6,
                        maxPatternLength: 10
                    }
                );
                this.searchbar = $(`<input class="light-green" type="text" placeholder="Find a ${this.options.standin.toLowerCase()}&hellip;">`)
                    .on('input', () => {
                        const v = this.searchbar.val();
                        if (v.length > 0) {
                            this.search(v);
                        } else {
                            if (inPark) this.near(currentPosition);
                            else this.populateResults();
                        }
                    });
                this.element.append(this.searchbar);
            }
            this.results = $('<div class="results"></div>');
            this.element.append(this.results);
            if (this.options.name === 'photo') {
                this.camera = $('<button class="light-green back"><i class="fas fa-camera"></i>Submit a photo</button>')
                    .on('click', () => $('#camera-modal').css('display', 'flex'));
                this.element.append(this.camera);
            }
            this.back = $('<button class="light-green back"><i class="fas fa-undo"></i>Do something else</button>')
                .on('click', () => {
                    autopan = true;
                    map.dragPan._state = 'enabled';
                    $('body').off('reposition');
                    this.results.css('display', 'flex');
                    if (this.searchbar) {
                        this.searchbar
                            .css('display', 'inline-block')
                            .val('');
                    }
                    map.resize();
                    if (currentPosition) {
                        map.easeTo({
                            center: currentPosition,
                            zoom: 18,
                            bearing: 29,
                            pitch: 0
                        });
                    } else {
                        map
                            .setBearing(29)
                            .setPitch(0);
                    }
                    this.visible = false;
                    $('#activities').css('display', 'flex');
                    updateActivities();
                    map.resize();
                });
            this.element.append(this.back);
            this.kdbush = new KDBush(
                Array.from(this.features, (feature) => {
                    if (feature.geometry.type === 'Polygon') {
                        return turf.centerOfMass(feature).geometry.coordinates;
                    } else {
                        return feature.geometry.coordinates;
                    }
                })
            );
        });
    }
    populateResults(indices=null) {
        if (this.features) {
            this.results.html('');
            if (!indices) {
                indices = [...Array(Math.min(this.features.length, 5)).keys()];
            }
            for (let index of indices) {
                const feature = this.features[index];
                const c = ((feature.geometry.type === 'Point') ? feature.geometry.coordinates : turf.centerOfMass(feature).geometry.coordinates);
                const dist = (currentPosition)
                    ? '<i class="fas fa-map-signs"></i>' + Math.round(
                        geokdbush.distance(currentPosition[0], currentPosition[1], c[0], c[1]) * 1000
                    ).toLocaleString() + ' m'
                    : '<i class="fas fa-search"></i>View';
                const resultButton = $(`
                    <button class="dark-green">
                        <p class="feature-name">${feature.properties[this.options.search] || this.options.standin}</p>
                        <p class="feature-distance">${dist}</p>
                    </button>
                `)
                    .on('click', () => {
                        if (currentPosition) {
                            autopan = false;
                            map.dragPan._state = 'disabled';
                            this.results.css('display', 'none');
                            if (this.searchbar) this.searchbar.css('display', 'none');
                            $('#help-text').html(`
                                <p class="destination-head">Heading toward</p>
                                <p class="destination">${feature.properties[this.options.search] || this.options.standin}</p>
                            `);
                            if (this.options.name === 'photo') {
                                $.get(`https://johnathon.pantzlaff.net/projects/park/services/layer/photo?id=${feature.properties.ogc_fid}`).then((data) => {
                                    const base64 = data.objects.photo.geometries[0].properties.photo;
                                    $('#help-text')
                                        .append(`<img src="${base64}">`)
                                        .ready(() => {
                                            map.resize();
                                            $('body').trigger('reposition');
                                        });
                                });
                            }
                            map.resize();
                            $('body')
                                .on('reposition', () => {
                                    map
                                    .setPitch(60)
                                    .fitScreenCoordinates(
                                        map.project(currentPosition),
                                        map.project(c),
                                        turf.bearing({type: 'Point', coordinates: currentPosition}, c),
                                        {
                                            padding: {
                                                top: -10,
                                                bottom: 10,
                                                left: 0,
                                                right: 0
                                            }
                                        }
                                    );
                                })
                                .trigger('reposition');
                        } else {
                            map.flyTo({
                                center: c,
                                zoom: 17,
                                bearing: 29
                            });
                        }
                        map.setPaintProperty(this.options.name, 'icon-opacity', [
                            'match',
                            ['get', 'ogc_fid'],
                            feature.properties.ogc_fid, 1,
                            0.33
                        ]);
                    });
                this.results.append(resultButton);
            }
        }
    }
    near(coordinates) {
        const knn = geokdbush.around(this.kdbush, coordinates[0], coordinates[1], 5);
        this.populateResults(
            Array.from(knn, (result) => this.coordIndex[result.coordinates.toString()].origIndex)
        );
    }
    search(text) {
        if (this.fuse) {
            this.populateResults(this.fuse.search(text).slice(0, 5));
        }
    }
    set visible(visible) {
        this.element.css('display', (visible) ? 'block': 'none');
        map.setLayoutProperty(this.options.name, 'visibility', (visible) ? 'visible': 'none');
        map.resize();
    }
};

const layersDiv = $('#layers');
const layers = {
    baseball: new Layer({
        button: $('#baseball'),
        container: layersDiv,
        map: map,
        message: "You're in luck! Central Park has 26 diamonds.",
        name: 'baseball',
        search: 'name',
        standin: 'Baseball diamond'
    }),
    drinking: new Layer({
        button: $('#drink'),
        container: layersDiv,
        map: map,
        message: "Good call! Here's where you can stay hydrated.",
        name: 'drinking_fountain',
        standin: 'Drinking fountain'
    }),
    fountains: new Layer({
        button: $('#fountain'),
        container: layersDiv,
        map: map,
        message: "Water makes any day more relaxing, doesn't it?",
        name: 'fountain',
        search: 'name',
        standin: 'Water fountain'
    }),
    photo: new Layer({
        button: $('#photo'),
        container: layersDiv,
        map: map,
        message: 'We love photos, too! Share your shots and explore those of others!',
        name: 'photo',
        search: 'comment',
        standin: 'Photo'
    }),
    playground: new Layer({
        button: $('#play'),
        container: layersDiv,
        map: map,
        message: 'Swings and slides, coming right up!',
        name: 'playground',
        search: 'name',
        standin: 'Playground'
    }),
    statue: new Layer({
        button: $('#statue'),
        container: layersDiv,
        map: map,
        message: "From historical figures to cartoon characters, 26 statues await your gaze.",
        name: 'statue',
        search: 'name',
        standin: 'Statue'
    })
};