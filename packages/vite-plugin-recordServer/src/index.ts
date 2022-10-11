import { Plugin } from "vite";
import { ViteDevServer } from "vite";
import { resolve, relative } from "path";
import { readFileSync, existsSync } from "fs";
import { outputFileSync, outputJSON } from "fs-extra";

function isAllowed(data: any[], newData: any, isEqual: Function) {
  if (data.length > 3) return false;
  for (let i of data) {
    if (isEqual(i, newData)) return false;
  }
  return true;
}

let storage: { [key in string]: any } = {};
function defaultTransform(code: string, id: string) {
  if (/\.(js|ts)$/.test(id)) {
    return code
      .replace(
        /\s\/\/\$(single|array)[\s]+export[\s]+function[\s]+(\w+)/gim,
        (_, type, js) => {
          return `
             export function ${js}(...args){
                let ret=  _${js}(...args)

                   window.$record({
                    type:"js",
                    id:"${relative(process.cwd(), id).replace(/\\/g, "/")}",
                      data:args,
                      output:ret,
                      async:false,
                      mul:"${type}"
                   })
                   return ret
             }
              function _${js}`;
        }
      )
      .replace(
        //async
        /\s\/\/\$(single|array)[\s]+export[\s]+async[\s]+function[\s]+(\w+)/gim,
        (_, type, js) => {
          return `
             export async funciton ${js}(...args){
                let ret=await  _${js}(...args)
                   window.$record({
                    type:"js",
                    id:"${relative(process.cwd(), id).replace(/\\/g, "/")}",
                      data:args,
                      output:ret,
                      async:true,
                      mul:"${type}"
                   })
                   return ret
             }
             async function _${js}`;
        }
      );
  }
  if (/\.vue$/.test(id)) {
    return code.replace(/\s\/\/\$(single|array)/, (_, type) => {
      return `import {getCurrentInstance} from "vue"
       window.$record({
        type:"vue",
    id:"${relative(process.cwd(), id).replace(/\\/g, "/")}",
    data:getCurrentInstance().props,
    mul:"${type}"
       })
       `;
    });
  }
}

type RecordMessage = {
  id: string;
  type: "js" | "vue";
  name?: string;
  mul: "array" | "single";
  data: any;
  output?: any;
};
const CONFIG_PATH = "record.json";
export default function recorder(): Plugin {
  return {
    apply: "serve",
    name: "vite_plugin_record",
    enforce: "pre",

    async configureServer(server: ViteDevServer) {
      const { isEqual } = await import("lodash-es");

      let filePath = resolve(__dirname, CONFIG_PATH);
      if (!existsSync(filePath)) {
        outputFileSync(filePath, "{}");
      }
      let lastStorage = JSON.parse(readFileSync(filePath).toString());
      storage = lastStorage;
      server.middlewares.use((req: any, res, next) => {
        let isRecord: any = /VITE_RECORD$/.test(req.url);
        if (isRecord) {
          req.on("data", (chunk: Buffer) => {
            let ret: RecordMessage = JSON.parse(chunk.toString());

            let ID = ret.id + (ret.name || "");
            if (!storage[ID]) {
              ret.data = [ret.data];
              switch (ret.type) {
                case "js":
                  ret.output = [ret.output];
                  break;
                case "vue":
                  break;
              }
              storage[ID] = ret;
            } else {
              if (
                ret.mul === "array" &&
                isAllowed(storage[ID].data, ret.data, isEqual)
              ) {
                storage[ID].data.push(ret.data);

                switch (ret.type) {
                  case "js":
                    storage[ID].output.push(ret.output);

                    break;
                  case "vue":
                    break;
                }
              }
            }
            outputJSON(filePath, storage, (err) => {
              if (err) console.error(err);
            });
          });
          res.end("1");
        } else {
          next();
        }
      });
    },
    transform(code: string, id: string) {
      return defaultTransform(code, id);
    },
    transformIndexHtml(html) {
      return html.replace(
        /<script/,
        `
        <script type="module">
        let cache=[]
      let cacheMap=[]
        window.$record=(opt)=>{
let sign=opt.id+opt.name||""
if(cacheMap.includes(sign)&&opt.mul==='single')return
cacheMap.push(sign);
cache.push(opt)
        }
        function replacer(key, value) {
          if ( value instanceof HTMLElement) {
            return '_DOM'+value.tagName;
          }
          return value;
        }
        setTimeout(() => {
          setInterval(() => {
            let info = cache.pop();
       
            if (info) {
               navigator.sendBeacon("/VITE_RECORD", JSON.stringify(info,replacer));
            }
          }, 2000);
        }, 30000);

        </script>
        <script
        `
      );
    },
  };
}
