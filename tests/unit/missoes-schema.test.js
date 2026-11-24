import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import MENSAGENS from '../../src/messages/index.js';
import { lerMissao, validarMissao } from '../../src/missoes/schema.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ler = (nome) => readFileSync(resolve(raiz, 'public/missoes', nome), 'utf8');

describe('schema das missões do Desafios (EC-01)', () => {
  it('aceita as duas missões oficiais versionadas', () => {
    for (const nome of ['calculo_gn_taximetro.json', 'fila_prioridade_simples.json']) {
      const resultado = lerMissao(ler(nome));
      expect(resultado.valido, nome).toBe(true);
      expect(resultado.missao.id).toBe(nome.replace('.json', ''));
      expect(resultado.missao.codigoInicial).toContain('algoritmo');
    }
  });

  it('aceita a missão de exemplo com campo mapa ausente', () => {
    expect(lerMissao(ler('grid-visitar.json')).valido).toBe(true);
  });

  it('aceita instrucoes como apelido de descricao, como no README oficial', () => {
    const resultado = validarMissao({
      id: 'missao_teste',
      titulo: 'Missão de teste',
      instrucoes: 'Escreva algo.',
      codigoInicial: 'algoritmo "Teste"\ninicio\nfim_algoritmo',
      codigoTeste: 'esperar_igual(1, 1, "ok")',
      mapa: { largura: 3, altura: 3 },
    });
    expect(resultado.valido).toBe(true);
    expect(resultado.missao.descricao).toBe('Escreva algo.');
  });

  it('recusa campos obrigatórios ausentes com mensagem em pt-BR', () => {
    const resultado = validarMissao({ id: 'incompleta', titulo: 'Incompleta' });
    expect(resultado.valido).toBe(false);
    expect(resultado.erros).toEqual([MENSAGENS.missaoInvalida]);
    expect(resultado.missao).toBeNull();
  });

  it('recusa JSON malformado sem lançar exceção', () => {
    expect(lerMissao('{')).toEqual({
      valido: false,
      erros: [MENSAGENS.jsonInvalido],
      missao: null,
    });
  });
});
