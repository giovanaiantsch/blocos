import MENSAGENS, { mensagemBlocoDesconhecido } from '../messages/index.js';
import SINTAXE from './sintaxe.js';

function coletarVariaveis(blocos, variaveis) {
  for (const bloco of blocos ?? []) {
    if (!bloco || typeof bloco !== 'object') {
      continue;
    }

    if (
      bloco.tipo === 'leia' ||
      bloco.tipo === 'atribuir' ||
      bloco.tipo === 'declarar' ||
      bloco.tipo === 'para'
    ) {
      if (typeof bloco.variavel === 'string' && bloco.variavel.trim()) {
        // Uma declaração explícita não pode ser sobrescrita pelo tipo padrão
        // de uma atribuição posterior à mesma variável.
        if (!variaveis.has(bloco.variavel) || bloco.tipoVariavel) {
          variaveis.set(bloco.variavel, bloco.tipoVariavel ?? SINTAXE.tipoPadrao);
        }
      }
    }

    coletarVariaveis(bloco.ramos?.entao, variaveis);
    coletarVariaveis(bloco.ramos?.senao, variaveis);
    coletarVariaveis(bloco.corpo, variaveis);
  }
}

function exigirTexto(valor) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error(MENSAGENS.expressaoIncompleta);
  }
  return valor;
}

function gerarBlocos(blocos, nivel) {
  const prefixo = SINTAXE.indentacao.repeat(nivel);
  const linhas = [];

  for (const bloco of blocos ?? []) {
    if (!bloco || typeof bloco !== 'object') {
      throw new Error(MENSAGENS.expressaoIncompleta);
    }

    switch (bloco.tipo) {
      case 'declarar':
        // Declarações globais são emitidas no bloco var, não no início.
        break;
      case 'atribuir':
        exigirTexto(bloco.variavel);
        linhas.push(prefixo + SINTAXE.atribuir(bloco.variavel, exigirTexto(bloco.expressao)));
        break;
      case 'leia':
        linhas.push(prefixo + SINTAXE.leia(exigirTexto(bloco.variavel)));
        break;
      case 'escreva':
      case 'operador':
        linhas.push(prefixo + SINTAXE.escreva(exigirTexto(bloco.expressao)));
        break;
      case 'se': {
        linhas.push(prefixo + SINTAXE.seAbrir(exigirTexto(bloco.condicao)));
        linhas.push(
          ...gerarBlocos(bloco.ramos?.entao ?? [], nivel + 1),
        );
        if (bloco.ramos?.senao !== undefined) {
          linhas.push(prefixo + SINTAXE.senao);
          linhas.push(...gerarBlocos(bloco.ramos.senao, nivel + 1));
        }
        linhas.push(prefixo + SINTAXE.seFechar);
        break;
      }
      case 'enquanto':
        linhas.push(prefixo + SINTAXE.enquantoAbrir(exigirTexto(bloco.condicao)));
        linhas.push(...gerarBlocos(bloco.corpo ?? [], nivel + 1));
        linhas.push(prefixo + SINTAXE.enquantoFechar);
        break;
      case 'para':
        linhas.push(
          prefixo +
            SINTAXE.paraAbrir(
              exigirTexto(bloco.variavel),
              bloco.inicio,
              bloco.fim,
              bloco.passo,
            ),
        );
        linhas.push(...gerarBlocos(bloco.corpo ?? [], nivel + 1));
        linhas.push(prefixo + SINTAXE.paraFechar);
        break;
      default:
        throw new Error(mensagemBlocoDesconhecido(String(bloco.tipo)));
    }
  }

  return linhas;
}

/**
 * Gerador puro: nenhum arquivo, rede, relógio, DOM ou estado global.
 * A sintaxe fica concentrada em `sintaxe.js` para ajuste após T007.
 */
export function gerarPortugol(projeto) {
  const blocos = projeto?.blocos;

  if (!Array.isArray(blocos) || blocos.length === 0) {
    return MENSAGENS.vazio;
  }

  const variaveis = new Map();
  coletarVariaveis(blocos, variaveis);

  const linhas = [SINTAXE.cabecalho(exigirTexto(projeto.titulo)), ''];

  if (variaveis.size > 0) {
    linhas.push('var');
    for (const [nome, tipo] of variaveis) {
      linhas.push(SINTAXE.indentacao + SINTAXE.declaracao(nome, tipo));
    }
    linhas.push('');
  }

  linhas.push(SINTAXE.inicio);
  linhas.push(...gerarBlocos(blocos, 1));
  linhas.push(SINTAXE.fim);

  return linhas.join('\n');
}

export default gerarPortugol;
