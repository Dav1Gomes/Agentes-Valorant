export async function buscarMapas() {
  const resposta = await fetch("https://valorant-api.com/v1/maps?language=pt-BR");

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar os mapas: ${resposta.status}`);
  }

  const dados = await resposta.json();

  return dados.data
    .filter((mapa) => mapa.splash && mapa.displayName)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));
}
