import { buscarArmas } from "../modulos/armas.js";

const ORDEM_CATEGORIAS = [
  "Todas",
  "Pistolas",
  "Submetralhadoras",
  "Escopetas",
  "Fuzis",
  "Fuzis de Precisão",
  "Metralhadoras",
  "Corpo a Corpo"
];

let armas = [];
let categoriaAtual = "Todas";
let elementoFocadoAntesDoModal = null;

const listaArmas = document.getElementById("listaArmas");
const searchInput = document.getElementById("searchInput");
const filtrosCategorias = document.getElementById("filtrosCategorias");
const contadorArmas = document.getElementById("contadorArmas");
const modalArma = document.getElementById("modalArma");
const fecharModalArma = document.getElementById("fecharModalArma");
const modalCategoriaArma = document.getElementById("modalCategoriaArma");
const modalNomeArma = document.getElementById("modalNomeArma");
const modalNumeroArma = document.getElementById("modalNumeroArma");
const modalImagemArma = document.getElementById("modalImagemArma");
const modalPrecoArma = document.getElementById("modalPrecoArma");
const estatisticasArma = document.getElementById("estatisticasArma");
const secaoDano = document.getElementById("secaoDano");
const tabelaDano = document.getElementById("tabelaDano");
const previaSkins = document.getElementById("previaSkins");
const quantidadeSkins = document.getElementById("quantidadeSkins");
const listaPreviaSkins = document.getElementById("listaPreviaSkins");

async function inicializar() {
  try {
    armas = await buscarArmas();
    criarFiltros();
    aplicarFiltros();
  } catch (erro) {
    console.error(erro);
    renderizarEstado(
      "// ERRO DE CONEXÃO",
      "ARSENAL INDISPONÍVEL",
      "Não foi possível consultar a API agora. Tente recarregar a página."
    );
  }
}

function criarFiltros() {
  filtrosCategorias.innerHTML = "";

  ORDEM_CATEGORIAS.forEach((categoria) => {
    const existe = categoria === "Todas" || armas.some(
      (arma) => obterCategoria(arma) === categoria
    );

    if (!existe) return;

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = categoria === categoriaAtual ? "ativo" : "";
    botao.textContent = categoria;
    botao.addEventListener("click", () => {
      categoriaAtual = categoria;
      criarFiltros();
      aplicarFiltros();
    });
    filtrosCategorias.appendChild(botao);
  });
}

function aplicarFiltros() {
  const termo = normalizarTexto(searchInput.value);
  const filtradas = armas.filter((arma) => {
    const correspondeCategoria = categoriaAtual === "Todas" ||
      obterCategoria(arma) === categoriaAtual;
    const correspondeBusca = normalizarTexto(
      `${arma.displayName} ${obterCategoria(arma)}`
    ).includes(termo);

    return correspondeCategoria && correspondeBusca;
  });

  renderizarArmas(filtradas);
}

function renderizarArmas(lista) {
  listaArmas.innerHTML = "";
  contadorArmas.textContent = `${lista.length} ${lista.length === 1 ? "ARMA" : "ARMAS"}`;

  if (lista.length === 0) {
    renderizarEstado(
      "// BUSCA",
      "ARMA NÃO ENCONTRADA",
      "Tente outro nome ou selecione uma categoria diferente."
    );
    return;
  }

  lista.forEach((arma, indice) => {
    const card = document.createElement("article");
    card.className = "card-arma";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalhes da arma ${arma.displayName}`);

    const numero = String(indice + 1).padStart(2, "0");
    const preco = obterPreco(arma);

    card.innerHTML = `
      <div class="card-topo">
        <span>${numero}</span>
        <span>${obterCategoria(arma)}</span>
      </div>
      <div class="card-imagem">
        <span class="mira" aria-hidden="true"></span>
        <img src="${arma.displayIcon}" alt="${arma.displayName}" loading="lazy">
      </div>
      <div class="card-rodape">
        <div>
          <h3>${arma.displayName}</h3>
          <p>${preco}</p>
        </div>
        <span class="card-seta">→</span>
      </div>
    `;

    card.addEventListener("click", () => abrirModal(arma, indice));
    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirModal(arma, indice);
      }
    });

    listaArmas.appendChild(card);
  });
}

function renderizarEstado(rotulo, titulo, descricao) {
  listaArmas.innerHTML = `
    <div class="estado-pagina">
      <span>${rotulo}</span>
      <h2>${titulo}</h2>
      <p>${descricao}</p>
    </div>
  `;
}

function abrirModal(arma, indice) {
  elementoFocadoAntesDoModal = document.activeElement;
  const estatisticas = arma.weaponStats;

  modalCategoriaArma.textContent = `// ${obterCategoria(arma)}`;
  modalNomeArma.textContent = arma.displayName;
  modalNumeroArma.textContent = String(indice + 1).padStart(2, "0");
  modalImagemArma.src = arma.displayIcon;
  modalImagemArma.alt = arma.displayName;
  modalPrecoArma.textContent = obterPreco(arma);

  renderizarEstatisticas(estatisticas);
  renderizarDano(estatisticas?.damageRanges || []);
  renderizarSkins(arma.skins || []);

  modalArma.classList.add("ativo");
  document.body.classList.add("modal-aberto");
  fecharModalArma.focus();
}

function renderizarEstatisticas(stats) {
  if (!stats) {
    estatisticasArma.innerHTML = `
      <div class="sem-estatisticas">
        <span>// EQUIPAMENTO ESPECIAL</span>
        <p>Esta arma não possui estatísticas de disparo.</p>
      </div>
    `;
    return;
  }

  const itens = [
    ["CADÊNCIA", formatarNumero(stats.fireRate), "tiros/s"],
    ["CARREGADOR", stats.magazineSize, "balas"],
    ["RECARGA", formatarNumero(stats.reloadTimeSeconds), "s"],
    ["EQUIPAR", formatarNumero(stats.equipTimeSeconds), "s"],
    ["PRECISÃO", formatarNumero(stats.firstBulletAccuracy), ""],
    ["VELOCIDADE", `${Math.round((stats.runSpeedMultiplier || 0) * 100)}%`, "" ]
  ];

  estatisticasArma.innerHTML = itens.map(([nome, valor, unidade]) => `
    <div class="estatistica">
      <span>${nome}</span>
      <strong>${valor}<small>${unidade}</small></strong>
    </div>
  `).join("");
}

function renderizarDano(faixas) {
  secaoDano.hidden = faixas.length === 0;
  tabelaDano.innerHTML = faixas.map((faixa) => `
    <tr>
      <td>${faixa.rangeStartMeters}–${faixa.rangeEndMeters} M</td>
      <td>${formatarDano(faixa.headDamage)}</td>
      <td>${formatarDano(faixa.bodyDamage)}</td>
      <td>${formatarDano(faixa.legDamage)}</td>
    </tr>
  `).join("");
}

function renderizarSkins(skins) {
  const skinsValidas = skins.filter(
    (skin) =>
      skin.displayIcon &&
      !normalizarTexto(skin.displayName).includes("padrao")
  );

  const skinsAleatorias = embaralharLista(
    skinsValidas
  ).slice(0, 4);

  previaSkins.hidden = skinsValidas.length === 0;

  quantidadeSkins.textContent =
    `${skinsValidas.length} visuais encontrados`;

  listaPreviaSkins.innerHTML = skinsAleatorias
    .map(
      (skin) => `
        <article class="skin-miniatura">
          <img
            src="${skin.displayIcon}"
            alt="${skin.displayName}"
            loading="lazy"
          >

          <span>${skin.displayName}</span>
        </article>
      `
    )
    .join("");
}

function embaralharLista(lista) {
  const listaEmbaralhada = [...lista];

  for (
    let i = listaEmbaralhada.length - 1;
    i > 0;
    i--
  ) {
    const indiceAleatorio = Math.floor(
      Math.random() * (i + 1)
    );

    [
      listaEmbaralhada[i],
      listaEmbaralhada[indiceAleatorio]
    ] = [
      listaEmbaralhada[indiceAleatorio],
      listaEmbaralhada[i]
    ];
  }

  return listaEmbaralhada;
}

function fecharModal() {
  modalArma.classList.remove("ativo");
  document.body.classList.remove("modal-aberto");
  elementoFocadoAntesDoModal?.focus();
}

function obterCategoria(arma) {
  if (!arma.shopData) {
    return "Corpo a Corpo";
  }

  const categorias = {
    "Armas Leves": "Pistolas",
    "Fuzis de Assalto": "Fuzis",
    "Armas Pesadas": "Metralhadoras"
  };

  return (
    categorias[arma.shopData.categoryText] ||
    arma.shopData.categoryText ||
    "Outras"
  );
}

function obterPreco(arma) {
  const preco = arma.shopData?.cost;
  return Number.isFinite(preco) ? `${preco.toLocaleString("pt-BR")} CRÉDITOS` : "EQUIPAMENTO GRATUITO";
}

function formatarNumero(valor) {
  return Number.isFinite(valor) ? valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—";
}

function formatarDano(valor) {
  return Number.isFinite(valor) ? Math.round(valor) : "—";
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

searchInput.addEventListener("input", aplicarFiltros);
fecharModalArma.addEventListener("click", fecharModal);

modalArma.addEventListener("click", (evento) => {
  if (evento.target === modalArma) fecharModal();
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modalArma.classList.contains("ativo")) {
    fecharModal();
  }
});

inicializar();
