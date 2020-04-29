const idwWorker = new Worker('js/idw.js');
let layerVisible = {
    grid: true,
    tractsIndex: false,
    tractsNitrate: false,
    wells: false
};
const legends = {
    grid: {
        gradient: 'rgba(241, 137, 255, 0) 0%, rgba(241, 137, 255, 0.7) 100%',
        values: ['-1.9', '7.5', '17.0'],
        attribute: 'Nitrates in Water (ppm)'
    },
    tractsIndex: {
        gradient: 'rgba(103, 169, 207, 0.7) 0%, rgba(103, 169, 207, 0) 33%, rgba(255, 170, 137, 0) 67%, rgba(255, 170, 137, 0.7) 100%',
        values: ['Both<br>Low', 'Not Similar/<br>Both Average', 'Both<br>High'],
        attribute: 'Similarity of Values'
    }
};
legends.tractsNitrate = legends.grid;

const chartLoad = new Promise((resolve) => {
    Chart.defaults.global.elements.point.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.global.elements.point.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.global.defaultFontColor = '#eee';
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.defaultFontFamily = "'Tajawal', sans-serif";
    Chart.defaults.global.maintainAspectRatio = false;
    Chart.defaults.global.showLines = false;
    const chart = new Chart($('#chart-canvas').get(0).getContext('2d'), {
        type: 'scatter',
        data: {}
    });
    resolve(chart);
});

mapboxgl.accessToken = 'pk.eyJ1IjoicGFudHplciIsImEiOiJjaXNna2wxbm0wMXc2MnludmJxc3QxanE5In0.z4TQn08v14lHWSgDJnWcDQ';
const mapLoad = new Promise((resolve) => {
    const m = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        maxZoom: 11.5,
        bounds: [[-93, 42.4], [-86.7, 47.2]],
        maxBounds: [[-98, 37.4], [-81.7, 52.2]],
        fitBoundsOptions: {
            padding: {
                top: 24,
                bottom: 4,
                left: 4,
                right: 4
            }
        }
    });
    m.on('idle', () => resolve(m));
    m.on('load', () => {
        const firstSymbolLayer = m.getStyle().layers.find((layer) => layer.type === 'symbol').id;
        for (let name of ['grid', 'tractsIndex', 'tractsNitrate']) {
            m.addSource(name, {
                type: 'geojson',
                data: {
                    features: [],
                    type: 'FeatureCollection'
                }
            });
            m.addLayer({
                id: name,
                type: 'fill',
                source: name,
                layout: {
                    visibility: (layerVisible[name] ? 'visible' : 'none')
                },
                paint: {
                    'fill-opacity': 0,
                    'fill-outline-color': 'rgba(0, 0, 0, 0)',
                    'fill-color': (name === 'tractsIndex')
                        ? {
                            property: 'index',
                            stops: [[0, '#67a9cf'], [0.99, '#67a9cf'], [1.01, '#ffaa89'], [2, '#ffaa89']]
                        }
                        : '#f189ff'
                }
            }, firstSymbolLayer);
        }
        m.addSource('wells', {
            type: 'geojson',
            data: {
                features: [],
                type: 'FeatureCollection'
            }
        });
        m.addLayer({
            id: 'wells',
            type: 'circle',
            source: 'wells',
            layout: {
                visibility: (layerVisible.wells ? 'visible' : 'none')
            },
            paint: {
                'circle-color': '#ddd',
                'circle-radius': [
                    'interpolate', ['linear'], ['zoom'], 7, 1, 11, 9
                ],
                'circle-blur': 0.85
            }
        }, 'tractsNitrate');
    });
});

mapLoad.then((map) => {
    map.on('idle', () => {
        const countdown = hideLoading(map);
        countdown.preempt();
        countdown.start();
    });
});

Promise.all([
    $.get('data/grid.json'),
    $.get('data/tracts.json'),
    $.get('data/wells.json')
]).then((responses) => {
    idwWorker.postMessage({
        power: 2,
        features: {
            grid: responses[0],
            tracts: responses[1],
            wells: responses[2]
        }
    });
    mapLoad.then((map) => {
        map.getSource('wells').setData(responses[2].objects.wells);
    });
});

idwWorker.onmessage = (message) => {
    const d = message.data;
    console.info(`Processing took ${d.seconds} seconds`);
    mapLoad.then((map) => {
        for (let layer of ['grid', 'tractsIndex', 'tractsNitrate']) {
            map.setPaintProperty(layer, 'fill-opacity', {
                property: (layer === 'tractsIndex') ? 'index' : 'nitrate',
                stops: (layer === 'tractsIndex')
                    ? [[0, 0.7], [0.67, 0], [1.33, 0], [2, 0.7]]
                    : [[d.nitrateMin, 0], [d.nitrateMax, 0.7]]
            });
            map.getSource(layer).setData(d[layer]);
        }
        updateVisibility();
    });
    chartLoad.then((chart) => {
        chart.data = {
            datasets: [{
                label: 'Tract-Level Nitrate Concentration by Cancer Rate',
                data: d.chartData
            }]
        };
        chart.update();
    });
    const reg = ss.linearRegression(d.regData);
    const regLine = ss.linearRegressionLine(reg);
    const r2 = ss.rSquared(d.regData, regLine);
    $('.m-stat').html(reg.m.toFixed(5));
    $('.b-stat').html(reg.b.toFixed(5));
    $('.r2-stat').html((r2 * 100).toFixed(2));
};

function hideLoading(map) {
    let timeout;
    const f = {};
    f.start = function() {
        timeout = setTimeout(() => {
            if (map.loaded()) {
                $('#loading').css('opacity', 0);
                setTimeout(() => $('#loading').hide(), 500);
                chartLoad.then((chart) => $('#print-chart').attr('src', chart.toBase64Image()));
            }
        }, 1000);
    };
    f.preempt = function() {
        if (timeout) clearTimeout(timeout);
    };
    return f;
}

function process(power) {
    mapLoad.then((map) => {
        idwWorker.postMessage({
            power: power
        });
        $('#loading')
            .show()
            .css('opacity', 1);
        for (let layer of ['grid', 'tractsIndex', 'tractsNitrate']) {
            map.setLayoutProperty(layer, 'visibility', 'none');
        }
    });
}

function switchLayer(desired) {
    for (let layer of ['grid', 'tractsIndex', 'tractsNitrate']) {
        layerVisible[layer] = (layer === desired);
    }
    updateVisibility();
}

function toggleWells(mode) {
    layerVisible.wells = Boolean(mode);
    updateVisibility();
}

function updateVisibility() {
    mapLoad.then((map) => {
        for (let layer in layerVisible) {
            map.setLayoutProperty(layer, 'visibility', (layerVisible[layer] ? 'visible' : 'none'));
            if (layerVisible[layer] && layer !== 'wells') updateLegend(layer);
        }
    });
}

function updateLegend(layer) {
    const l = legends[layer];
    $('#gradient').css('background-image', `linear-gradient(to right, ${l.gradient})`);
    $('#low').html(l.values[0]);
    $('#mid').html(l.values[1]);
    $('#high').html(l.values[2]);
}

/* Event listeners */
$('#data-select').on('input', function() {
    switchLayer($(this).val());
});
$('#wells-toggle').on('click', function() {
    if ($(this).attr('data-mode') === 'true') {
        toggleWells(false);
        $('#wells-true').removeClass('active');
        $('#wells-false').addClass('active');
        $(this).attr('data-mode', 'false');
    } else {
        toggleWells(true);
        $('#wells-false').removeClass('active');
        $('#wells-true').addClass('active');
        $(this).attr('data-mode', 'true');
    }
});
$('#settings-button, #chart-button, #legend-button').on('click', function() {
    const expands = $(this).attr('data-expands');
    const active = $(this).hasClass('active');
    $(`#${expands}-button`).attr('class', active ? '' : 'active');
    if (expands !== 'chart') $(`#${expands}-menu`).css('display', active ? 'none' : 'block');
    else $('#chart-menu').css('visibility', active ? 'hidden' : 'visible');
});
$('#idw-power').on('input', function() {
    const v = Number($(this).val());
    $('.current-power').html(v.toFixed(1));
});
$('#idw-power').on('change', function() {
    process(Number($(this).val()));
});