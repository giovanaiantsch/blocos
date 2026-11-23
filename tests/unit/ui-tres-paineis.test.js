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

  it('posiciona blocos à esquerda e empilha as saídas à direita no desktop', () => {
    const pagina = html();

    expect(pagina).toContain('class="painel painel-blocos"');
    expect(pagina).toContain('class="acoes"');
    expect(pagina).toMatch(
      /grid-template-columns:\s*minmax\(0,\s*2fr\)\s+minmax\(0,\s*1fr\)/,
    );
    expect(pagina).toMatch(/grid-row:\s*1\s*\/\s*span 2/);
    expect(pagina).toMatch(/@media \(max-width: 900px\)/);
  });

  it('usa fonte monoespaçada no Portugol e destaca Executar como ação principal', () => {
    const pagina = html();

    expect(pagina).toMatch(/#portugol\s*\{[^}]*monospace/s);
    expect(pagina).toMatch(/#executar\s*\{[^}]*font-weight:\s*700/s);
    expect(pagina).toMatch(/#carregar,\s*#salvar\s*\{/);
  });
});
