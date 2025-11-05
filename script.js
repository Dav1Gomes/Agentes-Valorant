import { buscarAgentes } from "./modulos/agentes.js";

let agentes = [];

const modalAgente = document.getElementById("modalAgente");
const modalImagem = document.getElementById("modalImagemAgente");
const modalNome = document.getElementById("modalNomeAgente");
const modalFuncao = document.getElementById("modalFuncaoAgente");
const modalDescricao = document.getElementById("modalDescricaoAgente");
const modalHabilidades = document.getElementById("modalHabilidades");
const modalFuncaoIcone = document.getElementById("modalFuncaoIcone");
const fecharModal = document.getElementById("fecharModalAgente");

async function inicializar() {
  agentes = await buscarAgentes(() => {});
  agentes.sort((a, b) => a.displayName.localeCompare(b.displayName));
  renderizarListaAgentes(agentes);
  document
    .getElementById("searchInput")
    .addEventListener("input", filtrarAgentes);
}

function renderizarListaAgentes(lista) {
  const container = document.getElementById("listaAgentes");
  container.innerHTML = "";

  lista.forEach((agente) => {
    const card = document.createElement("div");
    card.classList.add("card-agente");

    card.innerHTML = `
      <img src="${agente.displayIcon}" alt="${agente.displayName}">
      <div class="info">
        <p class="nome">${agente.displayName}</p>
        <p class="funcao">${agente.role?.displayName || "Sem função"}</p>
      </div>
    `;

    card.addEventListener("click", () => abrirModalAgente(agente));
    container.appendChild(card);
  });
}

function filtrarAgentes() {
  const termo = document.getElementById("searchInput").value.toLowerCase();
  const filtrados = agentes.filter(
    (agente) =>
      agente.displayName.toLowerCase().includes(termo) ||
      agente.role?.displayName.toLowerCase().includes(termo)
  );
  renderizarListaAgentes(filtrados);
}

function abrirModalAgente(agente) {
  modalAgente.classList.add("ativo");

  const quadro = document.querySelector(".quadro-personagem");

  // background do personagem
  quadro.style.backgroundImage = `url(${agente.background})`;
  quadro.style.backgroundPosition = "left -10px top -40px";
  quadro.style.backgroundSize = "105%";
  quadro.style.backgroundRepeat = "no-repeat";

  // cor de fundo atrás do personagem 
  const cor = agente.backgroundGradientColors?.[0] || "FF4655";
  quadro.style.backgroundColor = `#${cor}`;

  modalImagem.src = agente.fullPortrait || agente.fullPortraitV2;
  modalNome.textContent = agente.displayName;
  modalNome.style.color = `#${cor}`;
  modalFuncao.textContent = agente.role?.displayName ?? "Sem função";
  modalFuncaoIcone.src = agente.role?.displayIcon ?? "";
  modalFuncaoIcone.style.display = agente.role ? "block" : "none";
  modalDescricao.textContent = agente.description;

  modalHabilidades.innerHTML = "";

  agente.abilities
    .filter((h) => h.displayIcon)
    .slice(0, 4)
    modalHabilidades.innerHTML = "";

agente.abilities
  .filter((h) => h.displayIcon)
  .slice(0, 4)
  .forEach((hab) => {
    const habilidade = document.createElement("div");
    habilidade.classList.add("habilidade");

    habilidade.innerHTML = `
      <div class="hab-header">
        <img src="${hab.displayIcon}">
        <span>${hab.displayName}</span>
      </div>
      <div class="hab-desc">
        <p>${hab.description || "Sem descrição"}</p>
      </div>
    `;

    habilidade.addEventListener("click", () => {
      habilidade.classList.toggle("ativa");
    });

    modalHabilidades.appendChild(habilidade);
  });

}

function inserirTextoFundo(quadro, nome) {
  let bgText = quadro.querySelector(".bg-text");

  if (!bgText) {
    bgText = document.createElement("div");
    bgText.classList.add("bg-text");
    quadro.appendChild(bgText);
  }

  bgText.textContent = nome.toUpperCase();
}

fecharModal.addEventListener("click", () =>
  modalAgente.classList.remove("ativo")
);

modalAgente.addEventListener("click", (e) => {
  if (e.target === modalAgente) modalAgente.classList.remove("ativo");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modalAgente.classList.remove("ativo");
});

inicializar();


