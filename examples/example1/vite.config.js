import { defineConfig } from "vite";
import vue, { parseVueRequest } from "@vitejs/plugin-vue";
import { sfc } from "vite-plugin-sfcmore";
import { prefetch } from "vite-plugin-prefetch";
import { recordPlugin } from "vite-plugin-devrecord";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    sfc(),
    prefetch(["./src/components/a.js"],'./src/main.js'),
    
  ],
  // build: {
  //   cssCodeSplit: true,
  //   lib: {
  //     entry: "./src/index.js",
  //     formats: ["es"],
  //     fileName: (format) => `my-lib.${format}.js`,
  //   },
  //   rollupOptions: {
  //     external: ["vue"],
  //   },
  // },
});
