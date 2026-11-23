/**
 * Tabela isolada de formatação do Portugol.
 *
 * Sintaxe provisória extraída do Guia da Linguagem oficial do meuPiá Core
 * (https://github.com/meuPia/core, docs/guia-da-linguagem.md), conforme
 * plan.md. Os pontos dependentes da tag congelada (RT-01) estão listados em
 * tasks.md T007 e devem ser confirmados antes da aceitação com o Core real:
 * palavras-chave exatas, tipos aceitos, operadores, declaração prévia, nome do
 * arquivo Python gerado e idioma dos erros de execução.
 */

export const SINTAXE = Object.freeze({
  indentacao: '    ',
  tipoPadrao: 'inteiro',
  tiposAceitos: Object.freeze(['inteiro', 'real', 'float', 'cadeia', 'string', 'logico']),
  cabecalho: (titulo) => `algoritmo "${titulo}"`,
  declaracao: (variavel, tipo) => `${variavel}: ${tipo}`,
  inicio: 'inicio',
  fim: 'fim_algoritmo',
  leia: (variavel) => `leia(${variavel})`,
  atribuir: (variavel, expressao) => `${variavel} <- ${expressao}`,
  escreva: (expressao) => `escreva(${expressao})`,
  seAbrir: (condicao) => `se ${condicao} entao`,
  senao: 'senao',
  seFechar: 'fim_se',
  enquantoAbrir: (condicao) => `enquanto ${condicao} faca`,
  enquantoFechar: 'fim_enquanto',
  paraAbrir: (variavel, inicio, fim, passo) =>
    `para ${variavel} de ${inicio} ate ${fim} passo ${passo} faca`,
  paraFechar: 'fim_para',
});

export default SINTAXE;
