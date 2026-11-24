/**
 * Catálogo provisório de operadores, extraído do Guia da Linguagem do Core
 * público (PyPI `meuPia-core@1.4.1`). A tag congelada da turma ainda não foi
 * confirmada (Q-01/T006/T007), então esta tabela NÃO é definitiva.
 */
export const OPERADORES_PROVISORIOS = Object.freeze({
  soma: Object.freeze({ simbolo: '+', categoria: 'aritmético' }),
  subtracao: Object.freeze({ simbolo: '-', categoria: 'aritmético' }),
  multiplicacao: Object.freeze({ simbolo: '*', categoria: 'aritmético' }),
  divisao: Object.freeze({ simbolo: '/', categoria: 'aritmético' }),
  maior: Object.freeze({ simbolo: '>', categoria: 'relacional' }),
  menor: Object.freeze({ simbolo: '<', categoria: 'relacional' }),
  maiorOuIgual: Object.freeze({ simbolo: '>=', categoria: 'relacional' }),
  menorOuIgual: Object.freeze({ simbolo: '<=', categoria: 'relacional' }),
  igual: Object.freeze({ simbolo: '==', categoria: 'relacional' }),
  e: Object.freeze({ simbolo: 'e', categoria: 'lógico' }),
  ou: Object.freeze({ simbolo: 'ou', categoria: 'lógico' }),
  nao: Object.freeze({ simbolo: 'nao', categoria: 'lógico' }),
});

const SIMBOLOS = Object.values(OPERADORES_PROVISORIOS).map((item) => item.simbolo);
const BINARIOS = new Set(SIMBOLOS.filter((simbolo) => simbolo !== 'nao'));
const PALAVRAS_LOGICAS = new Set(['e', 'ou', 'nao']);

function tokenizar(texto) {
  return texto.match(/>=|<=|==|[+*/<>()-]|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|"[^"]*"|'[^']*'/g) ?? [];
}

/** Rejeita operadores fora do catálogo sem tentar reescrever a expressão. */
export function expressaoAceita(texto) {
  if (typeof texto !== 'string' || !texto.trim()) {
    return false;
  }

  const tokens = tokenizar(texto);
  if (tokens.join('').replace(/\s/g, '') !== texto.replace(/\s/g, '')) {
    return false;
  }

  return tokens.every((token, indice) => {
    const anterior = tokens[indice - 1];
    if (BINARIOS.has(token) && (!anterior || BINARIOS.has(anterior) || anterior === '(')) {
      return false;
    }
    if (PALAVRAS_LOGICAS.has(token) || SIMBOLOS.includes(token)) {
      return true;
    }
    if (/^[A-Za-z_][A-Za-z_0-9]*$/.test(token) || /^\d/.test(token)) {
      return true;
    }
    return /^["']/.test(token);
  });
}

export default OPERADORES_PROVISORIOS;
