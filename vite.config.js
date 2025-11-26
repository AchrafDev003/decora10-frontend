import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Para React Router (solo local)
  },
});
