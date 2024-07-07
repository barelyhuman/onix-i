import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'vite'
import fastify from 'vite-plugin-fastify'
import { resolve } from 'path'

loadEnv()

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT),
  },
  plugins: [
    fastify({
      appPath: './src/app.ts',
      serverPath: './src/server.ts',
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
})
