importScripts('../lib/topojson-client.js');

const features = {};

onmessage = (message) => {
    const start = new Date();
    const data = message.data;
    if (data.features) ['grid', 'tracts', 'wells'].forEach((name) => {
        features[name] = topojson.feature(data.features[name], data.features[name].objects[name]);
    });
    const output = {};
    const nitrateValues = [];
    const cancerValues = [];
    for (let feature of features.grid.features) {
        const p = feature.properties;
        let n = 0;
        let d = 0;
        for (let id in p.near) {
            if (p.near[id] < 1) p.near[id] = 1;
            const v = p.near[id] ** data.power;
            n += features.wells.features[id].properties.nitrate / v;
            d += 1 / v;
        }
        p.nitrate = n / d;
        nitrateValues.push(p.nitrate);
    }
    output.nitrateMin = Math.min.apply(Math, nitrateValues);
    const nitrate0 = Math.abs(output.nitrateMin);
    output.nitrateMax = Math.max.apply(Math, nitrateValues);
    output.grid = features.grid;
    output.chartData = [];
    output.regData = [];
    for (let feature of features.tracts.features) {
        const p = feature.properties;
        p.nitrate = p.cells.reduce((sum, id) => sum + output.grid.features[id].properties.nitrate, 0) / p.cells.length;
        output.chartData.push({
            x: p.nitrate,
            y: p.rate
        });
        output.regData.push([p.nitrate, p.rate]);
        cancerValues.push(p.rate);
    }
    output.cancerMin = Math.min.apply(Math, cancerValues);
    const cancer0 = Math.abs(Math.min.apply(Math, cancerValues));
    output.cancerMax = Math.max.apply(Math, cancerValues);
    for (let feature of features.tracts.features) {
        const p = feature.properties;
        p.index = ((p.rate + cancer0) / (output.cancerMax + cancer0)) + ((p.nitrate + nitrate0) / (output.nitrateMax + nitrate0));
    }
    output.tractsIndex = output.tractsNitrate = features.tracts;
    const end = new Date();
    output.seconds = (end.valueOf() - start.valueOf()) / 1000;
    postMessage(output);
};