import { inject } from 'vue';

const i18nKey = Symbol("i18n");
function useI18n() {
    const i18n = inject(i18nKey);
    if (!i18n) {
        throw new Error("inject() can only be used inside setup() or functional components.");
    }
    return i18n;
}

export { i18nKey, useI18n };
