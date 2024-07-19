'use strict';

var compilerSsr = require('@vue/compiler-ssr');
var runtimeDom = require('@vue/runtime-dom');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        for (var k in e) {
            n[k] = e[k];
        }
    }
    n.default = e;
    return n;
}

var runtimeDom__namespace = /*#__PURE__*/_interopNamespaceDefault(runtimeDom);

function compileWithCustomDirectives(source, directives, require, options) {
    const { code } = compilerSsr.compile(source, {
        ...options,
        directiveTransforms: directives,
    });
    return Function("require", "Vue", code)(require, runtimeDom__namespace);
}
function formatPath(path) {
    return path.replace(/\/+/g, "/").replace(/(?!^)\/$/, "");
}

exports.compileWithCustomDirectives = compileWithCustomDirectives;
exports.formatPath = formatPath;
