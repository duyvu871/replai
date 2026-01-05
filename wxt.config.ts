import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: [
    '@wxt-dev/module-react',
    '@wxt-dev/webextension-polyfill',
  ],
  manifest: {
    permissions: ['storage'],
    icons: {
      16: '/icon/icon-16.png',
      32: '/icon/icon-32.png',
      48: '/icon/icon-48.png',
      96: '/icon/icon-96.png',
      128: '/icon/icon-128.png',
    },
    action: {
      default_title: 'G\'Agent',
      default_icon: {
        16: '/icon/icon-16.png',
        32: '/icon/icon-32.png',
        48: '/icon/icon-48.png',
        96: '/icon/icon-96.png',
        128: '/icon/icon-128.png',
      },

    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
