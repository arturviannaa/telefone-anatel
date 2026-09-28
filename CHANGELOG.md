# Changelog

Todas as mudanças relevantes deste projeto ficam registradas aqui. O formato segue o
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[versionamento semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-09-28

Primeira versão.

### Adicionado

- `validarTelefone(entrada, opcoes?)`: valida pelo plano de numeração da Anatel (67 DDDs,
  celular de 9 dígitos começando com 9, fixo de 8 dígitos começando com 2 a 5), aceita
  `+55`, `0` + DDD e `0` + operadora + DDD, e devolve E.164, formato nacional,
  internacional, DDD, número, tipo e UF.
- Códigos de erro estáveis (`VAZIO`, `CURTO`, `LONGO`, `DDD_INEXISTENTE`, `REPETIDO`,
  `CELULAR_INVALIDO`, `CELULAR_SEM_9`, `FIXO_INVALIDO`, `NAO_GEOGRAFICO`) com mensagens
  em pt-BR que podem ser trocadas pela opção `mensagens`.
- `mascararTelefone(entrada, opcoes?)`: máscara enquanto digita.
- `formatarTelefone(entrada, estilo?)`: estilos `nacional`, `internacional` e `e164`.
- `ehCelular` e `ehFixo`.
- `DDDS`: os 67 DDDs com UF e principal cidade ou região.
- `MENSAGENS`: as mensagens padrão de cada código de erro.
- Opção `naoGeograficos` para 0800, 0300, 0500, 0900, 3003 e 4000 a 4004.
- ESM e CommonJS, tipos TypeScript, zero dependências.

[1.0.0]: https://github.com/arturviannaa/telefone-anatel/releases/tag/v1.0.0
