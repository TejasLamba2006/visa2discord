import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src"],
  minify: true,
  bundle: false,
  clean: true,
  format: "esm",
  silent: true,
  outDir: "build",
  outExtension: () => ({
    js: ".js",
  }),
  sourcemap: "inline",
  loader: {
    ".prisma": "text",
  },
});
