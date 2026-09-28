# Contribuindo

Obrigado pelo interesse. Issues e pull requests são bem-vindos.

## Rodando o projeto

Não há dependências para instalar. Com Node 18 ou mais novo:

```sh
npm test
```

O `npm test` gera a pasta `dist/` (ESM, CommonJS e tipos) a partir de `src/` e roda os
testes com o `node:test`, importando o pacote pelo próprio nome, do jeito que quem instala
vai usar.

## Antes de abrir um pull request

- Escreva um teste para o que mudou. Correção de bug começa com um teste que falha.
- Mantenha zero dependências e compatibilidade com Node 18 e navegadores.
- Se mudar a API, atualize `src/index.d.ts`, o README e o `CHANGELOG.md`.
- Mudança nas regras de numeração (DDD novo, prefixo não geográfico) precisa vir com o
  link da fonte na Anatel.
- Códigos de erro são estáveis: renomear ou remover um deles é mudança incompatível.
