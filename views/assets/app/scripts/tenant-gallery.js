import PropertyService from "../../_common/classes/services/PropertyService.js?v=20261113-4";
import PropertyImageService from "../../_common/classes/services/PropertyImageService.js";

const $ = (selector) => document.querySelector(selector);
const root = $("#property-gallery");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showState(message, kind = "empty") {
  const p = el("p", `gallery-state gallery-state--${kind}`, message);
  p.setAttribute("role", kind === "error" ? "alert" : "status");
  root.replaceChildren(p);
}

function renderImages(property, images) {
  const wrap = el("article", "property-gallery-card");
  wrap.dataset.propertyId = String(property.id);

  const head = el("header", "property-gallery-head");
  head.append(
    el("p", "label", "Localização"),
    el("h3", "property-gallery-location", property.location),
    el(
      "p",
      "property-gallery-meta",
      `${property.numberOfRooms} quarto(s) · ${property.isAvailable() ? "Disponível" : "Indisponível"}`,
    ),
  );
  wrap.appendChild(head);

  const visible = images.filter((image) => image.url);
  if (visible.length === 0) {
    wrap.appendChild(el("p", "gallery-state", "Este imóvel ainda não tem imagens."));
    return wrap;
  }

  const grid = el("ul", "property-gallery-grid");
  for (const image of visible) {
    const item = el("li", "property-gallery-item");
    const figure = el("figure");
    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.altText || `Imagem do imóvel em ${property.location}`;
    img.loading = "lazy";
    figure.appendChild(img);
    const caption = el("figcaption");
    caption.append(el("strong", "", property.location));
    if (image.altText) caption.append(document.createElement("br"), image.altText);
    figure.appendChild(caption);
    item.appendChild(figure);
    grid.appendChild(item);
  }
  wrap.appendChild(grid);
  return wrap;
}

async function init() {
  if (!root) return;
  showState("Carregando imagens dos imóveis…", "loading");
  try {
    const response = await new PropertyService().listMine();
    if (response.type !== "success") {
      showState(response.message || "Não foi possível carregar os imóveis.", "error");
      return;
    }
    const properties = response.data;
    if (properties.length === 0) {
      showState(
        "Nenhum imóvel com contrato ativo vinculado ao seu perfil. Peça ao proprietário para associar um imóvel e ativar o contrato.",
      );
      return;
    }

    const imageService = new PropertyImageService();
    const cards = await Promise.all(
      properties.map(async (property) => {
        try {
          const res = await imageService.list(property.id);
          if (res.type === "success") return renderImages(property, res.data.images);
          const card = renderImages(property, []);
          const error = el("p", "gallery-state gallery-state--error", res.message || "Não foi possível carregar as imagens.");
          error.setAttribute("role", "alert");
          card.append(error);
          return card;
        } catch (error) {
          const card = renderImages(property, []);
          const message = error instanceof Error ? error.message : "Não foi possível carregar as imagens.";
          const state = el("p", "gallery-state gallery-state--error", message);
          state.setAttribute("role", "alert");
          card.append(state);
          return card;
        }
      }),
    );
    root.replaceChildren(...cards);
  } catch (error) {
    showState(error.message || "Não foi possível carregar os imóveis.", "error");
  }
}

init();
