import type { CompilerOptions, DirectiveTransform, RootNode } from "@vue/compiler-dom";
export declare function compileWithCustomDirectives(source: string | RootNode, directives: Record<string, DirectiveTransform | undefined>, require: NodeRequire, options?: CompilerOptions): Function;
export declare function formatPath(path: string): string;
export declare function warn(msg: Error | string): void;
