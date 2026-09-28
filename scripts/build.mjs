// Gera dist/ a partir de src/: o ESM vai como está e o CommonJS sai do mesmo arquivo,
// trocando os `export` por `module.exports`. Sem dependências.
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const raiz = new URL('../', import.meta.url)
const src = new URL('src/', raiz)
const dist = new URL('dist/', raiz)

await rm(dist, { recursive: true, force: true })
await mkdir(dist)

await copyFile(new URL('index.js', src), new URL('index.js', dist))
await copyFile(new URL('index.d.ts', src), new URL('index.d.ts', dist))
await copyFile(new URL('index.d.ts', src), new URL('index.d.cts', dist))

const fonte = await readFile(new URL('index.js', src), 'utf8')
const nomes = Object.keys(await import(new URL('index.js', src))).sort()

const corpo = fonte.replace(/^export (const|function) /gm, '$1 ')
if (/^export\b/m.test(corpo)) throw new Error('build: sobrou um export que o script não sabe converter')

const cjs = `'use strict'\n\n${corpo}\nmodule.exports = { ${nomes.join(', ')} }\n`
await writeFile(new URL('index.cjs', dist), cjs)

console.log(`dist/ gerado: ${nomes.join(', ')}`)
