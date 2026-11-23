import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' + HashRouter 조합으로 GitHub Pages의 어떤 저장소 이름에서도 동작합니다.
export default defineConfig({
  plugins: [react()],
  base: './',
});
