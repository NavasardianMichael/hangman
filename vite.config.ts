import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import { readdirSync } from 'fs';
import svgr from "vite-plugin-svgr";

let faviconURL = '/favicon.svg'

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
      includeAssets: [faviconURL],
      manifest: {
        short_name: "Կախաղան",
        name: 'Կախաղան | Hangman',
        theme_color: '#ffffff',
        orientation: "portrait",
        display: 'fullscreen',
        description: 'Հայտնի ԿԱԽԱՂԱՆ (HANGMAN) Խաղի հայկական տարբերակն արդեն հասանելի է առցանց',
        icons: [
          {
            src: faviconURL,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: faviconURL,
            sizes: '512x512',
            type: 'image/png',
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