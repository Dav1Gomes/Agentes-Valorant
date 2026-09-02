import { buscarMapas } from "../modulos/mapas.js";

let mapas = [];
let elementoFocadoAntesDoModal = null;

const listaMapas = document.getElementById("listaMapas");
const searchInput = document.getElementById("searchInput");
const modalMapa = document.getElementById("modalMapa");
const fecharModalMapa = document.getElementById("fecharModalMapa");
const modalSplashMapa = document.getElementById("modalSplashMapa");
const modalIconeMapa = document.getElementById("modalIconeMapa");
const modalIndiceMapa = document.getElementById("modalIndiceMapa");
const modalTipoMapa = document.getElementById("modalTipoMapa");
const modalNomeMapa = document.getElementById("modalNomeMapa");
const modalCoordenadasMapa = document.getElementById("modalCoordenadasMapa");
const modalDescricaoMapa = document.getElementById("modalDescricaoMapa");
const modalLocalizacaoMapa = document.getElementById("modalLocalizacaoMapa");
const modalRegioesMapa = document.getElementById("modalRegioesMapa");

async function inicializar() {
  try {
    mapas = await buscarMapas();
    renderizarMapas(mapas);
  } catch (erro) {
    console.error(erro);
    renderizarEstado(
      "// ERRO DE CONEXÃO",
      "MAPAS INDISPONÍVEIS",
      "Não foi possível consultar a API agora. Tente recarregar a página."
    );
  }
}

function renderizarMapas(lista) {
  listaMapas.innerHTML = "";

  if (lista.length === 0) {
    renderizarEstado(
      "// BUSCA",
      "MAPA NÃO ENCONTRADO",
      "Tente pesquisar outro nome, localização ou tipo de mapa."
    );
    return;
  }

  lista.forEach((mapa, indice) => {
    const card = document.createElement("article");
    card.className = "card-mapa";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalhes do mapa ${mapa.displayName}`);

    const numero = String(indice + 1).padStart(2, "0");
    const localizacao = extrairLocalizacao(mapa);

    card.innerHTML = `
      <img class="card-mapa-imagem" src="${mapa.splash}" alt="Mapa ${mapa.displayName}" loading="lazy">
      <div class="card-mapa-filtro"></div>
      <span class="card-numero">${numero}</span>
      <div class="card-conteudo">
        <span class="card-categoria">${mapa.tacticalDescription || "CAMPO DE BATALHA"}</span>
        <h3>${mapa.displayName}</h3>
        <p>${localizacao}</p>
        <span class="card-explorar">EXPLORAR <strong>→</strong></span>
      </div>
    `;

    card.addEventListener("click", () => abrirModal(mapa, indice));
    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirModal(mapa, indice);
      }
    });

    listaMapas.appendChild(card);
  });
}

function renderizarEstado(rotulo, titulo, descricao) {
  listaMapas.innerHTML = `
    <div class="estado-pagina">
      <span>${rotulo}</span>
      <h2>${titulo}</h2>
      <p>${descricao}</p>
    </div>
  `;
}

function filtrarMapas() {
  const termo = normalizarTexto(searchInput.value);
  const filtrados = mapas.filter((mapa) => {
    const conteudo = [
      mapa.displayName,
      mapa.coordinates,
      mapa.tacticalDescription,
      mapa.narrativeDescription
    ]
      .filter(Boolean)
      .map(normalizarTexto)
      .join(" ");

    return conteudo.includes(termo);
  });

  renderizarMapas(filtrados);
}

function abrirModal(mapa, indice) {
  elementoFocadoAntesDoModal = document.activeElement;
  const numero = String(indice + 1).padStart(2, "0");
  const localizacao = extrairLocalizacao(mapa);
  const iconeMapa = mapa.displayIcon || mapa.listViewIcon || "";

  modalSplashMapa.src = mapa.splash;
  modalSplashMapa.alt = `Vista panorâmica do mapa ${mapa.displayName}`;
  modalIconeMapa.src = iconeMapa;
  modalIconeMapa.hidden = !iconeMapa;
  modalIndiceMapa.textContent = `// MAPA ${numero}`;
  modalTipoMapa.textContent = mapa.tacticalDescription || "CAMPO DE BATALHA";
  modalNomeMapa.textContent = mapa.displayName;
  modalCoordenadasMapa.textContent = mapa.coordinates || "Coordenadas não divulgadas";
  modalDescricaoMapa.textContent = criarDescricao(mapa, localizacao);
  modalLocalizacaoMapa.textContent = localizacao;
  modalRegioesMapa.textContent = `${mapa.callouts?.length || 0} setores`;

  modalMapa.classList.add("ativo");
  document.body.classList.add("modal-aberto");
  fecharModalMapa.focus();
}

function fecharModal() {
  modalMapa.classList.remove("ativo");
  document.body.classList.remove("modal-aberto");
  elementoFocadoAntesDoModal?.focus();
}

function criarDescricao(mapa, localizacao) {
  if (mapa.narrativeDescription) {
    return mapa.narrativeDescription;
  }

  const tipo = mapa.tacticalDescription
    ? ` classificado como ${mapa.tacticalDescription.toLowerCase()}`
    : "";

  return `${mapa.displayName} é um campo de batalha situado em ${localizacao}${tipo}. Analise o minimapa e prepare sua estratégia antes da partida.`;
}

function extrairLocalizacao(mapa) {
  if (!mapa.coordinates) {
    return "Localização confidencial";
  }

  const partes = mapa.coordinates.split(",");
  return partes.at(-1)?.trim() || mapa.coordinates;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

searchInput.addEventListener("input", filtrarMapas);
fecharModalMapa.addEventListener("click", fecharModal);

modalMapa.addEventListener("click", (evento) => {
  if (evento.target === modalMapa) {
    fecharModal();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modalMapa.classList.contains("ativo")) {
    fecharModal();
  }
});

inicializar();
