export async function buscarMapas() {
  const resposta = await fetch(
    "https://valorant-api.com/v1/maps?language=pt-BR"
  );

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível carregar os mapas: ${resposta.status}`
    );
  }

  const dados = await resposta.json();

  const mapasValidos = dados.data.filter((mapa) => {
    const nome = normalizarNome(mapa.displayName);

    return (
      mapa.splash &&
      mapa.displayName &&
      nome !== "treinamento basico"
    );
  });

  const mapasUnicos = new Map();

  mapasValidos.forEach((mapa) => {
    const nome = normalizarNome(mapa.displayName);

    if (!mapasUnicos.has(nome)) {
      mapasUnicos.set(nome, mapa);
    }
  });

  return [...mapasUnicos.values()].sort((a, b) =>
    a.displayName.localeCompare(
      b.displayName,
      "pt-BR"
    )
  );
}

function normalizarNome(nome) {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}