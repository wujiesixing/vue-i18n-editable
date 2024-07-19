import { createFilter } from '@rollup/pluginutils';

/**
 * ['.js', '.ts', '.jsx', '.tsx']
 *
 * 不能直接调用全局属性，故不支持
 *
 */
const filter = createFilter(["**/*.vue"], "node_modules/**");
function VueI18nEditable() {
    return {
        name: "vite:VueI18nEditable",
        transform(code, id) {
            if (!filter(id))
                return null;
            if (typeof code !== "string")
                return null;
            return {
                code: code.replace(/(\s+)v-(t|rt)(\.html)?="([^"]+)"(\s+|>)/g, (match, start, directive, html = "", value, end) => {
                    return ` v-${directive}${html}="${value}" v-${html ? "html" : "text"}="$${directive}(${value})"${end === ">" ? end : " "}`;
                }),
                map: null,
            };
        },
    };
}

export { VueI18nEditable as default };
