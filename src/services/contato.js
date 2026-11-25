const configured = (process.env.REACT_APP_WHATSAPP || "").replace(/[+\s()-]/g, "");
const number = /^[1-9]\d{7,14}$/.test(configured) ? configured : "5511992931055";

export function whatsappUrl(message = "") {
  const url = new URL("https://wa.me/" + number);
  if (message) url.searchParams.set("text", message);
  return url.href;
}

export function openWhatsApp(message) {
  const url = whatsappUrl(message);
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
