export const IMAGE_RULES = Object.freeze({
  maxBytes: 5 * 1024 * 1024,
  maxFilesPerRequest: 10,
  maxImagesPerProperty: 20,
  maxAltLength: 255,
  mimeTypes: Object.freeze(["image/jpeg", "image/png", "image/webp"]),
  extensions: Object.freeze(["jpg", "jpeg", "png", "webp"]),
  accept: "image/jpeg,image/png,image/webp",
  description: "Formatos aceitos: JPG, PNG ou WebP · até 5 MB por imagem",
});

const extensionOf = (name) =>
  String(name ?? "")
    .split(".")
    .pop()
    .toLowerCase();

export function validateImageFile(file, rules = IMAGE_RULES) {
  if (!file || typeof file.size !== "number") return "Arquivo inválido.";
  const label = file.name ? `“${file.name}”` : "O arquivo";
  if (file.size === 0) return `${label} está vazio.`;
  if (file.size > rules.maxBytes) {
    return `${label} excede ${Math.round(rules.maxBytes / 1024 / 1024)} MB.`;
  }
  if (!rules.extensions.includes(extensionOf(file.name))) {
    return `${label} não é JPG, PNG ou WebP.`;
  }
  if (file.type && !rules.mimeTypes.includes(file.type)) {
    return `${label} não é JPG, PNG ou WebP.`;
  }
  return null;
}

export function sniffImageType(bytes) {
  const b = Array.from(bytes);
  const startsWith = (sig, offset = 0) =>
    sig.every((value, i) => b[offset + i] === value);
  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }
  return null;
}

export async function validateImageFileDeep(file, rules = IMAGE_RULES) {
  const quick = validateImageFile(file, rules);
  if (quick) return quick;
  try {
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!rules.mimeTypes.includes(sniffImageType(head))) {
      return `“${file.name}” não tem conteúdo de imagem JPG, PNG ou WebP.`;
    }
  } catch {
    return `Não foi possível ler “${file.name}”.`;
  }
  return null;
}

export function safeUploadUrl(value, baseUrl) {
  if (typeof value !== "string" || value.trim() === "" || !baseUrl) return null;
  try {
    const url = new URL(value);
    const base = new URL(baseUrl);
    const prefix = `${base.pathname.replace(/\/+$/, "")}/uploads/`;
    const sameApi =
      ["http:", "https:"].includes(url.protocol) &&
      url.origin === base.origin &&
      url.pathname.startsWith(prefix) &&
      !url.pathname.includes("..");
    return sameApi ? url.href : null;
  } catch {
    return null;
  }
}
