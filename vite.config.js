import { defineConfig } from 'vite';

import { configuracaoDoAmbiente, VERSAO_CORE } from './src/core/configuracao.js';
import { executarCore } from './src/core/runner.js';
import { gerarPortugol } from './src/generation/gerador.js';

/**
 * Ponte de desenvolvimento: o navegador não pode chamar uma CLI local.
 * O endpoint repassa o projeto ao runner do Core, que usa a versão fixada
 * (`meuPia/core v1.4.1`) apenas pelas interfaces públicas (`meupia` + `python`).
 */
function ponteCore() {
  return {
    name: 'ponte-core',
    configureServer(server) {
      server.middlewares.use('/api/executar', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        let corpo = '';
        req.setEncoding('utf8');
        req.on('data', (parte) => {
          corpo += parte;
        });
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          try {
            const projeto = JSON.parse(corpo || '{}');
            const resultado = executarCore({
              portugol: gerarPortugol(projeto),
              entrada: projeto.entrada ?? [],
              configuracao: configuracaoDoAmbiente(),
            });
            res.statusCode = 200;
            res.end(JSON.stringify({ ...resultado, versaoCore: VERSAO_CORE }));
          } catch (erro) {
            res.statusCode = 400;
            res.end(JSON.stringify({
              status: 'erro_execucao',
              saida: '',
              erro: `Não foi possível executar: ${erro.message}`,
              duracaoMs: 0,
              interrompidoPorLimite: false,
            }));
          }
        });
      });
    },
  };
}

export default defineConfig({ plugins: [ponteCore()] });
