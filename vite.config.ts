import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  // This is required for GitHub Pages to resolve assets correctly
  base: "/snapchat-data-export-viewer/",
  
  plugins: [
    react(),
    tailwindcss(),
    metaImagesPlugin(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      // If you completely deleted the 'shared' folder earlier, you can remove this next line:
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  
  css: {
    postcss: {
      plugins: [],
    },
  },
  
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    // Outputs the build to a 'dist' folder in the root of your project
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
