function invalid(message) {
  return Object.assign(new Error(message), { status: 400, expose: true });
}

function text(value, label, limit, required = false) {
  if (value == null || value === "") {
    if (required) throw invalid(label + " é obrigatório.");
    return null;
  }
  if (typeof value !== "string") throw invalid(label + " é inválido.");
  const normalized = value.trim();
  if (required && !normalized) throw invalid(label + " é obrigatório.");
  if (normalized.length > limit) throw invalid(label + " excede o limite permitido.");
  return normalized || null;
}

function number(value, label, { integer = false, max = 9999999999.99 } = {}) {
  if (value == null || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") throw invalid(label + " é inválido.");
  if (typeof value === "string" && !/^\d+(?:\.\d+)?$/.test(value.trim())) throw invalid(label + " é inválido.");
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max || (integer && !Number.isInteger(parsed))) {
    throw invalid(label + " é inválido.");
  }
  return parsed;
}

function date(value) {
  const result = text(value, "Data", 10);
  if (!result) return null;
  const parsed = new Date(result + "T00:00:00Z");
  if (!/^\d{4}-\d\d-\d\d$/.test(result) || result < "1000-01-01" ||
      !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) {
    throw invalid("Data inválida.");
  }
  return result;
}

function webUrl(value, label, limit) {
  const result = text(value, label, limit);
  if (!result) return null;
  try {
    const url = new URL(result);
    if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) return result;
  } catch { /* URL incompleta */ }
  throw invalid(label + " deve ser um endereço HTTP ou HTTPS.");
}

function id(value) {
  const parsed = number(value, "Código", { integer: true, max: 2147483647 });
  if (!parsed) throw invalid("Código inválido.");
  return parsed;
}

module.exports = { invalid, text, number, date, webUrl, id };
