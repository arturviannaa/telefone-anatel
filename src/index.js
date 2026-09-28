// telefone-anatel: validação, máscara e formatação de telefones brasileiros
// pelo plano de numeração da Anatel.
//
// - DDD: um dos 67 códigos de área em uso no país.
// - Celular (SMP): 9 dígitos começando com 9 (o nono dígito vale em todo o Brasil desde 2016).
// - Fixo (STFC): 8 dígitos começando com 2, 3, 4 ou 5.
// - Aceita +55, 0 + DDD e 0 + código da operadora + DDD na frente; devolve sempre E.164.
// - Números não geográficos (0800, 0300, 0500, 0900, 3003, 4000–4004) só com a opção
//   `naoGeograficos`.

const congelar = (objeto) => {
  for (const valor of Object.values(objeto)) Object.freeze(valor)
  return Object.freeze(objeto)
}

/**
 * Os 67 DDDs em uso no Brasil, com a UF e a principal cidade ou região de cada um.
 * @type {Readonly<Record<string, Readonly<{ uf: string, regiao: string }>>>}
 */
export const DDDS = /* @__PURE__ */ congelar({
  11: { uf: 'SP', regiao: 'São Paulo e região metropolitana' },
  12: { uf: 'SP', regiao: 'São José dos Campos, Taubaté e Vale do Paraíba' },
  13: { uf: 'SP', regiao: 'Santos e Baixada Santista' },
  14: { uf: 'SP', regiao: 'Bauru, Marília e Jaú' },
  15: { uf: 'SP', regiao: 'Sorocaba e Itapetininga' },
  16: { uf: 'SP', regiao: 'Ribeirão Preto, Araraquara e Franca' },
  17: { uf: 'SP', regiao: 'São José do Rio Preto e Barretos' },
  18: { uf: 'SP', regiao: 'Presidente Prudente e Araçatuba' },
  19: { uf: 'SP', regiao: 'Campinas, Piracicaba e Limeira' },
  21: { uf: 'RJ', regiao: 'Rio de Janeiro e região metropolitana' },
  22: { uf: 'RJ', regiao: 'Campos dos Goytacazes, Macaé e Região dos Lagos' },
  24: { uf: 'RJ', regiao: 'Volta Redonda, Petrópolis e Angra dos Reis' },
  27: { uf: 'ES', regiao: 'Vitória e região metropolitana' },
  28: { uf: 'ES', regiao: 'Cachoeiro de Itapemirim e sul do ES' },
  31: { uf: 'MG', regiao: 'Belo Horizonte e região metropolitana' },
  32: { uf: 'MG', regiao: 'Juiz de Fora e Barbacena' },
  33: { uf: 'MG', regiao: 'Governador Valadares e Teófilo Otoni' },
  34: { uf: 'MG', regiao: 'Uberlândia, Uberaba e Triângulo Mineiro' },
  35: { uf: 'MG', regiao: 'Poços de Caldas, Pouso Alegre e Varginha' },
  37: { uf: 'MG', regiao: 'Divinópolis e centro-oeste de MG' },
  38: { uf: 'MG', regiao: 'Montes Claros e norte de MG' },
  41: { uf: 'PR', regiao: 'Curitiba e região metropolitana' },
  42: { uf: 'PR', regiao: 'Ponta Grossa e Guarapuava' },
  43: { uf: 'PR', regiao: 'Londrina e Apucarana' },
  44: { uf: 'PR', regiao: 'Maringá e Umuarama' },
  45: { uf: 'PR', regiao: 'Cascavel e Foz do Iguaçu' },
  46: { uf: 'PR', regiao: 'Francisco Beltrão e Pato Branco' },
  47: { uf: 'SC', regiao: 'Joinville, Blumenau e Itajaí' },
  48: { uf: 'SC', regiao: 'Florianópolis e Criciúma' },
  49: { uf: 'SC', regiao: 'Chapecó, Lages e Joaçaba' },
  51: { uf: 'RS', regiao: 'Porto Alegre e região metropolitana' },
  53: { uf: 'RS', regiao: 'Pelotas e Rio Grande' },
  54: { uf: 'RS', regiao: 'Caxias do Sul e Passo Fundo' },
  55: { uf: 'RS', regiao: 'Santa Maria, Uruguaiana e Santo Ângelo' },
  61: { uf: 'DF', regiao: 'Brasília e Entorno do DF (inclui cidades de GO)' },
  62: { uf: 'GO', regiao: 'Goiânia e Anápolis' },
  63: { uf: 'TO', regiao: 'Palmas e Araguaína (todo o Tocantins)' },
  64: { uf: 'GO', regiao: 'Rio Verde, Jataí e Itumbiara' },
  65: { uf: 'MT', regiao: 'Cuiabá e Várzea Grande' },
  66: { uf: 'MT', regiao: 'Rondonópolis, Sinop e Barra do Garças' },
  67: { uf: 'MS', regiao: 'Campo Grande, Dourados e Corumbá (todo o MS)' },
  68: { uf: 'AC', regiao: 'Rio Branco (todo o Acre)' },
  69: { uf: 'RO', regiao: 'Porto Velho (todo Rondônia)' },
  71: { uf: 'BA', regiao: 'Salvador e região metropolitana' },
  73: { uf: 'BA', regiao: 'Ilhéus, Itabuna e Porto Seguro' },
  74: { uf: 'BA', regiao: 'Juazeiro, Irecê e Jacobina' },
  75: { uf: 'BA', regiao: 'Feira de Santana e Alagoinhas' },
  77: { uf: 'BA', regiao: 'Vitória da Conquista e Barreiras' },
  79: { uf: 'SE', regiao: 'Aracaju (todo Sergipe)' },
  81: { uf: 'PE', regiao: 'Recife, região metropolitana e Caruaru' },
  82: { uf: 'AL', regiao: 'Maceió (todo Alagoas)' },
  83: { uf: 'PB', regiao: 'João Pessoa e Campina Grande (toda a Paraíba)' },
  84: { uf: 'RN', regiao: 'Natal e Mossoró (todo o Rio Grande do Norte)' },
  85: { uf: 'CE', regiao: 'Fortaleza e região metropolitana' },
  86: { uf: 'PI', regiao: 'Teresina e Parnaíba' },
  87: { uf: 'PE', regiao: 'Petrolina, Garanhuns e Serra Talhada' },
  88: { uf: 'CE', regiao: 'Juazeiro do Norte e Sobral' },
  89: { uf: 'PI', regiao: 'Picos e Floriano' },
  91: { uf: 'PA', regiao: 'Belém e região metropolitana' },
  92: { uf: 'AM', regiao: 'Manaus e Parintins' },
  93: { uf: 'PA', regiao: 'Santarém e Altamira' },
  94: { uf: 'PA', regiao: 'Marabá e Parauapebas' },
  95: { uf: 'RR', regiao: 'Boa Vista (todo Roraima)' },
  96: { uf: 'AP', regiao: 'Macapá (todo o Amapá)' },
  97: { uf: 'AM', regiao: 'Tefé, Coari e interior do Amazonas' },
  98: { uf: 'MA', regiao: 'São Luís e região metropolitana' },
  99: { uf: 'MA', regiao: 'Imperatriz e Caxias' },
})

/**
 * Mensagens padrão de cada código de erro. `{ddd}` é trocado pelo DDD informado.
 * @type {Readonly<Record<string, string>>}
 */
export const MENSAGENS = /* @__PURE__ */ Object.freeze({
  VAZIO: 'Informe o telefone com DDD.',
  CURTO: 'Inclua o DDD e o número completo, ex.: (11) 91234-5678.',
  LONGO: 'Número longo demais. Use DDD + número, ex.: (11) 91234-5678.',
  DDD_INEXISTENTE: 'O DDD {ddd} não existe. Confira o código de área.',
  REPETIDO: 'Esse número não parece válido. Confira os dígitos.',
  CELULAR_INVALIDO: 'Celular com 9 dígitos começa com 9.',
  CELULAR_SEM_9: 'Celular tem 9 dígitos: coloque o 9 antes do número.',
  FIXO_INVALIDO: 'Telefone fixo começa com 2, 3, 4 ou 5.',
  NAO_GEOGRAFICO: 'Números 0800, 0300, 4004 e similares não são aceitos aqui. Informe um telefone com DDD.',
})

const apenasDigitos = (entrada) => String(entrada ?? '').replace(/\D/g, '')

const temDdd = (ddd) => Object.prototype.hasOwnProperty.call(DDDS, ddd)

/** Tira +55, o 0 de longa distância e o código da operadora; sobra DDD + número. */
function paraNacional(digitos) {
  if (digitos.startsWith('55') && (digitos.length === 12 || digitos.length === 13)) return digitos.slice(2)
  if (digitos.startsWith('0') && (digitos.length === 11 || digitos.length === 12)) return digitos.slice(1)
  if (digitos.startsWith('0') && (digitos.length === 13 || digitos.length === 14)) return digitos.slice(3)
  return digitos
}

// 0800/0300/0500/0900 + 7 dígitos, com ou sem o 0 e o +55 na frente.
const TARIFACAO_ESPECIAL = /^(?:55)?0?([3589]00)(\d{3})(\d{4})$/
// Números únicos nacionais (3003, 4000–4004) + 4 dígitos, sem DDD. O 55 na frente só
// conta como código do país quando vem com +: sem ele, 55 3003-1234 é um fixo válido
// de Santa Maria (DDD 55) e vence.
const NUMERO_UNICO = /^(3003|400[0-4])(\d{4})$/

function naoGeografico(digitos, comMais) {
  if (comMais && digitos.length === 10 && digitos.startsWith('55')) digitos = digitos.slice(2)
  let m = TARIFACAO_ESPECIAL.exec(digitos)
  if (m) {
    const [, servico, meio, fim] = m
    return {
      ok: true,
      e164: `+55${servico}${meio}${fim}`,
      nacional: `0${servico} ${meio} ${fim}`,
      internacional: `+55 ${servico} ${meio} ${fim}`,
      ddd: null,
      numero: `${servico}${meio}${fim}`,
      tipo: 'nao-geografico',
      uf: null,
      servico: `0${servico}`,
    }
  }
  m = NUMERO_UNICO.exec(digitos)
  if (m) {
    const [, servico, fim] = m
    return {
      ok: true,
      e164: `+55${servico}${fim}`,
      nacional: `${servico}-${fim}`,
      internacional: `+55 ${servico}-${fim}`,
      ddd: null,
      numero: `${servico}${fim}`,
      tipo: 'nao-geografico',
      uf: null,
      servico,
    }
  }
  return null
}

const separar = (numero) => `${numero.slice(0, numero.length - 4)}-${numero.slice(-4)}`

function falha(codigo, mensagens, ddd = '') {
  const modelo = (mensagens && mensagens[codigo]) || MENSAGENS[codigo]
  return { ok: false, erro: modelo.replace(/\{ddd\}/g, ddd), codigo }
}

/**
 * Valida um telefone brasileiro e devolve os dados normalizados ou o motivo da recusa.
 *
 * @param {string | number | null | undefined} entrada Telefone em qualquer formato.
 * @param {{ naoGeograficos?: boolean, mensagens?: Record<string, string> }} [opcoes]
 */
export function validarTelefone(entrada, opcoes = {}) {
  const { mensagens, naoGeograficos: aceitarNaoGeograficos = false } = opcoes || {}
  const digitos = apenasDigitos(entrada)
  if (!digitos) return falha('VAZIO', mensagens)

  const especial = naoGeografico(digitos, /^\s*\+/.test(String(entrada)))
  if (especial) return aceitarNaoGeograficos ? especial : falha('NAO_GEOGRAFICO', mensagens)

  const local = paraNacional(digitos)
  if (local.length < 10) return falha('CURTO', mensagens)
  if (local.length > 11) return falha('LONGO', mensagens)

  const ddd = local.slice(0, 2)
  const numero = local.slice(2)
  if (!temDdd(ddd)) return falha('DDD_INEXISTENTE', mensagens, ddd)
  if (/^(\d)\1+$/.test(numero)) return falha('REPETIDO', mensagens)

  let tipo
  if (numero.length === 9) {
    if (numero[0] !== '9') return falha('CELULAR_INVALIDO', mensagens)
    tipo = 'celular'
  } else {
    // 8 dígitos: só fixo. Celular de 8 dígitos deixou de existir com o nono dígito.
    if (/^[6-9]/.test(numero)) return falha('CELULAR_SEM_9', mensagens)
    if (!/^[2-5]/.test(numero)) return falha('FIXO_INVALIDO', mensagens)
    tipo = 'fixo'
  }

  return {
    ok: true,
    e164: `+55${local}`,
    nacional: `(${ddd}) ${separar(numero)}`,
    internacional: `+55 ${ddd} ${separar(numero)}`,
    ddd,
    numero,
    tipo,
    uf: DDDS[ddd].uf,
  }
}

// Com a opção ligada, 0 + 3/5/8/9 + 00 vira máscara de 0800; 30 e 40 (DDDs que não
// existem) viram 3003/4004. Devolve null quando a entrada segue o caminho comum.
function mascaraNaoGeografica(d) {
  if (/^0(?:[3589](?:0(?:0\d*)?)?)?$/.test(d)) {
    d = d.slice(0, 11)
    if (d.length <= 4) return d
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  }
  if (/^[34]0/.test(d)) {
    d = d.slice(0, 8)
    return d.length <= 4 ? d : `${d.slice(0, 4)}-${d.slice(4)}`
  }
  return null
}

/**
 * Máscara enquanto a pessoa digita: (51) 99188-4628 ou (51) 3333-4444.
 * Aceita texto parcial e nunca lança erro.
 *
 * @param {string | number | null | undefined} entrada
 * @param {{ naoGeograficos?: boolean }} [opcoes]
 */
export function mascararTelefone(entrada, opcoes = {}) {
  let d = apenasDigitos(entrada)
  if (opcoes && opcoes.naoGeograficos) {
    const especial = mascaraNaoGeografica(d)
    if (especial !== null) return especial
  }
  if (d.length > 11) d = paraNacional(d)
  d = d.slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  // com 9 na frente é celular: 5 + 4; senão fixo: 4 + 4
  const corte = resto[0] === '9' ? 5 : 4
  if (resto.length <= corte) return `(${ddd}) ${resto}`
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

const ESTILOS = ['nacional', 'internacional', 'e164']

/**
 * Formata um telefone já válido (E.164, só dígitos ou já formatado).
 * Devolve null se o número não for válido. Aceita números não geográficos.
 *
 * @param {string | number | null | undefined} entrada
 * @param {'nacional' | 'internacional' | 'e164'} [estilo='nacional']
 * @returns {string | null}
 */
export function formatarTelefone(entrada, estilo = 'nacional') {
  if (!ESTILOS.includes(estilo)) {
    throw new TypeError(`Estilo "${estilo}" desconhecido. Use ${ESTILOS.map((e) => `"${e}"`).join(', ')}.`)
  }
  const r = validarTelefone(entrada, { naoGeograficos: true })
  return r.ok ? r[estilo] : null
}

/**
 * Diz se a entrada é um celular válido.
 * @param {string | number | null | undefined} entrada
 * @returns {boolean}
 */
export function ehCelular(entrada) {
  const r = validarTelefone(entrada)
  return r.ok && r.tipo === 'celular'
}

/**
 * Diz se a entrada é um telefone fixo válido.
 * @param {string | number | null | undefined} entrada
 * @returns {boolean}
 */
export function ehFixo(entrada) {
  const r = validarTelefone(entrada)
  return r.ok && r.tipo === 'fixo'
}
