import * as Blockly from 'blockly';

import { carregarProjetoNoWorkspace, serializarWorkspace } from '../blocks/serializacao.js';
import { TOOLBOX } from '../blocks/toolbox.js';
import { registrarBlocosLeiaEscreva } from '../blocks/leia-escreva.js';
import MENSAGENS from '../messages/index.js';
import { VERSAO_PROJETO } from '../persistence/schema.js';
import { registrarObservador } from './estado.js';
import { obterElementos } from './layout.js';
import { criarAcoesPersistencia } from './persistencia.js';
import { exibirIndisponivel, exibirMensagem as registrarMensagem } from './saida-execucao.js';

registrarBlocosLeiaEscreva(Blockly);

const elementos = obterElementos(document);
const workspace = Blockly.inject(elementos.blocos, {
  toolbox: TOOLBOX,
  trashcan: true,
  scrollbars: true,
  grid: { spacing: 20, length: 3, colour: '#ddd', snap: true },
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

function exibirMensagem(mensagem) {
  estadoDaInterface = registrarMensagem(estadoDaInterface, mensagem, elementos.saida);
}

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
    elementos.titulo.value = projeto.titulo;
    elementos.entradas.value = projeto.entrada.join('\n');
    carregarProjetoNoWorkspace(projeto, workspace);
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

elementos.executar.addEventListener('click', () => {
  estadoDaInterface = exibirIndisponivel(estadoDaInterface, elementos.saida);
});

exibirMensagem(MENSAGENS.compilacaoIndisponivel);
