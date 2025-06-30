import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import { readdirSync } from 'fs';
import svgr from "vite-plugin-svgr";

const basePath = '/hangman'
const getBasePath = (path: string) => `${basePath}${path}`

const faviconPath = getBasePath('/favicon.svg')

// https://vitejs.dev/config/
export default defineConfig({
  base: "/hangman/",
  server: {
    open: true,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      ...generateAliases('./src')
    }
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      includeAssets: [faviconPath],
      manifest: {
        short_name: "Կախաղան",
        name: 'Կախաղան | Hangman',
        theme_color: '#ffffff',
        orientation: "portrait",
        start_url: basePath,
        display: 'standalone',
        description: 'Հայտնի ԿԱԽԱՂԱՆ (HANGMAN) Խաղի հայկական տարբերակն արդեն հասանելի է առցանց',
        screenshots: [
          {
            src: getBasePath('/screenshot1.png'),
            type: 'image/png',
            sizes: '381x866',
            form_factor: 'narrow'
          },
          {
            src: getBasePath('/screenshot2.png'),
            type: 'image/png',
            sizes: '378x869',
            form_factor: 'narrow'
          },
          {
            src: getBasePath('/screenshot3.png'),
            type: 'image/png',
            sizes: '379x863',
            form_factor: 'narrow'
          }
        ],
        icons: [
          {
            "src": getBasePath('/icon-48x48.png'),
            "sizes": "48x48",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-72x72.png'),
            "sizes": "72x72",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-96x96.png'),
            "sizes": "96x96",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-128x128.png'),
            "sizes": "128x128",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-144x144.png'),
            "sizes": "144x144",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-152x152.png'),
            "sizes": "152x152",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-192x192.png'),
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-384x384.png'),
            "sizes": "384x384",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-512x512.png'),
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": getBasePath('/icon-192x192-maskable.png'),
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": getBasePath('/icons/icon-512x512-maskable.png'),
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ]
      },
    }),
  ]
})



function generateAliases(srcDir: string) {
  const aliases: Record<string, string> = {};

  // Get all directories in srcDir
  const directories = readdirSync(path.resolve(srcDir), { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Generate aliases for each directory
  directories.forEach(directory => {
    aliases[directory] = path.resolve(__dirname, `${srcDir}/${directory}`);
  });

  return aliases;
}