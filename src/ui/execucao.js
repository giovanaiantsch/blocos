/**
 * Ponte entre o navegador e o adaptador do Core. O runner continua fora da UI:
 * o ambiente de desenvolvimento expõe `/api/executar` e repassa o resultado.
 */
export async function executarProjeto(projeto, fetchImpl = fetch) {
  const resposta = await fetchImpl('/api/executar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(projeto),
  });

  if (!resposta.ok) {
    throw new Error(`Servidor respondeu HTTP ${resposta.status}.`);
  }

  return resposta.json();
}

export default executarProjeto;
