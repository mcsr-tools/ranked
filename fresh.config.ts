import { env } from "node:process";
import { defineConfig } from "$fresh/server.ts";
import tailwind from "@pakornv/fresh-plugin-tailwindcss";
import svgInjectPlugin from "https://deno.land/x/fresh_plugin_svg_inject@0.2.0/main.js";

export default defineConfig({
  plugins: [tailwind(), svgInjectPlugin()],
  router: {
    basePath: env.FRESH_CONFIG_BASE_PATH,
  },
});
