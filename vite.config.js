import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base relativa: o build funciona em https://<usuario>.github.io/<repositorio>/
// independentemente do nome do repositório.
export default defineConfig({
  base: './',
  plugins: [vue()],
})
