import { createFilter, PluginOption } from "vite";
import { compile, Extension, tagExtension } from "./compiler";
import {
  addonCss,
  defaultAddon,
  defaultTag,
  defaultTransform,
} from "./extension";
import { basename } from "path";
interface Options {
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
}
let mode: string;
let codeMap: Map<string, string> = new Map();
export function sfc(
  isBuild: boolean = true,
  addon: {
    addonExt: Extension[];
    transformExt: Extension[];
    tagExt: tagExtension[];
  } = {
    addonExt: defaultAddon,
    transformExt: defaultTransform,
    tagExt: defaultTag,
  },
  opts: Options = {}
): PluginOption[] {
  let { include = /\.vue$/, exclude } = opts;
  const filter = createFilter(include, exclude);

  return [
    {
      name: "vite-plugin-sfcmore:pre",
      enforce: "pre",

      config(conf: any, { command }) {
        mode = command;
        if (isBuild && command === "build") {
          if (!conf.build) {
            conf.build = {};
          }
          if (!conf.build.rollupOptions) {
            conf.build.rollupOptions = {};
          }
          if (!conf.build.rollupOptions.output) {
            conf.build.rollupOptions.output = {};
          }
          conf.build.rollupOptions.output.chunkFileNames = "[name].js";
          conf.build.rollupOptions.output.assetFileNames = "[name][extname]";
          conf.build.rollupOptions.output.manualChunks = (id: string) => {
            if (id.endsWith(".vue")) {
              return basename(id, ".vue");
            }
            if (id.endsWith(".vue?vue&addon"))
              return basename(id, ".vue?vue&addon") + ".addon";
          };
        }
      },
      transform(code: string, id: string) {
        if (filter(id)) {
          let { source, addonScript } = compile(
            code,
            addon.transformExt,
            addon.addonExt,
            addon.tagExt
          );
          if (addonScript) codeMap.set(id + "?vue&addon", addonScript);
          return source;
        }
      },
    },
    {
      name: "vite-plugin-sfcmore:post",
      enforce: "post",

      load(id) {
        if (id.endsWith(`?vue&addon`)) {
          return codeMap.get(id);
        }
      },
      transform(code: string, id: string) {
        if (filter(id)) {
          let addonCode = codeMap.has(id + "?vue&addon")
            ? `export async function addon() {
              return await import("${id}?vue&addon");
            }`
            : "";

          return (
            code +
            "\n" +
            addonCode +
            (mode === "build"
              ? addonCss("import.meta.url.replace(/\\.js(.*)/,'.css')")
              : "")
          );
        }
      },
    },
  ];
}
