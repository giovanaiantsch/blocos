import { describe, expect, it } from 'vitest';

import MENSAGENS from '../../src/messages/index.js';
import {
  exibirIndisponivel,
  exibirMensagem,
} from '../../src/ui/saida-execucao.js';

describe('painel de saída sem Core real (T018 parcial)', () => {
  it('mostra em pt-BR que a execução está indisponível', () => {
    const painel = { textContent: '' };
    const estado = exibirIndisponivel({ projeto: { titulo: 'x' } }, painel);

    expect(painel.textContent).toBe(MENSAGENS.execucaoIndisponivel);
    expect(estado.statusExecucao).toBe('erro');
    expect(estado.mensagens).toContain(MENSAGENS.execucaoIndisponivel);
    expect(estado.projeto).toEqual({ titulo: 'x' });
  });

  it('aceita atualizar a mensagem sem perder o histórico', () => {
    const estado = exibirMensagem({}, 'Primeira mensagem.');
    const atualizado = exibirMensagem(estado, 'Segunda mensagem.');

    expect(atualizado.mensagens).toEqual(['Primeira mensagem.', 'Segunda mensagem.']);
  });
});
