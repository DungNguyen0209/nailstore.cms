import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  // base: "/admin-one-vue-tailwind/",
  plugins: [vue()],
  server: {
    // Specify the development server port
    port: 8081,
  },
  // Base name of your app
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "./" // Replace this with the subdirectory path if needed
});
