class Slide {
    constructor(options) {
        this.options = options;
        this.content = $(`<a class="slide" href="${options.url}"></a>`);
        this.image = $('<div class="image"></div>');
        this.image.css('background-image', `url("${options.image}")`);
        this.title = $(`<p class="slide-title">${options.title}</p>`);
        this.subtitle = $(`<p class="slide-subtitle">${options.subtitle}</p>`);
        this.button = $(`<button class="slide-button">View ${options.medium}</button>`);
        this.baseL = $('<div>')
          .append(this.title)
          .append(this.subtitle);
        this.baseR = $('<div>')
          .append(this.button);
        this.base = $('<div class="slide-base c1"></div>')
          .append(this.baseL)
          .append(this.baseR);
        this.content.append(this.base);
    }
    set visible(visible) {
        this.content
          .css('opacity', visible ? 1 : 0)
          .css('pointer-events', visible ? 'auto' : 'none');
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
        this.left = $('<button class="reverse c1" type="button"></button>')
          .html('<span class="fas fa-chevron-left"></span>')
          .on('click', () => this.reverse());
        this.right = $('<button class="forward c1" type="button"></button>')
          .html('<span class="fas fa-chevron-right"></span>')
          .on('click', () => this.forward());
        this.element
          .append(this.left)
          .append(this.right);
        this.active = 0;
    }
    get active() {
        return this.activeId;
    }
    set active(id) {
        this.activeId = id;
        if (this.timer) clearTimeout(this.timer);
        for (let i = 0, l = this.slides.length; i < l; i++) {
            this.slides[i].visible = (i === id);
        }
        this.timer = setTimeout(() => this.forward(), this.options.interval);
    }
    resume() {
        this.active = this.activeId;
    }
    suspend() {
        if (this.timer) clearTimeout(this.timer);
    }
    forward() {
        if (this.active === this.slides.length - 1) this.active = 0;
        else this.active += 1;
    }
    reverse() {
        if (this.active === 0) this.active = this.slides.length - 1;
        else this.active -= 1;
    }
}

const works = new Slideshow(
    $('body'),
    $('#works'),
    [
        {
            title: 'Boom, Bust, and Renewal',
            subtitle: 'Growth and demise in urban areas throughout American history',
            medium: 'Application',
            image: './slides/boom-bust-renewal.png',
            url: './projects/boom-bust-renewal/'
        }, {
            title: 'A Slient Flight',
            subtitle: 'Shifting populations in the United States',
            medium: 'Infographic',
            image: './slides/a-silent-flight.png',
            url: './projects/a-silent-flight.png'
        }, {
            title: 'Sharing the Glass',
            subtitle: 'Water and sanitation availability in Africa and South Asia<br><a class="award" href="http://nacis.org/awards/student-dynamic-map-competition/"><span class="fas fa-award"></span>2018 Winner &ndash; NACIS Student Dynamic Mapping Competition</a>',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: './projects/sharing-the-glass/'
        }, /* {
            title: 'PlatMaster',
            subtitle: 'A document georeferencer focused on survey-grade precision',
            medium: 'Application',
            image: './slides/sharing-the-glass.png',
            url: './projects/sharing-the-glass/'
        }, {
            title: 'Not All Votes Are Created Equal',
            subtitle: 'Individual vote power in U.S. federal elections',
            medium: 'Application',
            image: './slides/not-all-votes-are-created-equal.png',
            url: './projects/not-all-votes-are-created-equal/'
        } */
    ],
    {
        interval: 6000
    }
);

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
for (let e in nav.elements) {
    nav.elements[e].on('click', () => scrollToSection(e));
}

function getElementBounds() {
    return {
        window: {
            height: $(window).height()
        },
        body: $('body').get(0).getBoundingClientRect(),
        header: $('header').get(0).getBoundingClientRect(),
        resume: $('#resume').get(0).getBoundingClientRect(),
        contact: $('#contact').get(0).getBoundingClientRect()
    }
}
let elementBounds = getElementBounds();

function scrollToSection(target) {
    if (target === 'works') {
        $('#works').get(0).scrollIntoView();
    } else if (target === 'resume') {
        if (elementBounds.header.height + elementBounds.resume.height < elementBounds.window.height) {
            window.scroll(0, elementBounds.body.height - elementBounds.window.height - elementBounds.contact.height);
        } else {
            window.scroll(0, elementBounds.window.height - elementBounds.header.height);
        }
    } else if (target === 'contact') {
        $('#contact').get(0).scrollIntoView();
    }
}

function setActive() {
    const viewBounds = $('body').get(0).getBoundingClientRect();
    if (viewBounds.bottom - 10 < elementBounds.window.height) {
        nav.active = 'contact';
        $('.slide-base, .reverse, .forward').addClass('hidden');
    }
    else if (-viewBounds.top > (elementBounds.window.height / 2) - elementBounds.header.height) {
        nav.active = 'resume';
        $('.slide-base, .reverse, .forward').addClass('hidden');
    }
    else {
        nav.active = 'works';
        $('.slide-base, .reverse, .forward').removeClass('hidden');
    }
}

$(window).on('load', () => {
    $(window).on('resize', () => elementBounds = getElementBounds());
    $(document).on('scroll', () => setActive());
    setTimeout(() => setActive(), 1500);
});