const { test } = require('node:test')
const assert = require('node:assert/strict')
const cjs = require('telefone-anatel')

test('require() entrega a mesma API do import', async () => {
  const esm = await import('telefone-anatel')
  assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort())
  for (const nome of Object.keys(esm)) {
    assert.equal(typeof cjs[nome], typeof esm[nome], nome)
  }
})

test('require() valida, mascara e formata igual', async () => {
  const esm = await import('telefone-anatel')
  for (const entrada of ['(51) 99188-4628', '+55 11 3333-4444', '0 21 51 99188-4628', '20991884628', '', '0800 123 4567']) {
    assert.deepEqual(cjs.validarTelefone(entrada), esm.validarTelefone(entrada))
    assert.deepEqual(cjs.validarTelefone(entrada, { naoGeograficos: true }), esm.validarTelefone(entrada, { naoGeograficos: true }))
    assert.equal(cjs.mascararTelefone(entrada), esm.mascararTelefone(entrada))
    assert.equal(cjs.formatarTelefone(entrada), esm.formatarTelefone(entrada))
  }
  assert.deepEqual(cjs.DDDS, esm.DDDS)
  assert.ok(Object.isFrozen(cjs.DDDS))
})
