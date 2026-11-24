import * as Blockly from 'blockly';

import { carregarProjetoNoWorkspace, serializarWorkspace } from '../blocks/serializacao.js';
import { inicializarBloco, registrarBlocos } from '../blocks/registro.js';
import { TOOLBOX } from '../blocks/toolbox.js';
import { toolboxParaMissao } from '../blocks/toolboxParaMissao.js';
import MENSAGENS from '../messages/index.js';
import { derivarBlocosPermitidos } from '../missoes/derivar.js';
import { lerMissao } from '../missoes/schema.js';
import { VERSAO_PROJETO } from '../persistence/schema.js';
import { registrarObservador } from './estado.js';
import { executarProjeto } from './execucao.js';
import { obterElementos } from './layout.js';
import { criarAcoesPersistencia } from './persistencia.js';
import { exibirIndisponivel, exibirMensagem as registrarMensagem, exibirResultado } from './saida-execucao.js';

registrarBlocos(Blockly);

const elementos = obterElementos(document);
const workspace = Blockly.inject(elementos.blocos, {
  toolbox: TOOLBOX,
  trashcan: true,
  scrollbars: true,
  grid: { spacing: 20, length: 3, colour: '#ddd', snap: true },
});

workspace.addChangeListener((evento) => {
  if (evento.type !== Blockly.Events.BLOCK_CREATE || evento.isUiEvent) {
    return;
  }
  const bloco = workspace.getBlockById(evento.blockId);
  if (bloco) {
    inicializarBloco(bloco, workspace);
  }
});

function interpretarEntradas(texto) {
  return texto
    .split(/\r?\n/)
    .map((valor) => valor.trim())
    .filter(Boolean)
    .map((valor) => {
      const numero = Number(valor);
      return Number.isNaN(numero) ? valor : numero;
    });
}

function obterProjeto() {
  return {
    versao: VERSAO_PROJETO,
    titulo: elementos.titulo.value.trim() || 'Sem título',
    blocos: serializarWorkspace(workspace),
    entrada: interpretarEntradas(elementos.entradas.value),
  };
}

let estadoDaInterface = {};

function exibirMensagem(mensagem, status) {
  estadoDaInterface = registrarMensagem(estadoDaInterface, mensagem, elementos.saida, status);
}

let selecaoAnterior = elementos.missao.value;

function aplicarMissao(missao) {
  const tipos = missao ? derivarBlocosPermitidos(missao) : null;

  if (missao) {
    const tiposNoPrograma = serializarWorkspace(workspace).map((bloco) => bloco.tipo);
    const incompativeis = tiposNoPrograma.filter((tipo) => !tipos.includes(tipo));
    if (incompativeis.length > 0 && !window.confirm(MENSAGENS.missaoIncompativel)) {
      elementos.missao.value = selecaoAnterior;
      return;
    }
  }

  selecaoAnterior = missao?.id ?? '';
  if (missao) {
    elementos.missao.value = missao.id;
  }
  workspace.updateToolbox(toolboxParaMissao(tipos));
  elementos.descricaoMissao.textContent = missao
    ? `${missao.titulo}\n\n${missao.descricao}`
    : 'Nenhuma missão carregada. Selecione uma missão para ajustar a toolbox.';
  exibirMensagem(missao ? MENSAGENS.missaoCarregada : MENSAGENS.missaoRemovida);
}

async function carregarMissaoDoTexto(texto) {
  const resultado = lerMissao(texto);
  if (!resultado.valido) {
    throw new Error(resultado.erros[0]);
  }
  aplicarMissao(resultado.missao);
}

elementos.missao.addEventListener('change', async () => {
  const escolha = elementos.missao.value;
  if (escolha === 'arquivo') {
    elementos.arquivoMissao.click();
    return;
  }
  if (!escolha) {
    aplicarMissao(null);
    return;
  }
  try {
    const resposta = await fetch(`/missoes/${encodeURIComponent(escolha)}.json`);
    if (!resposta.ok) {
      throw new Error(MENSAGENS.missaoNaoEncontrada);
    }
    await carregarMissaoDoTexto(await resposta.text());
  } catch (erro) {
    exibirMensagem(erro.message);
    elementos.missao.value = selecaoAnterior;
  }
});

elementos.arquivoMissao.addEventListener('change', async () => {
  const arquivo = elementos.arquivoMissao.files?.[0];
  if (!arquivo) {
    elementos.missao.value = selecaoAnterior;
    return;
  }
  try {
    await carregarMissaoDoTexto(await arquivo.text());
  } catch (erro) {
    exibirMensagem(erro.message);
    elementos.missao.value = selecaoAnterior;
  } finally {
    elementos.arquivoMissao.value = '';
  }
});

registrarObservador({
  workspace,
  obterProjeto,
  pintar: (texto) => {
    elementos.portugol.textContent = texto;
  },
});

const acoes = criarAcoesPersistencia({
  obterProjeto,
  aplicarProjeto(projeto) {
    // Restaura primeiro os blocos: se falhar, campos e Portugol antigos
    // permanecem intactos em vez de mostrar um projeto pela metade.
    carregarProjetoNoWorkspace(projeto, workspace);
    elementos.titulo.value = projeto.titulo;
    elementos.entradas.value = projeto.entrada.join('\n');
  },
  exibirMensagem,
});

elementos.carregar.addEventListener('click', () => elementos.arquivo.click());

elementos.arquivo.addEventListener('change', async () => {
  const arquivo = elementos.arquivo.files?.[0];
  if (!arquivo) {
    return;
  }
  acoes.carregar(await arquivo.text());
  elementos.arquivo.value = '';
});

elementos.salvar.addEventListener('click', () => {
  const json = acoes.salvar();
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'projeto.json';
  link.click();
  URL.revokeObjectURL(url);
});

elementos.executar.addEventListener('click', async () => {
  exibirMensagem(MENSAGENS.compilando, 'compilando');
  try {
    const resultado = await executarProjeto(obterProjeto());
    estadoDaInterface = exibirResultado(estadoDaInterface, resultado, elementos.saida);
  } catch (erro) {
    exibirMensagem(`${MENSAGENS.falhaAoChamarCore} ${erro.message}`);
  }
});

exibirMensagem(MENSAGENS.pronto);
