const MENSAGENS = Object.freeze({
  jsonInvalido: 'O arquivo não contém um JSON válido.',
  versaoIncompativel: 'Versão de projeto incompatível.',
  tituloInvalido: 'Informe um título de 1 a 80 caracteres.',
  entradaIncompleta: 'Informe um valor para cada bloco de leitura.',
  expressaoIncompleta: 'Expressão incompleta.',
  limiteExecucao: 'Execução interrompida: limite de 5 segundos atingido.',
  vazio: 'Ainda não há código.',
  execucaoIndisponivel: 'Execução indisponível: tag do Core ainda não confirmada.',
  compilacaoIndisponivel: 'A compilação no Core real estará disponível após a confirmação da tag.',
  carregadoComSucesso: 'Projeto carregado com sucesso.',
  salvoComSucesso: 'Projeto salvo com sucesso.',
  problemaAoCompilar: 'O Portugol gerado não pôde ser compilado.',
  problemaAoExecutar: 'Ocorreu um erro durante a execução do programa.',
});

export function mensagemBlocoDesconhecido(tipo) {
  return `Bloco não reconhecido: ${tipo}.`;
}

export default MENSAGENS;
