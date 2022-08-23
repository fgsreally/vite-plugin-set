import { PluginOption } from "vite";
import { init, parse } from "es-module-lexer";
import { resolve, relative } from "path";
import { writeFileSync, readFileSync } from "fs";
let isInit: boolean = false;
let cachePart: { [key in string]: { code: string; imports: string[] } } = {};
let timer: NodeJS.Timeout;
export default function lazyFinder(time: number = 400): PluginOption {
  let filePath = resolve(process.cwd(), "package.json");
  let pk = JSON.parse(readFileSync(filePath).toString());
  let lazyGraph: any = pk.lazyGraph || {};
  pk.lazyGraph = lazyGraph;
  async function analyse(code: string) {
    if (!isInit) await init;
    const [imports] = parse(code);
    return imports.filter((i) => i.d > -1);
  }

  async function startRecord() {
    for (let i in cachePart) {
      let imports = await analyse(cachePart[i].code);
      imports.forEach((j) => {
        cachePart[i].imports.push(
          cachePart[i].code.slice(j.s, j.e).replace(/"/g, "")
        );
      });
      let path = relative(process.cwd(), i).replace("\\", "/");
      if (path && cachePart[i].imports.length > 0) {
        lazyGraph[path] = cachePart[i].imports;
        delete cachePart[i];
      }
    }

    writeFileSync(filePath, JSON.stringify(pk));
  }
  return {
    name: "vite-plugin-lazyFinder",
    enforce: "post",

    apply: "serve",

    transform(code: string, id: string) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(startRecord, time);

      if (!(id in cachePart) && !id.includes("node_modules")) {
        cachePart[id] = { code, imports: [] };
      }
    },
  };
}
