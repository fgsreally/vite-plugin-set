import {
  HtmlTagDescriptor,
  normalizePath,
  PluginOption,
  ViteDevServer,
} from "vite";
import { resolve } from "path";
let HMREvent = "__VITE_LAZYLOAD__";
let server: ViteDevServer;
let timer: NodeJS.Timeout;
let isFinish = false;

function getPath(p: string) {
  return normalizePath(resolve(process.cwd(), p));
}

export function prefetch(
  lazyImport: string[],
  entry: string = "src/main.ts",
  time: number = 100
): PluginOption {
  let entryModule: string = getPath(entry);
  console.log(entryModule);
  let mode: "build" | "serve";
  return {
    name: "vite-plugin-prefetch",
    config(_, { command }) {
      mode = command;
    },
    configureServer(_server: ViteDevServer) {
      server = _server;
    },

    transformIndexHtml(html, ctx) {
      let tags: HtmlTagDescriptor[] = [];

      for (let i in ctx.bundle) {
        if (
          (ctx.bundle[i] as any).isDynamicEntry &&
          lazyImport
            .map((item) => getPath(item))
            .includes((ctx.bundle[i] as any).facadeModuleId)
        ) {
          tags.push({
            tag: "link",
            attrs: {
              rel: "prefetch",
              href: `/${i}`,
            },
            injectTo: "head-prepend",
          });
        }
      }

      return {
        html,
        tags,
      };
    },
    transform(code: string, id: string) {
      if (mode === "build") return;
      if (!isFinish) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(sendHMRToClient, time);
      }

      if (id === entryModule) {
        return (
          code +
          `import.meta.hot.on("${HMREvent}", ()=>{
          const lazyPages = ${JSON.stringify(lazyImport)};
          lazyPages.forEach(item => fetch(item));
      }
          )`
        );
      }
    },
  };
}

function sendHMRToClient() {
  server.ws.send({
    type: "custom",
    event: HMREvent,
  });
  isFinish = true;
}
