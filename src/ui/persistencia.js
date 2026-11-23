import MENSAGENS from '../messages/index.js';
import { carregarProjeto } from '../persistence/carregar.js';
import { serializarProjeto } from '../persistence/salvar.js';

/**
 * Reusa a validação de carga existente. Um JSON recusado nunca chega ao
 * workspace: o projeto aberto e seu Portugol permanecem intactos.
 */
export function criarAcoesPersistencia({ obterProjeto, aplicarProjeto, exibirMensagem }) {
  return {
    carregar(texto) {
      const resultado = carregarProjeto(texto, { projeto: obterProjeto() });

      if (resultado.mensagens.length > 0) {
        exibirMensagem(resultado.mensagens.join('\n'));
        return resultado;
      }

      aplicarProjeto(resultado.projeto);
      exibirMensagem(MENSAGENS.carregadoComSucesso);
      return resultado;
    },

    salvar() {
      const json = serializarProjeto(obterProjeto());
      exibirMensagem(MENSAGENS.salvoComSucesso);
      return json;
    },
  };
}

export default criarAcoesPersistencia;
