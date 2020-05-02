const geokdbush = {};
(function() {
    'use strict';
    /*
    ISC License

    Copyright (c) 2017, Vladimir Agafonkin

    Permission to use, copy, modify, and/or distribute this software for any purpose
    with or without fee is hereby granted, provided that the above copyright notice
    and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
    FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
    OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
    THIS SOFTWARE.
    */
    var TinyQueue = function TinyQueue(data, compare) {
        if ( !data ) data = [];
        if ( !compare ) compare = defaultCompare;
        this.data = data;
        this.length = this.data.length;
        this.compare = compare;

        if (this.length > 0) {
            for (var i = (this.length >> 1) - 1; i >= 0; i--) { this._down(i); }
        }
    };

    TinyQueue.prototype.push = function push (item) {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    };

    TinyQueue.prototype.pop = function pop () {
        if (this.length === 0) { return undefined; }

        var top = this.data[0];
        var bottom = this.data.pop();
        this.length--;

        if (this.length > 0) {
            this.data[0] = bottom;
            this._down(0);
        }

        return top;
    };

    TinyQueue.prototype.peek = function peek () {
        return this.data[0];
    };

    TinyQueue.prototype._up = function _up (pos) {
        var ref = this;
            var data = ref.data;
            var compare = ref.compare;
        var item = data[pos];

        while (pos > 0) {
            var parent = (pos - 1) >> 1;
            var current = data[parent];
            if (compare(item, current) >= 0) { break; }
            data[pos] = current;
            pos = parent;
        }

        data[pos] = item;
    };

    TinyQueue.prototype._down = function _down (pos) {
        var ref = this;
            var data = ref.data;
            var compare = ref.compare;
        var halfLength = this.length >> 1;
        var item = data[pos];

        while (pos < halfLength) {
            var left = (pos << 1) + 1;
            var best = data[left];
            var right = left + 1;

            if (right < this.length && compare(data[right], best) < 0) {
                left = right;
                best = data[right];
            }
            if (compare(best, item) >= 0) { break; }

            data[pos] = best;
            pos = left;
        }

        data[pos] = item;
    };

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
    /*
    ISC License

    Copyright (c) 2017, Vladimir Agafonkin

    Permission to use, copy, modify, and/or distribute this software for any purpose
    with or without fee is hereby granted, provided that the above copyright notice
    and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
    FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
    OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
    TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
    THIS SOFTWARE.
    */

    var earthRadius = 6371;
    var earthCircumference = 40007;

    var rad = Math.PI / 180;

    function around(index, lng, lat, maxResults, maxDistance, predicate) {
        var result = [];

        if (maxResults === undefined) maxResults = Infinity;
        if (maxDistance === undefined) maxDistance = Infinity;

        var cosLat = Math.cos(lat * rad);
        var sinLat = Math.sin(lat * rad);

        // a distance-sorted priority queue that will contain both points and kd-tree nodes
        var q = new TinyQueue(null, compareDist);

        // an object that represents the top kd-tree node (the whole Earth)
        var node = {
            left: 0, // left index in the kd-tree array
            right: index.ids.length - 1, // right index
            axis: 0, // 0 for longitude axis and 1 for latitude axis
            dist: 0, // will hold the lower bound of children's distances to the query point
            minLng: -180, // bounding box of the node
            minLat: -90,
            maxLng: 180,
            maxLat: 90
        };

        while (node) {
            var right = node.right;
            var left = node.left;

            if (right - left <= index.nodeSize) { // leaf node

                // add all points of the leaf node to the queue
                for (var i = left; i <= right; i++) {
                    var item = index.points[index.ids[i]];
                    if (!predicate || predicate(item)) {
                        q.push({
                            index: i,
                            item: item,
                            dist: greatCircleDist(lng, lat, index.coords[2 * i], index.coords[2 * i + 1], cosLat, sinLat)
                        });
                    }
                }

            } else { // not a leaf node (has child nodes)

                var m = (left + right) >> 1; // middle index

                var midLng = index.coords[2 * m];
                var midLat = index.coords[2 * m + 1];

                // add middle point to the queue
                item = index.points[index.ids[m]];
                if (!predicate || predicate(item)) {
                    q.push({
                        item: item,
                        dist: greatCircleDist(lng, lat, midLng, midLat, cosLat, sinLat)
                    });
                }

                var nextAxis = (node.axis + 1) % 2;

                // first half of the node
                var leftNode = {
                    left: left,
                    right: m - 1,
                    axis: nextAxis,
                    minLng: node.minLng,
                    minLat: node.minLat,
                    maxLng: node.axis === 0 ? midLng : node.maxLng,
                    maxLat: node.axis === 1 ? midLat : node.maxLat,
                    dist: 0
                };
                // second half of the node
                var rightNode = {
                    left: m + 1,
                    right: right,
                    axis: nextAxis,
                    minLng: node.axis === 0 ? midLng : node.minLng,
                    minLat: node.axis === 1 ? midLat : node.minLat,
                    maxLng: node.maxLng,
                    maxLat: node.maxLat,
                    dist: 0
                };

                leftNode.dist = boxDist(lng, lat, leftNode, cosLat, sinLat);
                rightNode.dist = boxDist(lng, lat, rightNode, cosLat, sinLat);

                // add child nodes to the queue
                q.push(leftNode);
                q.push(rightNode);
            }

            // fetch closest points from the queue; they're guaranteed to be closer
            // than all remaining points (both individual and those in kd-tree nodes),
            // since each node's distance is a lower bound of distances to its children
            while (q.length && q.peek().item) {
                var candidate = q.pop();
                if (candidate.dist > maxDistance) return result;
                result.push({
                    coordinates: candidate.item,
                    index: candidate.index,
                    distance: candidate.dist
                });
                if (result.length === maxResults) return result;
            }

            // the next closest kd-tree node
            node = q.pop();
        }

        return result;
    }

    // lower bound for distance from a location to points inside a bounding box
    function boxDist(lng, lat, node, cosLat, sinLat) {
        var minLng = node.minLng;
        var maxLng = node.maxLng;
        var minLat = node.minLat;
        var maxLat = node.maxLat;

        // query point is between minimum and maximum longitudes
        if (lng >= minLng && lng <= maxLng) {
            if (lat <= minLat) return earthCircumference * (minLat - lat) / 360; // south
            if (lat >= maxLat) return earthCircumference * (lat - maxLat) / 360; // north
            return 0; // inside the bbox
        }

        // query point is west or east of the bounding box;
        // calculate the extremum for great circle distance from query point to the closest longitude
        var closestLng = (minLng - lng + 360) % 360 <= (lng - maxLng + 360) % 360 ? minLng : maxLng;
        var cosLngDelta = Math.cos((closestLng - lng) * rad);
        var extremumLat = Math.atan(sinLat / (cosLat * cosLngDelta)) / rad;

        // calculate distances to lower and higher bbox corners and extremum (if it's within this range);
        // one of the three distances will be the lower bound of great circle distance to bbox
        var d = Math.max(
            greatCircleDistPart(minLat, cosLat, sinLat, cosLngDelta),
            greatCircleDistPart(maxLat, cosLat, sinLat, cosLngDelta));

        if (extremumLat > minLat && extremumLat < maxLat) {
            d = Math.max(d, greatCircleDistPart(extremumLat, cosLat, sinLat, cosLngDelta));
        }

        return earthRadius * Math.acos(d);
    }

    function compareDist(a, b) {
        return a.dist - b.dist;
    }

    // distance using spherical law of cosines; should be precise enough for our needs
    function greatCircleDist(lng, lat, lng2, lat2, cosLat, sinLat) {
        var cosLngDelta = Math.cos((lng2 - lng) * rad);
        return earthRadius * Math.acos(greatCircleDistPart(lat2, cosLat, sinLat, cosLngDelta));
    }

    // partial greatCircleDist to reduce trigonometric calculations
    function greatCircleDistPart(lat, cosLat, sinLat, cosLngDelta) {
        var d = sinLat * Math.sin(lat * rad) +
                cosLat * Math.cos(lat * rad) * cosLngDelta;
        return Math.min(d, 1);
    }

    function distance(lng, lat, lng2, lat2) {
        return greatCircleDist(lng, lat, lng2, lat2, Math.cos(lat * rad), Math.sin(lat * rad));
    }
    geokdbush.around = around;
    geokdbush.distance = distance;
})();