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

export { compileWithCustomDirectives, formatPath };
