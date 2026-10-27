// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:5000",
//         changeOrigin: true,
//         secure: false,
//       },
//       "/socket.io": {
//         target: "http://localhost:5000",
//         changeOrigin: true,
//         secure: false,
//         ws: true,
//       },
//     },
//   },
// });


import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // process.cwd() ki jagah '.' use kar liya hai taake error na aaye
  const env = loadEnv(mode, '.', '');

  const backendUrl = env.VITE_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        "/socket.io": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  };
});