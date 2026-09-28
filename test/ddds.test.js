import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DDDS, validarTelefone } from 'telefone-anatel'

// Lista oficial dos 67 códigos de área em uso (plano de numeração da Anatel).
const OFICIAIS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
].map(String)

const UF_POR_DDD = {
  SP: [11, 12, 13, 14, 15, 16, 17, 18, 19],
  RJ: [21, 22, 24],
  ES: [27, 28],
  MG: [31, 32, 33, 34, 35, 37, 38],
  PR: [41, 42, 43, 44, 45, 46],
  SC: [47, 48, 49],
  RS: [51, 53, 54, 55],
  DF: [61],
  GO: [62, 64],
  TO: [63],
  MT: [65, 66],
  MS: [67],
  AC: [68],
  RO: [69],
  BA: [71, 73, 74, 75, 77],
  SE: [79],
  PE: [81, 87],
  AL: [82],
  PB: [83],
  RN: [84],
  CE: [85, 88],
  PI: [86, 89],
  PA: [91, 93, 94],
  AM: [92, 97],
  RR: [95],
  AP: [96],
  MA: [98, 99],
}

test('DDDS tem exatamente os 67 códigos oficiais', () => {
  assert.equal(Object.keys(DDDS).length, 67)
  assert.deepEqual(Object.keys(DDDS).sort(), [...OFICIAIS].sort())
})

test('cada DDD está na UF certa e as 27 UFs aparecem', () => {
  const ufs = Object.keys(UF_POR_DDD)
  assert.equal(ufs.length, 27)
  for (const [uf, ddds] of Object.entries(UF_POR_DDD)) {
    for (const ddd of ddds) assert.equal(DDDS[ddd].uf, uf, `DDD ${ddd}`)
  }
  assert.equal(Object.values(UF_POR_DDD).flat().length, 67)
})

test('cada DDD tem uma região descrita', () => {
  for (const [ddd, info] of Object.entries(DDDS)) {
    assert.equal(typeof info.regiao, 'string', ddd)
    assert.ok(info.regiao.length > 3, ddd)
  }
})

test('DDDS é imutável', () => {
  assert.ok(Object.isFrozen(DDDS))
  assert.ok(Object.isFrozen(DDDS[51]))
  assert.throws(() => { 'use strict'; DDDS[10] = { uf: 'XX', regiao: '' } }, TypeError)
  assert.throws(() => { DDDS[51].uf = 'SP' }, TypeError)
})

test('DDDS aceita chave número ou texto', () => {
  assert.equal(DDDS[51], DDDS['51'])
})

test('todo DDD valida celular e fixo com a UF certa', () => {
  for (const ddd of OFICIAIS) {
    const celular = validarTelefone(`${ddd}991884628`)
    assert.equal(celular.ok, true, `celular ${ddd}`)
    assert.equal(celular.tipo, 'celular')
    assert.equal(celular.ddd, ddd)
    assert.equal(celular.uf, DDDS[ddd].uf)
    assert.equal(celular.e164, `+55${ddd}991884628`)

    const fixo = validarTelefone(`${ddd}33334444`)
    assert.equal(fixo.ok, true, `fixo ${ddd}`)
    assert.equal(fixo.tipo, 'fixo')
    assert.equal(fixo.uf, DDDS[ddd].uf)
  }
})

test('todo código de 10 a 99 fora da lista é DDD_INEXISTENTE', () => {
  for (let n = 10; n <= 99; n++) {
    const ddd = String(n)
    if (OFICIAIS.includes(ddd)) continue
    const r = validarTelefone(`${ddd}991884628`)
    assert.equal(r.ok, false, ddd)
    assert.equal(r.codigo, 'DDD_INEXISTENTE', ddd)
    assert.equal(r.erro, `O DDD ${ddd} não existe. Confira o código de área.`)
  }
})

test('a tabela de DDDs do README bate com DDDS', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  const linhas = [...readme.matchAll(/^\| (\d{2}) \| ([A-Z]{2}) \| (.+?) \|$/gm)]
  assert.equal(linhas.length, 67)
  for (const [, ddd, uf, regiao] of linhas) {
    assert.equal(DDDS[ddd]?.uf, uf, `README DDD ${ddd}`)
    assert.equal(DDDS[ddd].regiao, regiao, `README DDD ${ddd}`)
  }
})
