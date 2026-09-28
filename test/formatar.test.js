import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ehCelular, ehFixo, formatarTelefone } from 'telefone-anatel'

test('formata E.164 nos três estilos', () => {
  assert.equal(formatarTelefone('+5551991884628'), '(51) 99188-4628')
  assert.equal(formatarTelefone('+5551991884628', 'nacional'), '(51) 99188-4628')
  assert.equal(formatarTelefone('+5551991884628', 'internacional'), '+55 51 99188-4628')
  assert.equal(formatarTelefone('+5551991884628', 'e164'), '+5551991884628')
  assert.equal(formatarTelefone('+555133334444', 'internacional'), '+55 51 3333-4444')
})

test('formata a partir do nacional ou só dígitos', () => {
  assert.equal(formatarTelefone('51991884628', 'e164'), '+5551991884628')
  assert.equal(formatarTelefone('(51) 3333-4444', 'e164'), '+555133334444')
  assert.equal(formatarTelefone('0 21 51 99188-4628'), '(51) 99188-4628')
})

test('formata não geográficos sem precisar de opção', () => {
  assert.equal(formatarTelefone('+558001234567'), '0800 123 4567')
  assert.equal(formatarTelefone('08001234567', 'internacional'), '+55 800 123 4567')
  assert.equal(formatarTelefone('+5540041234'), '4004-1234')
})

test('número inválido devolve null', () => {
  for (const entrada of ['', null, undefined, '123', '+5520991884628', '51 99999-9999', '51 9188-4628']) {
    assert.equal(formatarTelefone(entrada), null, String(entrada))
  }
})

test('estilo desconhecido lança TypeError', () => {
  assert.throws(() => formatarTelefone('+5551991884628', 'curto'), TypeError)
  assert.throws(() => formatarTelefone('+5551991884628', null), TypeError)
})

test('ehCelular e ehFixo', () => {
  assert.equal(ehCelular('(51) 99188-4628'), true)
  assert.equal(ehFixo('(51) 99188-4628'), false)
  assert.equal(ehCelular('(51) 3333-4444'), false)
  assert.equal(ehFixo('(51) 3333-4444'), true)
  for (const entrada of ['', '51 9188-4628', '(20) 99188-4628', '0800 123 4567', '4004-1234']) {
    assert.equal(ehCelular(entrada), false, entrada)
    assert.equal(ehFixo(entrada), false, entrada)
  }
})
