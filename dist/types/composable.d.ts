import type { InjectionKey, Ref } from "vue";
export declare const i18nKey: InjectionKey<{
    t: (key: string, locale?: string) => any;
    rt: (key: string, pathname?: string) => any;
    locale: Ref<string | undefined>;
    ssrPathname: Ref<string | undefined>;
}>;
export declare function useI18n(): {
    t: (key: string, locale?: string) => any;
    rt: (key: string, pathname?: string) => any;
    locale: Ref<string | undefined>;
    ssrPathname: Ref<string | undefined>;
};
