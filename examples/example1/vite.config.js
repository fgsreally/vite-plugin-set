import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { sfc } from "vite-plugin-sfcmore";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ...sfc(
      [
        {
          key: "test",
          transformer: (code) => {
            return `export let test=(()=>{${code}})()`;
          },
        },
      ],
      []
    ),
  ],
});
