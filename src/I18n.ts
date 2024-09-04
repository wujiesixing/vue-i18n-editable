import { get } from "lodash-es";
import { ref } from "vue";

import { i18nKey } from "./composable";
import { formatPath, warn } from "./utils";

import type {
  App,
  DirectiveBinding,
  DirectiveHook,
  ObjectDirective,
  VNode,
} from "vue";

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

type Data = Record<string, unknown>;

type SSRDirectiveHook<V> = (
  binding: DirectiveBinding<V>,
  vnode: VNode
) => Data | undefined;

export class I18n {
  private locale = ref<string>();
  private fallbackLocale?: string;
  private messages?: Messages;
  private cache = new Map<string, Content>();

  private ssrPathname = ref<string>();
  private routeMessages?: RouteMessage[];
  private routeCache = new Map<RouteMessage, Content>();

  public constructor(options: Options) {
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

  private getLocale() {
    return this.locale.value || this.fallbackLocale;
  }

  private getPathname() {
    return typeof window === "undefined"
      ? this.ssrPathname.value
      : window.location.pathname;
  }

  public async setLocale(locale: string) {
    this.locale.value = locale;
    await this.loadMessage(locale);
  }

  public async loadMessage(locale: string) {
    try {
      if (this.cache.has(locale)) {
        return this.cache.get(locale);
      }

      if (!this.messages) {
        throw new Error("Messages not defined");
      }

      let message = this.messages[locale];

      if (typeof message === "function") {
        message = await message();
      }

      if (!message) {
        throw new Error(`Message for locale ${locale} not found`);
      }

      this.cache.set(locale, message);

      return message;
    } catch (error) {
      warn(error as Error);
    }
  }

  private finRouteMessage(pathname: string) {
    if (!this.routeMessages) {
      throw new Error("Route messages not defined");
    }

    const routeMessage = this.routeMessages.find(({ path }) => {
      if (typeof path === "string") {
        return formatPath(path) === formatPath(pathname);
      } else {
        return path.test(formatPath(pathname));
      }
    });

    return routeMessage;
  }

  public async setSsrPathname(pathname: string) {
    this.ssrPathname.value = pathname;
    await this.loadRouteMessage(pathname);
  }

  public async loadRouteMessage(pathname: string) {
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
        content = await content();
      }

      if (!content) {
        throw new Error(
          `Content not defined for route message with pathname: ${pathname}`
        );
      }

      this.routeCache.set(routeMessage, content);

      return content;
    } catch (error) {
      warn(error as Error);
    }
  }

  private getText(key: string, locale?: string) {
    try {
      locale = locale ?? this.getLocale();

      if (!locale) {
        throw new Error("Locale not set");
      }

      let message: Content;

      if (this.cache.has(locale)) {
        message = this.cache.get(locale);
      }

      return get(message, key) ?? "";
    } catch (error) {
      warn(error as Error);
      return "";
    }
  }

  private getRouteText(key: string, pathname?: string) {
    try {
      pathname = pathname ?? this.getPathname();

      if (!pathname) {
        throw new Error("Pathname not set");
      }

      const routeMessage = this.finRouteMessage(pathname);

      if (!routeMessage) {
        throw new Error(`Route message for pathname ${pathname} not found`);
      }

      let content: Content;

      if (this.routeCache.has(routeMessage)) {
        content = this.routeCache.get(routeMessage);
      }

      return get(content, key) ?? "";
    } catch (error) {
      warn(error as Error);
      return "";
    }
  }

  private directive<T extends Element, V extends string>(
    getText: (key: string, arg?: string) => string
  ): ObjectDirective<T, V> {
    const register: DirectiveHook<T, null, V> = (
      el,
      { value, modifiers, arg },
      { props }
    ): void => {
      const { html } = modifiers;
      const text = getText(value, arg);
      if (html) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
      // contenteditable(el, value, html);
    };

    const unregister: DirectiveHook<T, null, V> = (el): void => {
      // uncontenteditable(el);
    };

    const update: DirectiveHook<T, VNode<any, T>, V> = (
      el,
      { value, modifiers, arg },
      { props }
    ): void => {
      const { html } = modifiers;
      const text = getText(value, arg);
      if (html) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    };

    const getSSRProps: SSRDirectiveHook<V> = ({ value, modifiers, arg }) => {
      const { html } = modifiers;
      const text = getText(value, arg);
      if (html) {
        return { innerHTML: text };
      } else {
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

  public t(key: string, locale?: string) {
    return this.getText(key, locale);
  }

  public rt(key: string, pathname?: string) {
    return this.getRouteText(key, pathname);
  }

  public install(app: App) {
    app.config.globalProperties.$t = (key: string, locale?: string) =>
      this.getText(key, locale);
    app.config.globalProperties.$rt = (key: string, pathname?: string) =>
      this.getRouteText(key, pathname);

    app.provide(i18nKey, {
      t: (key: string, locale?: string) => this.getText(key, locale),
      rt: (key: string, pathname?: string) => this.getRouteText(key, pathname),
      locale: this.locale,
      ssrPathname: this.ssrPathname,
    });

    app.directive("t", this.directive(this.getText));

    app.directive("rt", this.directive(this.getRouteText));
  }
}

export function createI18n(options: Options) {
  return new I18n(options);
}
