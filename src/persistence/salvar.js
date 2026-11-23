import { VERSAO_PROJETO } from './schema.js';

/** Serializa somente o envelope versionado, sem estado oculto. */
export function serializarProjeto(projeto) {
  return JSON.stringify(
    {
      versao: VERSAO_PROJETO,
      titulo: projeto.titulo,
      blocos: projeto.blocos,
      entrada: projeto.entrada,
    },
    null,
    2,
  );
}

export default serializarProjeto;
