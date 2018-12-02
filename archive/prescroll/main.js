class Slide {
    constructor(options) {
        this.options = options;
        this.content = $('<div class="slide"></div>');
        this.image = $('<div class="image"></div>');
        this.image.css('background-image', `url("${options.image}")`);
        this.title = $(`<p class="slide-title">${options.title}</p>`);
        this.subtitle = $(`<p class="slide-subtitle">${options.subtitle}</p>`);
        this.base = $('<div class="slide-base c1"></div>')
          .append(this.title)
          .append(this.subtitle);
        this.content.append(this.base);
        
    }
    set visible(visible) {
        this.content.css('opacity', visible ? 1 : 0);
        this.image.css('opacity', visible ? 1 : 0);
    }
}
class Slideshow {
    constructor(root, element, slides, options) {
        this.root = root;
        this.element = element;
        this.options = options;
        this.slides = [];
        for (let i = 0, l = slides.length; i < l; i++) {
            const slide = new Slide(slides[i]);
            this.slides.push(slide);
            this.element.append(slide.content);
            this.root.prepend(slide.image);
        }
        this.active = 0;
    }
    get active() {
        return this.slides.findIndex((slide) => slide.content.css('opacity') !== '0');
    }
    set active(id) {
        if (this.timer) clearTimeout(this.timer);
        for (let i = 0, l = this.slides.length; i < l; i++) {
            this.slides[i].visible = (i === id);
        }
        this.timer = setTimeout(() => this.forward(), this.options.interval);
    }
    forward() {
        if (this.active === this.slides.length - 1) return this.active = 0;
        else return this.active += 1;
    }
    reverse() {
        if (this.active === 0) return this.active = this.slides.length - 1;
        else return this.active -= 1;
    }
}

const works = new Slideshow($('body'), $('#works'),
    [
        {
            title: 'Boom, Bust, and Renewal',
            subtitle: 'The growth and demise of urban areas throughout American history',
            medium: 'Application',
            image: './slides/boom-bust-renewal.png',
            url: ''
        }, {
            title: 'A Slient Flight',
            subtitle: 'Examining shifting populations in the United States',
            medium: 'Infographic',
            image: './slides/a-silent-flight.png',
            url: ''
        }, {
            title: 'Sharing the Glass',
            subtitle: 'Achieving clean water and sanitation for all',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: ''
        }/*, {
            title: 'Sharing the Glass',
            subtitle: 'Achieving clean water and sanitation for all',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: ''
        }, {
            title: 'Sharing the Glass',
            subtitle: 'Achieving clean water and sanitation for all',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: ''
        }, {
            title: 'Sharing the Glass',
            subtitle: 'Achieving clean water and sanitation for all',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: ''
        }*/
    ],
    {
        interval: 5000
    }
);
window.works = works;

const data = {
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
                end: 'present',
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
                end: 'present',
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

const nav = {
    elements: {
        'works': $('div[data-for="works"]'),
        'resume': $('div[data-for="resume"]'),
        'contact': $('div[data-for="contact"]')
    },
    set active(id) {
        if (!this.activeId || id !== this.activeId) {
            this.activeId = id;
            $.each(this.elements, (name, element) => {
                const underline = element.children('.underline');
                if (name === id) underline.css('width', '100%');
                else underline.css('width', '0');
            });
        }
    }
};

function getElementBounds() {
    return {
        window: {
            height: $(window).height()
        },
        header: $('header').get(0).getBoundingClientRect(),
        //slideshow: $('#slideshow').get(0).getBoundingClientRect(),
        resume: $('#resume').get(0).getBoundingClientRect()//,
        //footer: $('footer').get(0).getBoundingClientRect()
    }
}
let elementBounds = getElementBounds();

function setActive() {
    const viewBounds = $('body').get(0).getBoundingClientRect();
    if (viewBounds.bottom - 1 < elementBounds.window.height) nav.active = 'contact';
    else if (-viewBounds.top > (elementBounds.window.height / 2) - elementBounds.header.height) nav.active = 'resume';
    else nav.active = 'works';
}

$(window).on('load', () => {
    $(window).on('resize', () => elementBounds = getElementBounds());
    $(document).on('scroll', () => setActive());
    setActive();
});