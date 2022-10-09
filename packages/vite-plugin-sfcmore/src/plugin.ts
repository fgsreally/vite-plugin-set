import { createFilter, PluginOption } from "vite";
import { compile, Extension, tagExtension } from "./compiler";
import { defaultAddon, defaultTag, defaultTransform } from "./extension";

interface Options {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}

let codeMap: Map<string, string> = new Map();
export function sfc(
  addonExt: Extension[] = defaultAddon,
  transformExt: Extension[] = defaultTransform,
  tagExt: tagExtension[] = defaultTag,
  opts: Options = {}
): PluginOption[] {
  let { include = /\.vue$/, exclude } = opts;
  const filter = createFilter(include, exclude);

  return [
    {
      name: "vite-plugin-sfcmore:pre",
      enforce: "pre",

      transform(code: string, id: string) {
        if (filter(id)) {
          let { source, addonScript } = compile(
            code,
            transformExt,
            addonExt,
            tagExt
          );
          codeMap.set(id, addonScript);
          return source;
        }
      },
    },
    {
      name: "vite-plugin-sfcmore:post",
      enforce: "post",
      transform(code: string, id: string) {
        if (filter(id)) {
          let addonCode = codeMap.get(id) || "";

          return code + "\n" + addonCode;
        }
      },
    },
  ];
}
