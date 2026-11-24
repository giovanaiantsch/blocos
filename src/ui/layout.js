/** Localiza os três painéis e os controles já declarados em `index.html`. */
export function obterElementos(document) {
  return {
    blocos: document.getElementById('blocos'),
    portugol: document.getElementById('portugol'),
    saida: document.getElementById('saida'),
    titulo: document.getElementById('titulo'),
    entradas: document.getElementById('entradas'),
    missao: document.getElementById('missao'),
    arquivoMissao: document.getElementById('arquivo-missao'),
    descricaoMissao: document.getElementById('descricao-missao'),
    arquivo: document.getElementById('arquivo'),
    carregar: document.getElementById('carregar'),
    salvar: document.getElementById('salvar'),
    executar: document.getElementById('executar'),
  };
}

export default obterElementos;
