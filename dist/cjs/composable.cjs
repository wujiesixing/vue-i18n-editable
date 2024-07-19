'use strict';

var vue = require('vue');

const i18nKey = Symbol("i18n");
function useI18n() {
    const i18n = vue.inject(i18nKey);
    if (!i18n) {
        throw new Error("inject() can only be used inside setup() or functional components.");
    }
    return i18n;
}

exports.i18nKey = i18nKey;
exports.useI18n = useI18n;
