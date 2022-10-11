import { PluginOption, ViteDevServer } from "vite";
import { resolve } from "path";
let HMREvent = "__VITE_LAZYLOAD__";
let server: ViteDevServer;
let timer: NodeJS.Timeout;
let isFinish = false;

export default function Prefetch(
  lazyImport: string[],
  time: number = 50,
  entry = "src/main.ts"
): PluginOption {
  let entryModule = resolve(process.cwd(), entry).replace(/\\/g, "/");

  return {
    name: "vite-plugin-prefetch",
    enforce: "post",
    apply: "serve",
    configureServer(_server: ViteDevServer) {
      server = _server;
    },
    transform(code: string, id: string) {
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
