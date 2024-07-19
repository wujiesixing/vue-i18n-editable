import { compile } from '@vue/compiler-ssr';
import * as runtimeDom from '@vue/runtime-dom';

function compileWithCustomDirectives(source, directives, require, options) {
    const { code } = compile(source, {
        ...options,
        directiveTransforms: directives,
    });
    return Function("require", "Vue", code)(require, runtimeDom);
}
function formatPath(path) {
    return path.replace(/\/+/g, "/").replace(/(?!^)\/$/, "");
}
function warn(msg) {
    if (process.env.NODE_ENV === "development") {
        console.warn(`[vue-i18n-editable warn] ${typeof msg === "string" ? msg : msg.message}`);
    }
}

export { compileWithCustomDirectives, formatPath, warn };
