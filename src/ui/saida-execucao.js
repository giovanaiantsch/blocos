import MENSAGENS from '../messages/index.js';

function registrar(estado, mensagem, elemento) {
  if (elemento) {
    elemento.textContent = mensagem;
  }
  return {
    ...estado,
    statusExecucao: 'erro',
    mensagens: [...(estado?.mensagens ?? []), mensagem],
  };
}

/** Mantém o projeto intacto: somente o painel de saída muda. */
export function exibirMensagem(estado, mensagem, elemento) {
  return registrar(estado, mensagem, elemento);
}

export function exibirIndisponivel(estado, elemento) {
  return registrar(estado, MENSAGENS.execucaoIndisponivel, elemento);
}

export function exibirResultado(estado, resultado, elemento) {
  const mensagem = resultado.saida || resultado.erro || MENSAGENS.problemaAoExecutar;
  return registrar(estado, mensagem, elemento);
}

export default exibirMensagem;
