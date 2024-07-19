import type { App } from "vue";
type Lazy<T = unknown> = () => Promise<T>;
type Content = unknown | Lazy;
type Messages = Record<string, Content>;
interface RouteMessage {
    path: string | RegExp;
    content: Content;
}
interface Options {
    locale?: string;
    fallbackLocale?: string;
    messages?: Messages;
    ssrPathname?: string;
    routeMessages?: RouteMessage[];
}
export declare class I18n {
    private locale;
    private fallbackLocale?;
    private messages?;
    private cache;
    private ssrPathname;
    private routeMessages?;
    private routeCache;
    constructor(options: Options);
    private getLocale;
    private getPathname;
    setLocale(locale: string): Promise<void>;
    loadMessage(locale: string): Promise<unknown>;
    private finRouteMessage;
    setSsrPathname(pathname: string): Promise<void>;
    loadRouteMessage(pathname: string): Promise<unknown>;
    private getText;
    private getRouteText;
    private directive;
    t(key: string, locale?: string): any;
    rt(key: string, pathname?: string): any;
    install(app: App): void;
}
export declare function createI18n(options: Options): I18n;
export {};
