import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Deployed via manual FTP upload of dist/ to the root of
  // westward.icanplaythere.com. Relative base makes asset URLs work
  // regardless of the exact docroot folder on the host (IONOS) — no
  // server rewrites needed. Change to "/" only if you switch to a
  // root-guaranteed host, or "/subpath/" for a project subfolder.
  base: "./",
});
