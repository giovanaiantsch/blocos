import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { configuracaoDoAmbiente, VERSAO_CORE } from '../../src/core/configuracao.js';
import { executarCore } from '../../src/core/runner.js';
import { gerarPortugol } from '../../src/generation/gerador.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ambienteConfigurado = Boolean(process.env.MEUPIA_COMANDO && process.env.MEUPIA_PYTHON);

/**
 * Aceite real do módulo Grid. Exige `mpgp instale grid` no mesmo ambiente
 * apontado por MEUPIA_COMANDO/MEUPIA_PYTHON. Nenhuma CLI ou plugin é simulado.
 */
describe.skipIf(!ambienteConfigurado)(
  `Core real ${VERSAO_CORE.tag} — módulo Grid`,
  () => {
    it('grid-visitar.json compila e produz a célula visitada', () => {
      const projeto = JSON.parse(
        readFileSync(resolve(raiz, 'tests/fixtures/grid-visitar.json'), 'utf8'),
      );
      const portugol = gerarPortugol(projeto);
      expect(portugol.match(/usar "grid"/g)).toHaveLength(1);

      const resultado = executarCore({
        portugol,
        entrada: projeto.entrada,
        configuracao: configuracaoDoAmbiente(),
      });

      const linhas = resultado.saida
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((linha) => linha.trim())
        .filter(Boolean);

      expect(resultado.status).toBe('sucesso');
      expect(resultado.erro).toBe('');
      expect(resultado.interrompidoPorLimite).toBe(false);
      expect(linhas).toContain('celula visitada');
      expect(linhas.some((linha) => linha.includes('visitada no passo 1'))).toBe(true);
      expect(linhas.some((linha) => linha.includes('Grid inicializado'))).toBe(true);
    }, 20000);
  },
);
