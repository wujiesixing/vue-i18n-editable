import { compile } from "@vue/compiler-ssr";
import * as runtimeDom from "@vue/runtime-dom";

import type {
  CompilerOptions,
  DirectiveTransform,
  RootNode,
} from "@vue/compiler-dom";

export function compileWithCustomDirectives(
  source: string | RootNode,
  directives: Record<string, DirectiveTransform | undefined>,
  require: NodeRequire,
  options?: CompilerOptions
) {
  const { code } = compile(source, {
    ...options,
    directiveTransforms: directives,
  });
  return Function("require", "Vue", code)(require, runtimeDom) as Function;
}

export function formatPath(path: string) {
  return path.replace(/\/+/g, "/").replace(/(?!^)\/$/, "");
}

export function warn(msg: Error | string) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[vue-i18n-editable warn] ${typeof msg === "string" ? msg : msg.message}`
    );
  }
}
