/* eslint-disable no-undef */
import { defineConfig } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";
import {
  siteName,
  siteLogo,
  siteAppleLogo,
  siteDes,
  siteKeywords,
  siteAnthor,
} from "./src/config.ts";

// 将 config.ts 中的站点配置注入 index.html 占位符（单一事实源）
function htmlConfigPlugin() {
  return {
    name: "html-config",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html
          .replaceAll("%VITE_SITE_NAME%", siteName)
          .replaceAll("%VITE_SITE_LOGO%", siteLogo)
          .replaceAll("%VITE_SITE_APPLE_LOGO%", siteAppleLogo)
          .replaceAll("%VITE_SITE_DES%", siteDes)
          .replaceAll("%VITE_SITE_KEYWORDS%", siteKeywords)
          .replaceAll("%VITE_SITE_ANTHOR%", siteAnthor);
      },
    },
  };
}

// https://vitejs.dev/config/
export default () =>
  defineConfig({
    plugins: [
      htmlConfigPlugin(),
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(js|css|woff2|woff|ttf)/, // js / css 静态资源缓存
              handler: "CacheFirst",
              options: {
                cacheName: "js-css-cache",
              },
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/, // 图片缓存
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
              },
            },
          ],
        },
        manifest: {
          name: siteName,
          short_name: siteName,
          description: siteDes,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            {
              src: "https://cdn.jsdmirror.com/gh/jeoor/img@main/logo/logo_192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "https://cdn.jsdmirror.com/gh/jeoor/img@main/logo/logo_512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "3000",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false,
          additionalData: `@use "@/style/global.scss" as *;`,
        },
      },
    },
    build: {
      minify: "terser",
      chunkSizeWarningLimit: 600,
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            "vue-vendor": ["vue", "pinia"],
            "element-plus": ["element-plus"],
            swiper: ["swiper"],
            aplayer: ["aplayer", "@worstone/vue-aplayer"],
            icons: [
              "@fortawesome/fontawesome-svg-core",
              "@fortawesome/free-solid-svg-icons",
              "@fortawesome/vue-fontawesome",
              "@icon-park/vue-next",
            ],
          },
        },
      },
    },
  });
