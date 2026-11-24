import MENSAGENS from '../messages/index.js';

function registrar(estado, mensagem, elemento, statusExecucao = 'erro') {
  if (elemento) {
    elemento.textContent = mensagem;
  }
  return {
    ...estado,
    statusExecucao,
    mensagens: [...(estado?.mensagens ?? []), mensagem],
  };
}

/** Mantém o projeto intacto: somente o painel de saída muda. */
export function exibirMensagem(estado, mensagem, elemento, statusExecucao) {
  return registrar(estado, mensagem, elemento, statusExecucao);
}

export function exibirIndisponivel(estado, elemento) {
  return registrar(estado, MENSAGENS.execucaoIndisponivel, elemento);
}

export function exibirResultado(estado, resultado, elemento) {
  const mensagem = resultado.saida || resultado.erro || MENSAGENS.problemaAoExecutar;
  const status = resultado.status === 'sucesso'
    ? 'sucesso'
    : resultado.status === 'limite'
      ? 'limite'
      : 'erro';
  return registrar(estado, mensagem, elemento, status);
}

export default exibirMensagem;
