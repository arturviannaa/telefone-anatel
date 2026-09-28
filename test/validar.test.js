import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { DDDS, MENSAGENS, validarTelefone } from 'telefone-anatel'

const falhaCom = (entrada, codigo, opcoes) => {
  const r = validarTelefone(entrada, opcoes)
  assert.equal(r.ok, false, `${entrada} deveria falhar`)
  assert.equal(r.codigo, codigo, `${entrada}: ${r.erro}`)
  assert.equal(typeof r.erro, 'string')
  assert.deepEqual(Object.keys(r).sort(), ['codigo', 'erro', 'ok'])
  return r
}

describe('resultado válido', () => {
  test('celular traz todos os campos', () => {
    assert.deepEqual(validarTelefone('(51) 99188-4628'), {
      ok: true,
      e164: '+5551991884628',
      nacional: '(51) 99188-4628',
      internacional: '+55 51 99188-4628',
      ddd: '51',
      numero: '991884628',
      tipo: 'celular',
      uf: 'RS',
    })
  })

  test('fixo traz todos os campos', () => {
    assert.deepEqual(validarTelefone('11 3333-4444'), {
      ok: true,
      e164: '+551133334444',
      nacional: '(11) 3333-4444',
      internacional: '+55 11 3333-4444',
      ddd: '11',
      numero: '33334444',
      tipo: 'fixo',
      uf: 'SP',
    })
  })

  test('fixo começando com 2, 3, 4 e 5', () => {
    for (const inicio of '2345') {
      const r = validarTelefone(`21${inicio}1234567`)
      assert.equal(r.ok, true, inicio)
      assert.equal(r.tipo, 'fixo')
    }
  })

  test('aceita número como entrada', () => {
    assert.equal(validarTelefone(51991884628).e164, '+5551991884628')
  })
})

describe('formas de escrever e prefixos', () => {
  const formasCelular = [
    '51991884628',
    '(51) 99188-4628',
    '(51)99188-4628',
    '51 9 9188-4628',
    '51.99188.4628',
    ' 51 99188 4628 ',
    '+55 51 99188-4628',
    '+55 (51) 9 9188-4628',
    '+5551991884628',
    '5551991884628',
    '55 51 991884628',
    '051991884628',
    '0 51 99188-4628',
    '(051) 99188-4628',
    '0 21 51 99188-4628',
    '0 15 51 99188-4628',
    '0XX51 99188-4628',
    '02151991884628',
    'tel: 51 99188-4628',
  ]
  for (const forma of formasCelular) {
    test(`celular: ${JSON.stringify(forma)}`, () => {
      const r = validarTelefone(forma)
      assert.equal(r.ok, true, r.erro)
      assert.equal(r.e164, '+5551991884628')
    })
  }

  const formasFixo = [
    '5133334444',
    '(51) 3333-4444',
    '+55 51 3333-4444',
    '555133334444',
    '05133334444',
    '0 41 51 3333-4444',
    '0415133334444',
  ]
  for (const forma of formasFixo) {
    test(`fixo: ${JSON.stringify(forma)}`, () => {
      const r = validarTelefone(forma)
      assert.equal(r.ok, true, r.erro)
      assert.equal(r.e164, '+555133334444')
    })
  }

  test('todo DDD em todas as formas de prefixo', () => {
    for (const ddd of Object.keys(DDDS)) {
      for (const numero of ['991884628', '33334444']) {
        const esperado = `+55${ddd}${numero}`
        for (const forma of [
          `${ddd}${numero}`,
          `+55${ddd}${numero}`,
          `55${ddd}${numero}`,
          `0${ddd}${numero}`,
          `021${ddd}${numero}`,
          `(${ddd}) ${numero}`,
        ]) {
          const r = validarTelefone(forma)
          assert.equal(r.ok, true, `${forma}: ${r.erro}`)
          assert.equal(r.e164, esperado, forma)
          assert.equal(r.ddd, ddd, forma)
        }
      }
    }
  })

  test('DDD 55 sem +55 não é confundido com o código do país', () => {
    assert.equal(validarTelefone('55 99188-4628').e164, '+5555991884628')
    assert.equal(validarTelefone('(55) 3222-1234').e164, '+555532221234')
    assert.equal(validarTelefone('(55) 99188-4628').e164, '+5555991884628')
    assert.equal(validarTelefone('+55 55 99188-4628').e164, '+5555991884628')
    assert.equal(validarTelefone('55 3003-1234').tipo, 'fixo')
    assert.equal(validarTelefone('55 3003-1234', { naoGeograficos: true }).tipo, 'fixo')
    assert.equal(validarTelefone('+55 3003-1234', { naoGeograficos: true }).tipo, 'nao-geografico')
    assert.equal(validarTelefone('+55 3003-1234').codigo, 'NAO_GEOGRAFICO')
  })
})

describe('códigos de erro', () => {
  test('VAZIO', () => {
    for (const entrada of ['', '   ', null, undefined, '()-', 'abc']) falhaCom(entrada, 'VAZIO')
  })

  test('CURTO', () => {
    for (const entrada of ['5', '51', '5199188', '519918846', '(51) 3333-444', '+55 51 9918', '0 51 3333']) {
      falhaCom(entrada, 'CURTO')
    }
  })

  test('LONGO', () => {
    for (const entrada of ['519918846281', '5199188462812', '+55 51 99188-46281', '0 21 51 99188-46281', '99 99 99188-4628 12']) {
      falhaCom(entrada, 'LONGO')
    }
  })

  test('DDD_INEXISTENTE traz o DDD na mensagem', () => {
    const r = falhaCom('(20) 99188-4628', 'DDD_INEXISTENTE')
    assert.equal(r.erro, 'O DDD 20 não existe. Confira o código de área.')
    for (const ddd of ['10', '23', '25', '26', '29', '30', '36', '39', '40', '50', '52', '56', '57', '58', '59', '60', '70', '72', '76', '78', '80', '90']) {
      falhaCom(`${ddd}991884628`, 'DDD_INEXISTENTE')
    }
  })

  test('REPETIDO para todos os dígitos iguais', () => {
    for (const d of '0123456789') {
      falhaCom(`51${d.repeat(9)}`, 'REPETIDO')
      falhaCom(`51${d.repeat(8)}`, 'REPETIDO')
    }
    falhaCom('+55 11 99999-9999', 'REPETIDO')
  })

  test('REPETIDO olha só o número, não o DDD', () => {
    assert.equal(validarTelefone('11 91111-1112').ok, true)
    assert.equal(validarTelefone('22 99999-9998').ok, true)
  })

  test('CELULAR_INVALIDO: 9 dígitos sem começar com 9', () => {
    for (const inicio of '12345678') falhaCom(`51${inicio}91884628`, 'CELULAR_INVALIDO')
  })

  test('CELULAR_SEM_9: 8 dígitos começando com 6 a 9', () => {
    for (const inicio of '6789') falhaCom(`51${inicio}1884628`, 'CELULAR_SEM_9')
    falhaCom('(51) 9188-4628', 'CELULAR_SEM_9')
  })

  test('FIXO_INVALIDO: 8 dígitos começando com 0 ou 1', () => {
    falhaCom('51 0333-4444', 'FIXO_INVALIDO')
    falhaCom('51 1333-4444', 'FIXO_INVALIDO')
  })

  test('NAO_GEOGRAFICO quando a opção está desligada', () => {
    for (const entrada of ['0800 123 4567', '0300 123 4567', '0500 123 4567', '0900 123 4567', '800 123 4567', '4004-1234', '4000 1234', '3003-1234']) {
      falhaCom(entrada, 'NAO_GEOGRAFICO')
    }
  })

  test('toda falha usa uma mensagem de MENSAGENS', () => {
    const casos = { VAZIO: '', CURTO: '51', LONGO: '519918846281', REPETIDO: '51999999999', CELULAR_INVALIDO: '51891884628', CELULAR_SEM_9: '5191884628', FIXO_INVALIDO: '5111884628', NAO_GEOGRAFICO: '08001234567' }
    for (const [codigo, entrada] of Object.entries(casos)) {
      assert.equal(falhaCom(entrada, codigo).erro, MENSAGENS[codigo])
    }
    assert.equal(Object.keys(MENSAGENS).length, 9)
    assert.ok(Object.isFrozen(MENSAGENS))
  })
})

describe('opções', () => {
  test('mensagens personalizadas, com {ddd}', () => {
    const mensagens = { VAZIO: 'Informe seu WhatsApp.', DDD_INEXISTENTE: 'DDD {ddd}? Não conheço.' }
    assert.equal(validarTelefone('', { mensagens }).erro, 'Informe seu WhatsApp.')
    assert.equal(validarTelefone('20991884628', { mensagens }).erro, 'DDD 20? Não conheço.')
    assert.equal(validarTelefone('51', { mensagens }).erro, MENSAGENS.CURTO)
  })

  test('opcoes nulas ou vazias não quebram', () => {
    assert.equal(validarTelefone('51991884628', null).ok, true)
    assert.equal(validarTelefone('51991884628', {}).ok, true)
  })

  test('naoGeograficos: 0800, 0300, 0500 e 0900', () => {
    for (const servico of ['0800', '0300', '0500', '0900']) {
      const sem0 = servico.slice(1)
      for (const forma of [`${servico} 123 4567`, `${servico}1234567`, `${sem0} 123 4567`, `+55 ${sem0} 123 4567`, `+55 ${servico} 123 4567`]) {
        assert.deepEqual(validarTelefone(forma, { naoGeograficos: true }), {
          ok: true,
          e164: `+55${sem0}1234567`,
          nacional: `${servico} 123 4567`,
          internacional: `+55 ${sem0} 123 4567`,
          ddd: null,
          numero: `${sem0}1234567`,
          tipo: 'nao-geografico',
          uf: null,
          servico,
        }, forma)
      }
    }
  })

  test('naoGeograficos: 3003 e 4000 a 4004 sem DDD', () => {
    for (const servico of ['3003', '4000', '4001', '4002', '4003', '4004']) {
      assert.deepEqual(validarTelefone(`${servico}-1234`, { naoGeograficos: true }), {
        ok: true,
        e164: `+55${servico}1234`,
        nacional: `${servico}-1234`,
        internacional: `+55 ${servico}-1234`,
        ddd: null,
        numero: `${servico}1234`,
        tipo: 'nao-geografico',
        uf: null,
        servico,
      })
    }
  })

  test('4004 com DDD continua sendo um fixo comum', () => {
    const r = validarTelefone('(11) 4004-1234', { naoGeograficos: true })
    assert.equal(r.tipo, 'fixo')
    assert.equal(r.e164, '+551140041234')
  })

  test('naoGeograficos não mexe nos números comuns', () => {
    for (const entrada of ['51991884628', '5133334444', '+55 51 99188-4628', '0 21 51 3333-4444']) {
      assert.deepEqual(validarTelefone(entrada, { naoGeograficos: true }), validarTelefone(entrada))
    }
    assert.equal(validarTelefone('4005-1234', { naoGeograficos: true }).codigo, 'CURTO')
    assert.equal(validarTelefone('0800 123 456', { naoGeograficos: true }).ok, false)
  })
})

describe('ida e volta pelo E.164', () => {
  test('validar(e164) devolve o mesmo e164, e os outros formatos também', () => {
    for (const ddd of Object.keys(DDDS)) {
      for (const numero of ['987654321', '923456789', '23456789', '54321098']) {
        const r = validarTelefone(`${ddd}${numero}`)
        assert.equal(r.ok, true)
        for (const formato of [r.e164, r.nacional, r.internacional, `${r.ddd}${r.numero}`]) {
          assert.deepEqual(validarTelefone(formato), r, formato)
        }
      }
    }
  })

  test('E.164 sempre tem +55 e 12 ou 13 dígitos', () => {
    for (const ddd of Object.keys(DDDS)) {
      assert.match(validarTelefone(`${ddd}991884628`).e164, /^\+55\d{11}$/)
      assert.match(validarTelefone(`${ddd}33334444`).e164, /^\+55\d{10}$/)
    }
  })

  test('não geográficos também fazem ida e volta', () => {
    for (const entrada of ['0800 123 4567', '4004-1234']) {
      const r = validarTelefone(entrada, { naoGeograficos: true })
      for (const formato of [r.e164, r.nacional, r.internacional]) {
        assert.deepEqual(validarTelefone(formato, { naoGeograficos: true }), r, formato)
      }
    }
  })
})
