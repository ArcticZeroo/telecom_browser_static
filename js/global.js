// Constants
const BAR_ADD_TIMEOUT = 50;
const MAX_BAR_VALUE = 1;
const PAGE_ROOT = window.location.origin + '/netneutrality/html/';
const HOME_URL = PAGE_ROOT + 'home.html';

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
