export async function buscarArmas() {
  const resposta = await fetch("https://valorant-api.com/v1/weapons?language=pt-BR");

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar as armas: ${resposta.status}`);
  }

  const dados = await resposta.json();

  return dados.data
    .filter((arma) => arma.displayName && arma.displayIcon)
    .sort((a, b) => {
      const categoriaA = a.shopData?.categoryText || "ZZZ";
      const categoriaB = b.shopData?.categoryText || "ZZZ";
      return categoriaA.localeCompare(categoriaB, "pt-BR") ||
        a.displayName.localeCompare(b.displayName, "pt-BR");
    });
}
