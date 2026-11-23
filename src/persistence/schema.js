import MENSAGENS, { mensagemBlocoDesconhecido } from '../messages/index.js';

export const VERSAO_PROJETO = 1;
export const TIPO_PADRAO_VARIAVEL = 'inteiro';

export const STATUS_EXECUCAO = Object.freeze([
  'parado',
  'compilando',
  'executando',
  'sucesso',
  'erro',
  'limite',
]);

export const STATUS_RESULTADO = Object.freeze([
  'sucesso',
  'erro_compilacao',
  'erro_execucao',
  'limite',
]);

const TIPOS_BLOCO = new Set([
  'declarar',
  'atribuir',
  'leia',
  'escreva',
  'se',
  'enquanto',
  'para',
  'operador',
]);

const textoNaoVazio = (valor) => typeof valor === 'string' && valor.trim().length > 0;
const inteiro = (valor) => Number.isInteger(valor);
const lista = (valor) => Array.isArray(valor);

function contemBlocos(blocos) {
  return lista(blocos) ? blocos.length > 0 : false;
}

function validarBloco(bloco, erros, caminho = 'bloco') {
  if (!bloco || typeof bloco !== 'object' || Array.isArray(bloco)) {
    erros.push(`${caminho}: bloco inválido.`);
    return;
  }

  if (!TIPOS_BLOCO.has(bloco.tipo)) {
    erros.push(mensagemBlocoDesconhecido(String(bloco.tipo)));
    return;
  }

  switch (bloco.tipo) {
    case 'declarar':
      if (!textoNaoVazio(bloco.variavel) || !textoNaoVazio(bloco.tipoVariavel)) {
        erros.push(`${caminho}: informe a variável e o tipo da declaração.`);
      }
      break;
    case 'atribuir':
      if (!textoNaoVazio(bloco.variavel)) {
        erros.push(`${caminho}: informe a variável da atribuição.`);
      }
      if (!textoNaoVazio(bloco.expressao)) {
        erros.push(MENSAGENS.expressaoIncompleta);
      }
      break;
    case 'leia':
      if (!textoNaoVazio(bloco.variavel)) {
        erros.push(`${caminho}: informe a variável da leitura.`);
      }
      break;
    case 'escreva':
    case 'operador':
      if (!textoNaoVazio(bloco.expressao)) {
        erros.push(MENSAGENS.expressaoIncompleta);
      }
      break;
    case 'se':
      if (!textoNaoVazio(bloco.condicao)) {
        erros.push(`${caminho}: informe a condição do bloco se.`);
      }
      if (!bloco.ramos || !lista(bloco.ramos.entao) || !lista(bloco.ramos.senao ?? [])) {
        erros.push(`${caminho}: os ramos do bloco se devem ser listas de blocos.`);
      } else {
        validarBlocos(bloco.ramos.entao, erros, `${caminho}.ramos.entao`);
        validarBlocos(bloco.ramos.senao ?? [], erros, `${caminho}.ramos.senao`);
      }
      break;
    case 'enquanto':
      if (!textoNaoVazio(bloco.condicao)) {
        erros.push(`${caminho}: informe a condição do bloco enquanto.`);
      }
      if (!lista(bloco.corpo)) {
        erros.push(`${caminho}: o corpo do bloco enquanto deve ser uma lista de blocos.`);
      } else {
        validarBlocos(bloco.corpo, erros, `${caminho}.corpo`);
      }
      break;
    case 'para':
      if (!textoNaoVazio(bloco.variavel)) {
        erros.push(`${caminho}: informe a variável de controle do bloco para.`);
      }
      if (!inteiro(bloco.inicio)) {
        erros.push(`${caminho}: informe um início inteiro para o bloco para.`);
      }
      if (!inteiro(bloco.fim)) {
        erros.push(`${caminho}: informe um fim inteiro para o bloco para.`);
      }
      if (!inteiro(bloco.passo)) {
        erros.push(`${caminho}: informe um passo inteiro para o bloco para.`);
      }
      if (!lista(bloco.corpo)) {
        erros.push(`${caminho}: o corpo do bloco para deve ser uma lista de blocos.`);
      } else {
        validarBlocos(bloco.corpo, erros, `${caminho}.corpo`);
      }
      break;
    default:
      break;
  }
}

function validarBlocos(blocos, erros, caminho) {
  blocos.forEach((bloco, indice) => validarBloco(bloco, erros, `${caminho}[${indice}]`));
}

export function contarLeituras(blocos) {
  if (!lista(blocos)) {
    return 0;
  }
  return blocos.reduce((total, bloco) => {
    if (!bloco || typeof bloco !== 'object') {
      return total;
    }
    let quantidade = bloco.tipo === 'leia' ? 1 : 0;
    if (bloco.ramos) {
      quantidade += contarLeituras(bloco.ramos.entao);
      quantidade += contarLeituras(bloco.ramos.senao);
    }
    quantidade += contarLeituras(bloco.corpo);
    return total + quantidade;
  }, 0);
}

export function validarProjeto(projeto) {
  const erros = [];

  if (!projeto || typeof projeto !== 'object' || Array.isArray(projeto)) {
    return { valido: false, erros: [MENSAGENS.jsonInvalido], projeto: null };
  }

  if (projeto.versao !== VERSAO_PROJETO) {
    erros.push(MENSAGENS.versaoIncompativel);
  }

  if (!textoNaoVazio(projeto.titulo) || projeto.titulo.length > 80) {
    erros.push(MENSAGENS.tituloInvalido);
  }

  if (!lista(projeto.blocos)) {
    erros.push('A lista de blocos do projeto é obrigatória.');
  } else {
    validarBlocos(projeto.blocos, erros, 'blocos');
  }

  if (!lista(projeto.entrada)) {
    erros.push('A lista de entradas do projeto é obrigatória.');
  } else if (lista(projeto.blocos) && projeto.entrada.length !== contarLeituras(projeto.blocos)) {
    erros.push(MENSAGENS.entradaIncompleta);
  }

  return { valido: erros.length === 0, erros, projeto: erros.length === 0 ? projeto : null };
}

export function criarEstadoInicial() {
  return {
    projeto: null,
    portugolGerado: '',
    statusExecucao: 'parado',
    mensagens: [],
    projetoAnterior: null,
  };
}

export function criarResultadoExecucao({
  status = 'erro_execucao',
  saida = '',
  erro = '',
  duracaoMs = 0,
  interrompidoPorLimite = false,
} = {}) {
  return { status, saida, erro, duracaoMs, interrompidoPorLimite };
}

export function temBlocos(projeto) {
  return contemBlocos(projeto?.blocos);
}
