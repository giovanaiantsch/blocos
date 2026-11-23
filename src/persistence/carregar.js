import { gerarPortugol } from '../generation/gerador.js';
import MENSAGENS from '../messages/index.js';
import { criarEstadoInicial, validarProjeto } from './schema.js';

/**
 * Carrega um projeto a partir do texto do arquivo JSON.
 *
 * Nenhuma validação apaga o estado anterior: em caso de recusa, o projeto
 * aberto é preservado em `projetoAnterior` e as mensagens vêm em pt-BR
 * (data-model.md, contratos/project-json.md, RF-14/RF-15/RT-04).
 */
export function carregarProjeto(texto, estadoAtual = criarEstadoInicial()) {
  const anterior = estadoAtual?.projeto ?? estadoAtual?.projetoAnterior ?? null;
  const estado = {
    ...criarEstadoInicial(),
    portugolGerado: estadoAtual?.portugolGerado ?? '',
    projetoAnterior: anterior,
  };

  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return {
      ...estado,
      projeto: anterior,
      mensagens: [MENSAGENS.jsonInvalido],
    };
  }

  const validacao = validarProjeto(dados);
  if (!validacao.valido) {
    return {
      ...estado,
      projeto: anterior,
      mensagens: validacao.erros,
    };
  }

  return {
    ...estado,
    projeto: validacao.projeto,
    portugolGerado: gerarPortugol(validacao.projeto),
    mensagens: [],
  };
}

export default carregarProjeto;
