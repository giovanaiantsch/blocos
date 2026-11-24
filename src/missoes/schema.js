import MENSAGENS from '../messages/index.js';

const textoNaoVazio = (valor) => typeof valor === 'string' && valor.trim().length > 0;

/**
 * Valida o schema público do meuPiá Desafios (R8/D-07).
 * `instrucoes` é apelido documentado no README; `mapa` e outros campos extras
 * são ignorados. Nenhum campo de blocos permitidos é exigido.
 */
export function validarMissao(missao) {
  if (!missao || typeof missao !== 'object' || Array.isArray(missao)) {
    return { valido: false, erros: [MENSAGENS.missaoInvalida], missao: null };
  }

  const erros = [];
  const descricao = textoNaoVazio(missao.descricao) ? missao.descricao : missao.instrucoes;

  if (!textoNaoVazio(missao.id) || /\s/.test(missao.id.trim())) {
    erros.push(MENSAGENS.missaoInvalida);
  }
  if (!textoNaoVazio(missao.titulo)) {
    erros.push(MENSAGENS.missaoInvalida);
  }
  if (!textoNaoVazio(descricao)) {
    erros.push(MENSAGENS.missaoInvalida);
  }
  if (!textoNaoVazio(missao.codigoInicial)) {
    erros.push(MENSAGENS.missaoInvalida);
  }
  if (!textoNaoVazio(missao.codigoTeste)) {
    erros.push(MENSAGENS.missaoInvalida);
  }

  if (erros.length > 0) {
    return { valido: false, erros: [...new Set(erros)], missao: null };
  }

  return {
    valido: true,
    erros: [],
    missao: Object.freeze({
      id: missao.id.trim(),
      titulo: missao.titulo.trim(),
      descricao: String(descricao),
      codigoInicial: String(missao.codigoInicial),
      codigoTeste: String(missao.codigoTeste),
    }),
  };
}

/** Conteúdo de arquivo → missão validada, sem tocar em estado externo. */
export function lerMissao(texto) {
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    return { valido: false, erros: [MENSAGENS.jsonInvalido], missao: null };
  }
  return validarMissao(dados);
}

export default validarMissao;
