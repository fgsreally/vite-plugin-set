import { ViteDevServer } from "vite";
import { resolve } from "path";
import { writeFile, readFileSync, existsSync } from "fs";
import colors from "colors";
import { outputFileSync } from "fs-extra";
let storage: { [key in string]: any } = {};
export default function recorder(path: string) {
  return {
    name: "vite_plugin_record",
    configureServer(server: ViteDevServer) {
      let filePath = resolve(process.cwd(), path);
      if (!existsSync(filePath)) {
        outputFileSync(filePath, "{}");
      }
      let lastStorage = JSON.parse(readFileSync(filePath).toString());
      storage = lastStorage;
      server.middlewares.use((req, res, next) => {
        let key: any = (req.url as string).match(/VITE_RECORD(.*)/);
        if (key[1] && !storage[key[1]]) {
          req.on("data", (chunk) => {
            let ret = JSON.parse(chunk.toString());
            storage[key[1]] = ret;
            writeFile(filePath, JSON.stringify(storage), (err) => {
              if (err) console.error(err);
              console.log(colors.green(`record key [${key[1]}]`));
            });
          });
          res.end("1");
        } else {
          next();
        }
      });
    },
  };
}
