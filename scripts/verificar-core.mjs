import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { configuracaoDoAmbiente, VERSAO_CORE } from '../src/core/configuracao.js';
import { executarCore } from '../src/core/runner.js';
import { gerarPortugol } from '../src/generation/gerador.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projeto = JSON.parse(
  readFileSync(resolve(raiz, 'tests/fixtures/dobrar-entrada.json'), 'utf8'),
);
const configuracao = configuracaoDoAmbiente();
const portugol = gerarPortugol(projeto);
const resultado = executarCore({
  portugol,
  entrada: projeto.entrada,
  configuracao,
});

const saida = resultado.saida.replace(/\r\n?/g, '\n').trim();
const passou = resultado.status === 'sucesso' && saida === '6';

console.log('Core:            ' + `${VERSAO_CORE.tag} @ ${VERSAO_CORE.commit}`);
console.log('Tag original:    não confirmada (substituída pela versão fixada pela dupla)');
console.log('Compilador:      ' + configuracao.comandoCompilador);
console.log('Python:          ' + configuracao.comandoPython);
console.log('Entrada:         ' + JSON.stringify(projeto.entrada));
console.log('Portugol gerado:\n' + portugol);
console.log('Resultado:       ' + JSON.stringify(resultado));
console.log('Saída normalizada: ' + JSON.stringify(saida));
console.log(passou ? 'ACEITE REAL: OK (entrada 3 -> saída 6)' : 'ACEITE REAL: FALHOU');

if (!passou) {
  process.exitCode = 1;
}
