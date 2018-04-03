// Constants
const BAR_ADD_TIMEOUT = 50;
const MAX_BAR_VALUE = 1;
const PAGE_ROOT = window.location.origin + '/netneutrality/html/';
const HOME_URL = PAGE_ROOT + 'home.html';

const PACKAGES = {
    social: {
        name: 'Social Media',
        price: 4.99,
        includes: ['Facebook', 'Twitter', 'Snapchat']
    },
    video: {
        name: 'Basic Video Streaming',
        price: 1.99,
        includes: ['YouTube']
    },
    gaming: {
        name: 'Gaming',
        price: 3.50,
        includes: ['Twitch.tv', 'YouTube Gaming', 'Most gaming forums']
    }
};

const DISALLOWED = {
    youtube: {
        name: 'YouTube',
        package: 'video'
    },
    google: {
        name: 'Google',
        message: 'Use our featured search provider instead, Bing!'
    },
    twitter: {
        name: 'Twitter',
        package: 'social'
    },
    facebook: {
        name: 'Facebook',
        package: 'social'
    },

};

Array.prototype._remove = function (element) {
    this.splice(this.indexOf(element), 1);
};

Array.prototype.remove = function (element, all = true) {
    if (!this.includes(element)) {
        return;
    }

    if (all) {
        while (this.includes(element)) {
            this._remove(element);
        }
    } else {
        this._remove(element);
    }
};

class EventEmitter {
    constructor() {
        this._listeners = {};
    }

    _getListeners(event) {
        return this._listeners[event] || [];
    }

    _addListener(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }

        this._listeners[event].push(callback);
    }

    _validate(event) {
        if (typeof event !== 'string') {
            throw new TypeError('Expected type string for parameter event');
        }
    }

    emit(event, ...args) {
        this._validate(event);

        for (const listener of this._getListeners(event)) {
            listener(...args);
        }
    }

    on(event, callback) {
        this._validate(event);

        this._addListener(event, callback);
    }

    once(event, callback) {
        const singleEvent = () => {
            this._listeners[event].remove(singleEvent);
            callback();
        };

        this._addListener(event, singleEvent);
    }

    removeListener(event, callback) {
        this._validate(event);

        if (!this._listeners.hasOwnProperty(event)) {
            return;
        }

        for (let i = 0; i < this._listeners[event].length; i++) {
            if (this._listeners[event][i] === callback) {
                this._listeners[event].splice(i, 1);
                break;
            }
        }

        if (this._listeners[event].length === 0) {
            delete this._listeners[event];
        }
    }

    removeAllListeners(event) {
        if (!event) {
            this._listeners = {};
            return;
        }

        this._validate(event);

        if (!this._listeners.hasOwnProperty(event)) {
            return;
        }

        delete this._listeners[event];
    }
}

class PageProgressBar extends EventEmitter {
    constructor() {
        super();

        this.progress = 0;
        this.speedMultiplier = 1.0;
    }

    addTime() {
        if (this.progress >= MAX_BAR_VALUE) {
            this.element.style.opacity = 0.0;
            this.emit('done');
            return;
        }

        const add = ((Math.random() / 4) + 0.05) * this.speedMultiplier;

        this.progress = Math.min(this.progress + add, MAX_BAR_VALUE);

        this.element.value = this.progress;

        const timeoutAdd = Math.floor(Math.random() * BAR_ADD_TIMEOUT) - BAR_ADD_TIMEOUT;

        setTimeout(() => this.addTime(), BAR_ADD_TIMEOUT + timeoutAdd);
    }

    start(show = true) {
        if (!this.element) {
            this.element = document.getElementById('page-progress');

            if (!this.element) {
                throw new Error('Progress bar was not found');
            }
        }

        if (show) {
            this.element.style.opacity = 1.0;
        }

        this.progress = 0;

        setTimeout(() => this.addTime(), BAR_ADD_TIMEOUT * 5);
    }
}

class PopupModal extends EventEmitter {
    constructor({ title, subtitle, text, canBeClosed = true, id }) {
        super();

        $('body').append(`<div class="card popup-modal" id="${id}"></div>`);

        const modal = $(`#${id}`);

        if (canBeClosed) {
            modal.append(`<div id="${id}-close"><i class="material-icons" id="${id}-close-button">close</i></div>`);
        }

        modal.append(`<div id="${id}-title" class="title">${title}</div>`);

        if (subtitle) {
            modal.append(`<div id="${id}-subtitle" class="subtitle">${subtitle}</div>`);
        }

        modal.append(`<div id="${id}-body" class="body">${text}</div>`);

        $(`#${id}-close-button`).click(function () {
            modal.remove();
            this.emit('close');
        });
    }
}

const homeButton = $('#home-button');
const progressBar = new PageProgressBar();
const events = new EventEmitter();

function request(url) {
    return new Promise((resolve, reject) => {
        $.get(url, function (data, status) {
            if (status !== 'success') {
                return reject(new Error(status));
            }

            resolve(data);
        });
    });
}

function loadPage(url, speed = 1.0, internal = false, show) {
    for (const inclusion of Object.keys(DISALLOWED)) {
        if (!url.toLowerCase().includes(inclusion)) {
            continue;
        }

        const data = DISALLOWED[inclusion];

        let text;
        if (data.package) {
            const purchasePackage = PACKAGES[data.package];

            text = `Purchase the ${purchasePackage.name} package for only $${purchasePackage.price} per month to visit this site!`;
        } else {
            text = data.message || 'Sorry, but you can\'t visit this site.';
        }

        new PopupModal({ title: 'Site Visit Restricted', text, id: 'site-visit-restricted' });

        return;
    }

    events.emit('disable');

    if (internal) {
        $('iframe').hide();
        $('#site-container').show();
    } else {
        $('iframe').show();
        $('#site-container').hide();
    }

    progressBar.speedMultiplier = speed;

    progressBar.once('done', function () {
        loadPageActual(url, internal);
    });

    progressBar.start(show);
}

function loadPageInternal(url) {
    loadPage(PAGE_ROOT + url + '.html', undefined, true);
}

function loadPageActual(url, internal = false) {
    if (internal) {
        const site = $('#site-container');

        site.empty();

        request(url)
            .then((data) => {
                site.append(data);
                events.emit('page', url);
            })
            .catch((e) => {
                site.append('<article class="error">Unable to load webpage. Please try again later.</article>');
            });
    } else {
        $('iframe').attr('src', url);
    }
}

events.on('page', function (url) {
    if (url === HOME_URL) {
        homeButton.hide();
    } else {
        homeButton.show();
    }
});

$(document).ready(function () {
    $('#url-form').submit(function (e) {
         e.preventDefault();

         const urlBar = $('#url-bar');

         const url = urlBar.val().trim();

         if (!url) {
             return;
         }

         urlBar.val('');

         loadPage(window.location.origin + '/api/proxy?url=' + encodeURI(url));
    });

    $('#home-button').click(function () {
        loadPage(HOME_URL, 1, true);
    });

    loadPage(HOME_URL, 3, true, false);
});
