import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    root: 'demo/browser',
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    build: {
        target: 'esnext'
    },
    define: {
        'process.env': {},
        'global': 'window'
    },
    server: {
        fs: {
            allow: ['../..']
        }
    }
})
