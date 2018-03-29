// Constants
const BAR_ADD_TIMEOUT = 50;
const MAX_BAR_VALUE = 1;

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
    }

    addTime() {
        if (this.progress >= MAX_BAR_VALUE) {
            return;
        }

        const add = (Math.random() / 4) + 0.05;

        this.progress = Math.min(this.progress + add, MAX_BAR_VALUE);

        this.element.value = this.progress;

        const timeoutAdd = Math.floor(Math.random() * BAR_ADD_TIMEOUT) - BAR_ADD_TIMEOUT;

        setTimeout(() => this.addTime(), BAR_ADD_TIMEOUT + timeoutAdd);
    }

    start() {
        this.element = document.getElementById('page-progress');

        if (!this.element) {
            throw new Error('Progress bar was not found');
        }

        setTimeout(() => this.addTime(), BAR_ADD_TIMEOUT * 2);
    }
}

const progressBar = new PageProgressBar();

$(document).ready(function () {
    progressBar.start();
});