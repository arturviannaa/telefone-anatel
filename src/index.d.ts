/** Sigla de uma das 27 unidades da federação. */
export type Uf =
  | 'AC' | 'AL' | 'AM' | 'AP' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MG' | 'MS' | 'MT' | 'PA' | 'PB' | 'PE' | 'PI' | 'PR'
  | 'RJ' | 'RN' | 'RO' | 'RR' | 'RS' | 'SC' | 'SE' | 'SP' | 'TO'

/** Um dos 67 DDDs em uso no Brasil. */
export type Ddd =
  | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19'
  | '21' | '22' | '24' | '27' | '28'
  | '31' | '32' | '33' | '34' | '35' | '37' | '38'
  | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49'
  | '51' | '53' | '54' | '55'
  | '61' | '62' | '63' | '64' | '65' | '66' | '67' | '68' | '69'
  | '71' | '73' | '74' | '75' | '77' | '79'
  | '81' | '82' | '83' | '84' | '85' | '86' | '87' | '88' | '89'
  | '91' | '92' | '93' | '94' | '95' | '96' | '97' | '98' | '99'

export interface InfoDdd {
  /** UF do DDD. O 61 atende também cidades do Entorno em GO. */
  readonly uf: Uf
  /** Principal cidade ou região atendida. */
  readonly regiao: string
}

/** Os 67 DDDs, com UF e principal cidade ou região. */
export declare const DDDS: { readonly [K in Ddd]: InfoDdd }

/** Códigos de erro estáveis: pode usar em `switch` e testes. */
export type CodigoErro =
  | 'VAZIO'
  | 'CURTO'
  | 'LONGO'
  | 'DDD_INEXISTENTE'
  | 'REPETIDO'
  | 'CELULAR_INVALIDO'
  | 'CELULAR_SEM_9'
  | 'FIXO_INVALIDO'
  | 'NAO_GEOGRAFICO'

/** Mensagens padrão (pt-BR) de cada código de erro. `{ddd}` é trocado pelo DDD. */
export declare const MENSAGENS: { readonly [K in CodigoErro]: string }

/** Prefixo de um número não geográfico. */
export type ServicoNaoGeografico =
  | '0300' | '0500' | '0800' | '0900'
  | '3003' | '4000' | '4001' | '4002' | '4003' | '4004'

export interface OpcoesValidacao {
  /** Aceita 0800, 0300, 0500, 0900, 3003 e 4000–4004. Padrão: `false`. */
  naoGeograficos?: boolean
  /** Troca as mensagens de erro. `{ddd}` é trocado pelo DDD informado. */
  mensagens?: Partial<Record<CodigoErro, string>>
}

export interface OpcoesMascara {
  /** Mascara 0800 123 4567 e 4004-1234 enquanto digita. Padrão: `false`. */
  naoGeograficos?: boolean
}

export interface TelefoneValido {
  ok: true
  /** Formato E.164, ex.: `+5551991884628`. */
  e164: string
  /** Formato nacional, ex.: `(51) 99188-4628`. */
  nacional: string
  /** Formato internacional, ex.: `+55 51 99188-4628`. */
  internacional: string
  ddd: Ddd
  /** Número sem DDD, só dígitos, ex.: `991884628`. */
  numero: string
  tipo: 'celular' | 'fixo'
  uf: Uf
}

export interface TelefoneNaoGeografico {
  ok: true
  /** Ex.: `+558001234567` ou `+5540041234`. */
  e164: string
  /** Ex.: `0800 123 4567` ou `4004-1234`. */
  nacional: string
  /** Ex.: `+55 800 123 4567` ou `+55 4004-1234`. */
  internacional: string
  ddd: null
  /** Número sem o 0 de longa distância, ex.: `8001234567`. */
  numero: string
  tipo: 'nao-geografico'
  uf: null
  servico: ServicoNaoGeografico
}

export interface TelefoneInvalido {
  ok: false
  /** Mensagem amigável em pt-BR, pronta para mostrar ao usuário. */
  erro: string
  codigo: CodigoErro
}

export type ResultadoValidacao = TelefoneValido | TelefoneNaoGeografico | TelefoneInvalido

export type EntradaTelefone = string | number | null | undefined

export type EstiloFormato = 'nacional' | 'internacional' | 'e164'

/**
 * Valida um telefone brasileiro pelo plano de numeração da Anatel.
 * Aceita qualquer formatação e os prefixos +55, 0 + DDD e 0 + operadora + DDD.
 */
export declare function validarTelefone(
  entrada: EntradaTelefone,
  opcoes?: OpcoesValidacao & { naoGeograficos?: false },
): TelefoneValido | TelefoneInvalido
export declare function validarTelefone(
  entrada: EntradaTelefone,
  opcoes?: OpcoesValidacao,
): ResultadoValidacao

/** Máscara enquanto digita: `(51) 99188-4628` ou `(51) 3333-4444`. Nunca lança erro. */
export declare function mascararTelefone(entrada: EntradaTelefone, opcoes?: OpcoesMascara): string

/**
 * Formata um telefone válido (E.164, só dígitos ou já formatado).
 * Devolve `null` se o número não for válido. Aceita números não geográficos.
 * @throws {TypeError} se o estilo não existir.
 */
export declare function formatarTelefone(entrada: EntradaTelefone, estilo?: EstiloFormato): string | null

/** `true` se a entrada é um celular válido. */
export declare function ehCelular(entrada: EntradaTelefone): boolean

/** `true` se a entrada é um telefone fixo válido. */
export declare function ehFixo(entrada: EntradaTelefone): boolean
