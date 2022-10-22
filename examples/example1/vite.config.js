import { defineConfig } from "vite";
import vue, { parseVueRequest } from "@vitejs/plugin-vue";
import { sfc } from "vite-plugin-sfcmore";
import { basename } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), ...sfc(),{
    transform(code,id){
console.log(id)
    }
  }],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: "./src/index.js",
      formats: ["es"],
      fileName: (format) => `my-lib.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
});
