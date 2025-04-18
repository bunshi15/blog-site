import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
		server = require('child_process').spawn('npm', [
		  'run',
		  'start',
		  '--',
		  '--dev',
		  '--host', '0.0.0.0',
		  '--cors',
		], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        // режим разработки - включаем проверки
        dev: !production
      }
    }),

    // извлечение любого CSS из компонентов в отдельный файл
    css({ output: 'bundle.css' }),

    // для сторонних зависимостей
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    // в режиме разработки запускаем сервер с live reload
    !production && serve(),
    !production && livereload('public'),

    // в продакшене минифицируем
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};