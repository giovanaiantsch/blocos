import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = () => readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('três painéis visíveis em pt-BR', () => {
  it('identifica os três painéis na mesma página', () => {
    const pagina = html();

    expect(pagina).toContain('Blocos');
    expect(pagina).toContain('Portugol gerado');
    expect(pagina).toContain('Saída da execução');
  });

  it('não usa rótulos de painel em inglês', () => {
    const pagina = html();

    expect(pagina).not.toMatch(/>\s*Blocks\s*</);
    expect(pagina).not.toMatch(/>\s*Generated Portuguese\s*</);
    expect(pagina).not.toMatch(/>\s*Output\s*</);
  });

  it('oferece as ações de carregar, salvar e executar em pt-BR', () => {
    const pagina = html();

    expect(pagina).toContain('Carregar JSON');
    expect(pagina).toContain('Salvar JSON');
    expect(pagina).toContain('Executar');
  });
});
