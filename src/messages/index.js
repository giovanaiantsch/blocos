const MENSAGENS = Object.freeze({
  jsonInvalido: 'O arquivo não contém um JSON válido.',
  versaoIncompativel: 'Versão de projeto incompatível.',
  tituloInvalido: 'Informe um título de 1 a 80 caracteres.',
  entradaIncompleta: 'Informe um valor para cada bloco de leitura.',
  expressaoIncompleta: 'Expressão incompleta.',
  limiteExecucao: 'Execução interrompida: limite de 5 segundos atingido.',
  vazio: 'Ainda não há código.',
});

export function mensagemBlocoDesconhecido(tipo) {
  return `Bloco não reconhecido: ${tipo}.`;
}

export default MENSAGENS;
