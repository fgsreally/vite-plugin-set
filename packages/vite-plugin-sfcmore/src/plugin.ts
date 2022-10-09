import { createFilter, Plugin } from "vite";
import { compile, Extension } from "./compiler";
import { defaultAddon, defaultTransform } from "./extension";

interface Options {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}

let codeMap: Map<string, string> = new Map();
export function sfc(
  addon: Extension[] = defaultAddon,
  transform: Extension[] = defaultTransform,
  opts: Options = {}
): Plugin[] {
  let { include = /\.vue$/, exclude } = opts;
  const filter = createFilter(include, exclude);

  return [
    {
      name: "vite-plugin-sfcmore:pre",
      enforce: "pre",

      transform(code: string, id: string) {
        if (filter(id)) {
          let { source, addonScript } = compile(code, transform, addon);
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
