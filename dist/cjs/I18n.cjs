'use strict';

var lodashEs = require('lodash-es');
var vue = require('vue');
var composable = require('./composable.cjs');
var utils = require('./utils.cjs');

class I18n {
    locale = vue.ref();
    fallbackLocale;
    messages;
    cache = new Map();
    ssrPathname = vue.ref();
    routeMessages;
    routeCache = new Map();
    constructor(options) {
        this.locale.value = options.locale || options.fallbackLocale;
        this.fallbackLocale = options.fallbackLocale;
        this.messages = options.messages;
        this.ssrPathname.value = options.ssrPathname;
        this.routeMessages = options.routeMessages;
        this.getText = this.getText.bind(this);
        this.getRouteText = this.getRouteText.bind(this);
        this.t = this.t.bind(this);
        this.rt = this.rt.bind(this);
    }
    getLocale() {
        return this.locale.value || this.fallbackLocale;
    }
    getPathname() {
        return typeof window === "undefined"
            ? this.ssrPathname.value
            : window.location.pathname;
    }
    async setLocale(locale) {
        this.locale.value = locale;
        await this.loadMessage(locale);
    }
    async loadMessage(locale) {
        try {
            if (this.cache.has(locale)) {
                return this.cache.get(locale);
            }
            if (!this.messages) {
                throw new Error("Messages not defined");
            }
            let message = this.messages[locale];
            if (typeof message === "function") {
                message = await message().then((module) => module.default ? module.default : module);
            }
            if (!message) {
                throw new Error(`Message for locale ${locale} not found`);
            }
            this.cache.set(locale, message);
            return message;
        }
        catch (error) {
            utils.warn(error);
        }
    }
    finRouteMessage(pathname) {
        if (!this.routeMessages) {
            throw new Error("Route messages not defined");
        }
        const routeMessage = this.routeMessages.find(({ path }) => {
            if (typeof path === "string") {
                return utils.formatPath(path) === utils.formatPath(pathname);
            }
            else {
                return path.test(utils.formatPath(pathname));
            }
        });
        return routeMessage;
    }
    async setSsrPathname(pathname) {
        this.ssrPathname.value = pathname;
        await this.loadRouteMessage(pathname);
    }
    async loadRouteMessage(pathname) {
        try {
            const routeMessage = this.finRouteMessage(pathname);
            if (!routeMessage) {
                throw new Error(`Route message for pathname ${pathname} not found`);
            }
            if (this.routeCache.has(routeMessage)) {
                return this.routeCache.get(routeMessage);
            }
            let content = routeMessage.content;
            if (typeof content === "function") {
                content = await content().then((module) => module.default ? module.default : module);
            }
            if (!content) {
                throw new Error(`Content not defined for route message with pathname: ${pathname}`);
            }
            this.routeCache.set(routeMessage, content);
            return content;
        }
        catch (error) {
            utils.warn(error);
        }
    }
    getText(key, locale) {
        try {
            locale = locale ?? this.getLocale();
            if (!locale) {
                throw new Error("Locale not set");
            }
            let message;
            if (this.cache.has(locale)) {
                message = this.cache.get(locale);
            }
            return lodashEs.get(message, key) ?? "";
        }
        catch (error) {
            utils.warn(error);
            return "";
        }
    }
    getRouteText(key, pathname) {
        try {
            pathname = pathname ?? this.getPathname();
            if (!pathname) {
                throw new Error("Pathname not set");
            }
            const routeMessage = this.finRouteMessage(pathname);
            if (!routeMessage) {
                throw new Error(`Route message for pathname ${pathname} not found`);
            }
            let content;
            if (this.routeCache.has(routeMessage)) {
                content = this.routeCache.get(routeMessage);
            }
            return lodashEs.get(content, key) ?? "";
        }
        catch (error) {
            utils.warn(error);
            return "";
        }
    }
    directive(getText) {
        const register = (el, { value, modifiers, arg }, { props }) => {
            const { html } = modifiers;
            const text = getText(value, arg);
            if (html) {
                el.innerHTML = text;
            }
            else {
                el.textContent = text;
            }
            // contenteditable(el, value, html);
        };
        const unregister = (el) => {
            // uncontenteditable(el);
        };
        const update = (el, { value, modifiers, arg }, { props }) => {
            const { html } = modifiers;
            const text = getText(value, arg);
            if (html) {
                el.innerHTML = text;
            }
            else {
                el.textContent = text;
            }
        };
        const getSSRProps = ({ value, modifiers, arg }) => {
            const { html } = modifiers;
            const text = getText(value, arg);
            if (html) {
                return { innerHTML: text };
            }
            else {
                return { textContent: text };
            }
        };
        return {
            created: register,
            unmounted: unregister,
            beforeUpdate: update,
            getSSRProps,
        };
    }
    t(key, locale) {
        return this.getText(key, locale);
    }
    rt(key, pathname) {
        return this.getRouteText(key, pathname);
    }
    install(app) {
        app.config.globalProperties.$t = (key, locale) => this.getText(key, locale);
        app.config.globalProperties.$rt = (key, pathname) => this.getRouteText(key, pathname);
        app.provide(composable.i18nKey, {
            t: (key, locale) => this.getText(key, locale),
            rt: (key, pathname) => this.getRouteText(key, pathname),
            locale: this.locale,
            ssrPathname: this.ssrPathname,
        });
        app.directive("t", this.directive(this.getText));
        app.directive("rt", this.directive(this.getRouteText));
    }
}
function createI18n(options) {
    return new I18n(options);
}

exports.I18n = I18n;
exports.createI18n = createI18n;
