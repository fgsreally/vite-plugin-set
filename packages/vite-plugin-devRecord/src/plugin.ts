import { resolve } from 'path';
import { PluginOption, ViteDevServer } from "vite"
import fse from "fs-extra"
import colors from "colors"
import { fileURLToPath } from 'url'
import { dirname } from 'path'


const RE = /VITE_PLUGIN_DEVRECORD$/

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CONFIG_PATH = resolve(__dirname, "../record.json")
interface messageInfo {
    type: string,
    data: any
}


export function recordPlugin(): PluginOption {
    return {
        name: "vite-plugin-devRecord",
        apply: 'serve',
        async configureServer(server: ViteDevServer) {

            const data = JSON.parse(fse.readFileSync(CONFIG_PATH).toString())

            server.middlewares.use((req, res, next) => {
                let isRecord = RE.test(req.url as string) && req.method === 'POST';
                if (isRecord) {
                    req.on("data", (chunk: Buffer) => {
                        let info: messageInfo = JSON.parse(chunk.toString())
                        data[info.type] = info.data
                        fse.outputJSON(CONFIG_PATH, data)
                        log(`"${info.type}" has been recorded`)
                    })
                    res.end("success")

                } else {
                    next()
                }

            })

        }, transformIndexHtml(html) {
            return {
                html,
                tags: [
                    {
                        tag: "div",
                        attrs: {
                            id: "vite-plugin-devrecord",

                        },

                        injectTo: "body",
                    },
                    {
                        tag: "style",
                        children: `.vite-plugin-devrecord{border-radius: 8px;
                    border: 1px solid transparent;
                    padding: 0.6em 1.2em;
                    font-size: 1em;
                    font-weight: 500;
                    font-family: inherit;
                    background-color:#f9f9f9;
                    cursor: pointer;
                    transition: border-color 0.25s;}
                    .vite-plugin-devrecord:hover {
                        border-color: red;
                        top: 100px
                      }
                      #vite-plugin-devrecord{
                        position:fixed;right:200px;top:200px
                      } 
                    `,
                        injectTo: "head",
                    }
                ]
            }
        }
    }
}

function log(msg: string) {
    console.log(colors.green(`${colors.cyan('[vite:vite-plugin-devrecord]')} ${msg}`))
}