import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mascararTelefone, validarTelefone } from 'telefone-anatel'

// Digita um caractere por vez, reaplicando a máscara sobre o texto já mascarado,
// como faz um input controlado.
function digitar(texto, opcoes) {
  const passos = []
  let valor = ''
  for (const tecla of texto) {
    valor = mascararTelefone(valor + tecla, opcoes)
    passos.push(valor)
  }
  return passos
}

test('celular enquanto digita', () => {
  assert.deepEqual(digitar('51991884628'), [
    '(5',
    '(51',
    '(51) 9',
    '(51) 99',
    '(51) 991',
    '(51) 9918',
    '(51) 99188',
    '(51) 99188-4',
    '(51) 99188-46',
    '(51) 99188-462',
    '(51) 99188-4628',
  ])
})

test('fixo enquanto digita', () => {
  assert.deepEqual(digitar('5133334444'), [
    '(5',
    '(51',
    '(51) 3',
    '(51) 33',
    '(51) 333',
    '(51) 3333',
    '(51) 3333-4',
    '(51) 3333-44',
    '(51) 3333-444',
    '(51) 3333-4444',
  ])
})

test('para no 11º dígito', () => {
  assert.equal(mascararTelefone('519918846289999'), '(51) 99188-4628')
  assert.deepEqual(digitar('519918846281').at(-1), '(51) 99188-4628')
})

test('vazio e lixo', () => {
  assert.equal(mascararTelefone(''), '')
  assert.equal(mascararTelefone(null), '')
  assert.equal(mascararTelefone(undefined), '')
  assert.equal(mascararTelefone('abc'), '')
  assert.equal(mascararTelefone('('), '')
  assert.equal(mascararTelefone(51991884628), '(51) 99188-4628')
})

test('apagar volta pelos mesmos passos', () => {
  const passos = digitar('51991884628')
  for (let i = passos.length - 1; i > 0; i--) {
    const apagado = passos[i].replace(/\D$/, '').slice(0, -1)
    assert.equal(mascararTelefone(apagado), passos[i - 1], `apagando de ${passos[i]}`)
  }
})

test('colar número com +55 ou 0 + operadora', () => {
  assert.equal(mascararTelefone('+55 51 99188-4628'), '(51) 99188-4628')
  assert.equal(mascararTelefone('+55 51 3333-4444'), '(51) 3333-4444')
  assert.equal(mascararTelefone('0 21 51 99188-4628'), '(51) 99188-4628')
  assert.equal(mascararTelefone('0 21 51 3333-4444'), '(51) 3333-4444')
})

test('a máscara completa sempre valida', () => {
  for (const numero of ['51991884628', '5133334444', '11987654321', '2125551234']) {
    const mascarado = mascararTelefone(numero)
    const r = validarTelefone(mascarado)
    assert.equal(r.ok, true)
    assert.equal(r.nacional, mascarado)
  }
})

test('é idempotente', () => {
  for (const entrada of ['5', '519', '5199188', '51991884628', '5133334444']) {
    const uma = mascararTelefone(entrada)
    assert.equal(mascararTelefone(uma), uma)
  }
})

test('sem a opção, 0800 segue a máscara comum', () => {
  assert.equal(mascararTelefone('0800'), '(08) 00')
})

test('naoGeograficos: 0800 enquanto digita', () => {
  assert.deepEqual(digitar('08001234567', { naoGeograficos: true }), [
    '0',
    '08',
    '080',
    '0800',
    '0800 1',
    '0800 12',
    '0800 123',
    '0800 123 4',
    '0800 123 45',
    '0800 123 456',
    '0800 123 4567',
  ])
  assert.equal(mascararTelefone('0300 1234567 99', { naoGeograficos: true }), '0300 123 4567')
})

test('naoGeograficos: 4004 enquanto digita', () => {
  assert.deepEqual(digitar('40041234', { naoGeograficos: true }), [
    '(4',
    '40',
    '400',
    '4004',
    '4004-1',
    '4004-12',
    '4004-123',
    '4004-1234',
  ])
  assert.equal(mascararTelefone('3003123499', { naoGeograficos: true }), '3003-1234')
})

test('naoGeograficos não atrapalha DDDs comuns', () => {
  for (const numero of ['51991884628', '5133334444', '41991884628', '31991884628', '0 21 51 99188-4628']) {
    assert.equal(mascararTelefone(numero, { naoGeograficos: true }), mascararTelefone(numero))
  }
  assert.equal(mascararTelefone('0512', { naoGeograficos: true }), '(05) 12')
  assert.equal(mascararTelefone('0812', { naoGeograficos: true }), '(08) 12')
})

test('máscara de não geográfico valida', () => {
  for (const numero of ['08001234567', '40041234']) {
    const mascarado = mascararTelefone(numero, { naoGeograficos: true })
    assert.equal(validarTelefone(mascarado, { naoGeograficos: true }).nacional, mascarado)
  }
})
