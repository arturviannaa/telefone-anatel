# telefone-anatel

[![npm](https://img.shields.io/npm/v/telefone-anatel.svg)](https://www.npmjs.com/package/telefone-anatel)
[![CI](https://github.com/arturviannaa/telefone-anatel/actions/workflows/ci.yml/badge.svg)](https://github.com/arturviannaa/telefone-anatel/actions/workflows/ci.yml)
[![licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![zero dependências](https://img.shields.io/badge/depend%C3%AAncias-0-brightgreen.svg)](package.json)
[![tipos TypeScript](https://img.shields.io/badge/tipos-TypeScript-3178c6.svg)](src/index.d.ts)

Valida, mascara e formata telefones brasileiros pelo **plano de numeração da Anatel**: os 67 DDDs em uso, o nono dígito do celular, fixo de 8 dígitos, prefixos `+55`, `0` + DDD e `0` + operadora + DDD, saída em **E.164** e máscara enquanto a pessoa digita.

```js
import { validarTelefone } from 'telefone-anatel'

validarTelefone('0 21 (51) 99188-4628')
// {
//   ok: true,
//   e164: '+5551991884628',
//   nacional: '(51) 99188-4628',
//   internacional: '+55 51 99188-4628',
//   ddd: '51',
//   numero: '991884628',
//   tipo: 'celular',
//   uf: 'RS'
// }

validarTelefone('(51) 9188-4628')
// { ok: false, erro: 'Celular tem 9 dígitos: coloque o 9 antes do número.', codigo: 'CELULAR_SEM_9' }
```

- Zero dependências: 2,6 kB minificado e com gzip, e menos de 0,5 kB se você só usar a máscara.
- ESM e CommonJS, com tipos TypeScript.
- Funciona no Node 18+ e no navegador; `sideEffects: false` para tree-shaking.
- Mensagens de erro em pt-BR prontas para mostrar ao usuário, com códigos estáveis para o seu código.

## Por quê

A regex `^\d{10,11}$` que aparece em todo formulário aceita `(20) 99999-9999`, que não existe, e recusa `+55 51 99188-4628`, que existe. As regras de verdade são estas, todas do plano de numeração da Anatel:

- **DDD**: o Brasil usa 67 códigos de área de dois dígitos. Números como 20, 23, 25, 26, 29, 30, 36, 39, 40, 50, 52, 56 a 60, 70, 72, 76, 78, 80 e 90 não existem.
- **Celular** (Serviço Móvel Pessoal): 9 dígitos, começando com 9. O nono dígito começou a ser adotado em 2012 pelo DDD 11 e chegou a todo o país em novembro de 2016; desde então não existe celular com 8 dígitos.
- **Fixo** (STFC): 8 dígitos, começando com 2, 3, 4 ou 5.
- **Prefixos**: as pessoas escrevem `+55`, `0` + DDD (longa distância) ou `0` + código da operadora + DDD (`0 21 51 …`). Tudo isso é o mesmo número.
- **Formato de armazenamento**: E.164 (`+5551991884628`), o formato que APIs de SMS, WhatsApp e telefonia esperam.

Esta biblioteca faz essas verificações, explica o problema em português quando o número não passa e devolve o número normalizado quando passa.

## Instalação

```sh
npm install telefone-anatel
```

Também funciona com `pnpm add telefone-anatel`, `yarn add telefone-anatel` e `bun add telefone-anatel`.

No navegador, sem build:

```html
<script type="module">
  import { mascararTelefone } from 'https://cdn.jsdelivr.net/npm/telefone-anatel/+esm'
</script>
```

## Uso

### JavaScript puro

```js
import { validarTelefone, mascararTelefone, formatarTelefone, ehCelular } from 'telefone-anatel'

const campo = document.querySelector('#telefone')
const aviso = document.querySelector('#telefone-erro')

campo.addEventListener('input', () => {
  campo.value = mascararTelefone(campo.value)
})

campo.addEventListener('blur', () => {
  const r = validarTelefone(campo.value)
  aviso.textContent = r.ok ? '' : r.erro
})

formatarTelefone('+5551991884628')                  // '(51) 99188-4628'
formatarTelefone('51991884628', 'internacional')    // '+55 51 99188-4628'
ehCelular('(51) 3333-4444')                         // false
```

CommonJS também funciona:

```js
const { validarTelefone } = require('telefone-anatel')
```

### React: input controlado com máscara

```jsx
import { useState } from 'react'
import { mascararTelefone, validarTelefone } from 'telefone-anatel'

export function CampoWhatsapp({ onChange }) {
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')

  function aoDigitar(evento) {
    const mascarado = mascararTelefone(evento.target.value)
    setValor(mascarado)
    setErro('')
    const r = validarTelefone(mascarado)
    onChange?.(r.ok ? r.e164 : null)
  }

  function aoSair() {
    const r = validarTelefone(valor)
    setErro(r.ok ? '' : r.erro)
  }

  return (
    <label>
      WhatsApp
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 91234-5678"
        value={valor}
        onChange={aoDigitar}
        onBlur={aoSair}
        aria-invalid={Boolean(erro)}
        aria-describedby="whatsapp-erro"
      />
      {erro && <small id="whatsapp-erro">{erro}</small>}
    </label>
  )
}
```

A máscara aceita texto colado (`+55 51 99188-4628`, `0 21 51 99188-4628`) e devolve o formato nacional. Ela nunca lança erro, então dá para chamar a cada tecla sem medo.

### Validação no servidor

O navegador ajuda a pessoa; quem decide é o servidor. Revalide sempre e guarde o E.164:

```js
import express from 'express'
import { validarTelefone } from 'telefone-anatel'

const app = express()
app.use(express.json())

app.post('/contato', async (req, res) => {
  const telefone = validarTelefone(req.body.telefone)
  if (!telefone.ok) {
    return res.status(422).json({ campo: 'telefone', codigo: telefone.codigo, erro: telefone.erro })
  }

  await salvarContato({ nome: req.body.nome, telefone: telefone.e164, uf: telefone.uf })
  res.status(201).json({ whatsapp: `https://wa.me/${telefone.e164.slice(1)}` })
})
```

O mesmo vale para qualquer runtime com `Request`/`Response` (Next.js, Hono, Cloudflare Workers, Deno, Bun):

```js
export async function POST(request) {
  const { telefone } = await request.json()
  const r = validarTelefone(telefone)
  if (!r.ok) return Response.json({ codigo: r.codigo, erro: r.erro }, { status: 422 })
  return Response.json({ telefone: r.e164 })
}
```

### Só celular (WhatsApp)

```js
const r = validarTelefone(entrada)
if (r.ok && r.tipo !== 'celular') {
  // fixo válido, mas o formulário pede WhatsApp
}
```

### Mensagens do seu jeito

```js
validarTelefone('', { mensagens: { VAZIO: 'Informe seu WhatsApp com DDD.' } })
// { ok: false, erro: 'Informe seu WhatsApp com DDD.', codigo: 'VAZIO' }

validarTelefone('(20) 99188-4628', { mensagens: { DDD_INEXISTENTE: 'Não achamos o DDD {ddd}.' } })
// { ok: false, erro: 'Não achamos o DDD 20.', codigo: 'DDD_INEXISTENTE' }
```

## API

### `validarTelefone(entrada, opcoes?)`

Valida um telefone em qualquer formatação. Ignora tudo que não for dígito, aceita `+55`, `0` + DDD e `0` + operadora + DDD na frente.

| Opção | Tipo | Padrão | O que faz |
| --- | --- | --- | --- |
| `naoGeograficos` | `boolean` | `false` | Aceita 0800, 0300, 0500, 0900, 3003 e 4000 a 4004. |
| `mensagens` | `Partial<Record<CodigoErro, string>>` | `MENSAGENS` | Troca as mensagens de erro. `{ddd}` vira o DDD informado. |

Quando o número é válido, devolve:

| Campo | Exemplo | Descrição |
| --- | --- | --- |
| `ok` | `true` | |
| `e164` | `'+5551991884628'` | Para guardar no banco e mandar para APIs. |
| `nacional` | `'(51) 99188-4628'` | Para mostrar na tela. |
| `internacional` | `'+55 51 99188-4628'` | Para mostrar a quem está fora do Brasil. |
| `ddd` | `'51'` | |
| `numero` | `'991884628'` | Número sem DDD, só dígitos. |
| `tipo` | `'celular'` ou `'fixo'` | |
| `uf` | `'RS'` | UF do DDD. |

Quando não é, devolve `{ ok: false, erro, codigo }`: `erro` é uma frase em pt-BR para o usuário e `codigo` é um dos [códigos de erro](#códigos-de-erro).

Com `naoGeograficos: true`, números como `0800 123 4567` e `4004-1234` passam com `tipo: 'nao-geografico'`, `ddd: null`, `uf: null` e `servico` com o prefixo (`'0800'`, `'4004'`…). Um 4004 com DDD na frente, como `(11) 4004-1234`, é tratado como fixo comum, que é o que ele é quando discado de fora das capitais.

### `mascararTelefone(entrada, opcoes?)`

Aplica a máscara enquanto a pessoa digita: `(51) 99188-4628` para celular e `(51) 3333-4444` para fixo. Aceita texto parcial, corta no 11º dígito e tira `+55` ou `0` + operadora de números colados. Com `{ naoGeograficos: true }`, também mascara `0800 123 4567` e `4004-1234`.

```js
mascararTelefone('5')             // '(5'
mascararTelefone('51')            // '(51'
mascararTelefone('519918')        // '(51) 9918'
mascararTelefone('5199188462')    // '(51) 99188-462'
mascararTelefone('5133334444')    // '(51) 3333-4444'
```

### `formatarTelefone(entrada, estilo?)`

Formata um número válido, em E.164, só dígitos ou já formatado. `estilo` é `'nacional'` (padrão), `'internacional'` ou `'e164'`. Devolve `null` se o número não for válido e lança `TypeError` para um estilo desconhecido. Aceita números não geográficos sem precisar de opção.

```js
formatarTelefone('+5551991884628')                    // '(51) 99188-4628'
formatarTelefone('+5551991884628', 'internacional')   // '+55 51 99188-4628'
formatarTelefone('(51) 3333-4444', 'e164')            // '+555133334444'
formatarTelefone('+558001234567')                     // '0800 123 4567'
formatarTelefone('123')                               // null
```

### `ehCelular(entrada)` e `ehFixo(entrada)`

Atalhos que devolvem `true` quando a entrada é um celular (ou fixo) válido.

### `DDDS`

Objeto congelado com os 67 DDDs. Cada um traz a UF e a principal cidade ou região:

```js
import { DDDS } from 'telefone-anatel'

DDDS[51]          // { uf: 'RS', regiao: 'Porto Alegre e região metropolitana' }
'20' in DDDS      // false
Object.keys(DDDS).filter((ddd) => DDDS[ddd].uf === 'SC')   // ['47', '48', '49']
```

### `MENSAGENS`

As mensagens padrão de cada código de erro, para reaproveitar ou traduzir.

### TypeScript

Os tipos vêm no pacote. O retorno é uma união discriminada por `ok`, então o TypeScript sabe quais campos existem em cada caso:

```ts
import { validarTelefone, type Ddd, type Uf, type CodigoErro } from 'telefone-anatel'

const r = validarTelefone(entrada)
if (r.ok) {
  r.e164   // string
  r.uf     // Uf
} else {
  r.codigo // CodigoErro
}
```

Sem a opção `naoGeograficos`, o tipo de retorno já exclui o caso não geográfico, então `r.ddd` é `Ddd` e nunca `null`.

## Códigos de erro

Os códigos são estáveis: mudar um deles é uma mudança incompatível e só acontece em versão major. As mensagens podem ser melhoradas em qualquer versão.

| Código | Quando | Mensagem padrão |
| --- | --- | --- |
| `VAZIO` | Nenhum dígito informado. | Informe o telefone com DDD. |
| `CURTO` | Menos de 10 dígitos depois de tirar os prefixos. | Inclua o DDD e o número completo, ex.: (11) 91234-5678. |
| `LONGO` | Mais de 11 dígitos depois de tirar os prefixos. | Número longo demais. Use DDD + número, ex.: (11) 91234-5678. |
| `DDD_INEXISTENTE` | O DDD não está entre os 67 em uso. | O DDD 20 não existe. Confira o código de área. |
| `REPETIDO` | Todos os dígitos do número são iguais, como 99999-9999. | Esse número não parece válido. Confira os dígitos. |
| `CELULAR_INVALIDO` | Número de 9 dígitos que não começa com 9. | Celular com 9 dígitos começa com 9. |
| `CELULAR_SEM_9` | Número de 8 dígitos começando com 6, 7, 8 ou 9: um celular sem o nono dígito. | Celular tem 9 dígitos: coloque o 9 antes do número. |
| `FIXO_INVALIDO` | Número de 8 dígitos começando com 0 ou 1. | Telefone fixo começa com 2, 3, 4 ou 5. |
| `NAO_GEOGRAFICO` | 0800, 0300, 4004 e similares sem a opção `naoGeograficos`. | Números 0800, 0300, 4004 e similares não são aceitos aqui. Informe um telefone com DDD. |

## O que a biblioteca não faz

- Não diz se o número existe, está ativo ou é WhatsApp. Para isso só enviando um código de verificação.
- Não descobre a operadora: com a portabilidade, o prefixo não indica mais a operadora.
- Não valida números de outros países.
- `+55 4004-1234` com o `+` é lido como número não geográfico; sem o `+`, `55 4004-1234` é um fixo do DDD 55 (Santa Maria, RS).

## DDDs

Os 67 códigos de área em uso, com a UF e a principal cidade ou região de cada um. O 61 atende o Distrito Federal e cidades vizinhas de Goiás.

| DDD | UF | Cidade ou região |
| --- | --- | --- |
| 11 | SP | São Paulo e região metropolitana |
| 12 | SP | São José dos Campos, Taubaté e Vale do Paraíba |
| 13 | SP | Santos e Baixada Santista |
| 14 | SP | Bauru, Marília e Jaú |
| 15 | SP | Sorocaba e Itapetininga |
| 16 | SP | Ribeirão Preto, Araraquara e Franca |
| 17 | SP | São José do Rio Preto e Barretos |
| 18 | SP | Presidente Prudente e Araçatuba |
| 19 | SP | Campinas, Piracicaba e Limeira |
| 21 | RJ | Rio de Janeiro e região metropolitana |
| 22 | RJ | Campos dos Goytacazes, Macaé e Região dos Lagos |
| 24 | RJ | Volta Redonda, Petrópolis e Angra dos Reis |
| 27 | ES | Vitória e região metropolitana |
| 28 | ES | Cachoeiro de Itapemirim e sul do ES |
| 31 | MG | Belo Horizonte e região metropolitana |
| 32 | MG | Juiz de Fora e Barbacena |
| 33 | MG | Governador Valadares e Teófilo Otoni |
| 34 | MG | Uberlândia, Uberaba e Triângulo Mineiro |
| 35 | MG | Poços de Caldas, Pouso Alegre e Varginha |
| 37 | MG | Divinópolis e centro-oeste de MG |
| 38 | MG | Montes Claros e norte de MG |
| 41 | PR | Curitiba e região metropolitana |
| 42 | PR | Ponta Grossa e Guarapuava |
| 43 | PR | Londrina e Apucarana |
| 44 | PR | Maringá e Umuarama |
| 45 | PR | Cascavel e Foz do Iguaçu |
| 46 | PR | Francisco Beltrão e Pato Branco |
| 47 | SC | Joinville, Blumenau e Itajaí |
| 48 | SC | Florianópolis e Criciúma |
| 49 | SC | Chapecó, Lages e Joaçaba |
| 51 | RS | Porto Alegre e região metropolitana |
| 53 | RS | Pelotas e Rio Grande |
| 54 | RS | Caxias do Sul e Passo Fundo |
| 55 | RS | Santa Maria, Uruguaiana e Santo Ângelo |
| 61 | DF | Brasília e Entorno do DF (inclui cidades de GO) |
| 62 | GO | Goiânia e Anápolis |
| 63 | TO | Palmas e Araguaína (todo o Tocantins) |
| 64 | GO | Rio Verde, Jataí e Itumbiara |
| 65 | MT | Cuiabá e Várzea Grande |
| 66 | MT | Rondonópolis, Sinop e Barra do Garças |
| 67 | MS | Campo Grande, Dourados e Corumbá (todo o MS) |
| 68 | AC | Rio Branco (todo o Acre) |
| 69 | RO | Porto Velho (todo Rondônia) |
| 71 | BA | Salvador e região metropolitana |
| 73 | BA | Ilhéus, Itabuna e Porto Seguro |
| 74 | BA | Juazeiro, Irecê e Jacobina |
| 75 | BA | Feira de Santana e Alagoinhas |
| 77 | BA | Vitória da Conquista e Barreiras |
| 79 | SE | Aracaju (todo Sergipe) |
| 81 | PE | Recife, região metropolitana e Caruaru |
| 82 | AL | Maceió (todo Alagoas) |
| 83 | PB | João Pessoa e Campina Grande (toda a Paraíba) |
| 84 | RN | Natal e Mossoró (todo o Rio Grande do Norte) |
| 85 | CE | Fortaleza e região metropolitana |
| 86 | PI | Teresina e Parnaíba |
| 87 | PE | Petrolina, Garanhuns e Serra Talhada |
| 88 | CE | Juazeiro do Norte e Sobral |
| 89 | PI | Picos e Floriano |
| 91 | PA | Belém e região metropolitana |
| 92 | AM | Manaus e Parintins |
| 93 | PA | Santarém e Altamira |
| 94 | PA | Marabá e Parauapebas |
| 95 | RR | Boa Vista (todo Roraima) |
| 96 | AP | Macapá (todo o Amapá) |
| 97 | AM | Tefé, Coari e interior do Amazonas |
| 98 | MA | São Luís e região metropolitana |
| 99 | MA | Imperatriz e Caxias |

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Se o plano de numeração mudar (um DDD novo, um prefixo não geográfico que falta), abra uma issue com o link da fonte na Anatel.

## Autoria

Feito pela [Pervian Tech](https://pervian.tech). A biblioteca nasceu da validação de telefone do site da empresa e foi separada em um pacote para que qualquer projeto possa usar as mesmas regras.

Licença [MIT](LICENSE).
