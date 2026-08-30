import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GreenBox",
    short_name: "GreenBox",
    description: "GreenBox operations console — admin, kitchen, delivery.",
    start_url: "/login",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f7a4d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
