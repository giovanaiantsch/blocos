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
 * Teste real: nenhuma CLI é simulada. Só roda quando o ambiente aponta para a
 * instalação de `VERSAO_CORE.tag`; veja `npm run test:core-real` no README.
 */
describe.skipIf(!ambienteConfigurado)(
  `Core real ${VERSAO_CORE.tag} @ ${VERSAO_CORE.commit}`,
  () => {
    it('dobrar-entrada.json com entrada 3 produz saída 6', () => {
      const projeto = JSON.parse(
        readFileSync(resolve(raiz, 'tests/fixtures/dobrar-entrada.json'), 'utf8'),
      );
      const portugol = gerarPortugol(projeto);
      const resultado = executarCore({
        portugol,
        entrada: projeto.entrada,
        configuracao: configuracaoDoAmbiente(),
      });

      // O runner só devolve 'sucesso' quando o parser emitiu
      // '[COMPILED SUCCESSFULLY]' (prefixo confirmado nesta versão).
      expect(portugol).toContain('x <- x * 2');
      expect(resultado.status).toBe('sucesso');
      expect(resultado.erro).toBe('');
      expect(resultado.interrompidoPorLimite).toBe(false);
      expect(resultado.saida.replace(/\r\n?/g, '\n').trim()).toBe('6');
    });
  },
);
