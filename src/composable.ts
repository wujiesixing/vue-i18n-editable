import { inject } from "vue";

import type { InjectionKey, Ref } from "vue";

export const i18nKey = Symbol("i18n") as InjectionKey<{
  t: (key: string, locale?: string) => any;
  rt: (key: string, pathname?: string) => any;
  locale: Ref<string | undefined>;
  ssrPathname: Ref<string | undefined>;
}>;

export function useI18n() {
  const i18n = inject(i18nKey);

  if (!i18n) {
    throw new Error(
      "inject() can only be used inside setup() or functional components."
    );
  }

  return i18n;
}
