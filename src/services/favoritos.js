import { useSyncExternalStore } from "react";

const key = "mkm.favoritos";
const listeners = new Set();

function initialIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(key));
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string" && /^[1-9]\d*$/.test(id)) : [];
  } catch {
    return [];
  }
}

let ids = initialIds();
const snapshot = () => ids;

function notify() {
  listeners.forEach((listener) => listener());
}

function onStorage(event) {
  if (event.key !== key && event.key !== null) return;
  ids = initialIds();
  notify();
}

function subscribe(listener) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

export function useFavoritos() {
  return useSyncExternalStore(subscribe, snapshot);
}

export function toggleFavorito(id) {
  const value = String(id);
  if (!/^[1-9]\d*$/.test(value)) return;
  ids = ids.includes(value) ? ids.filter((item) => item !== value) : [...ids, value];
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch { /* os favoritos ainda funcionam durante a visita */ }
  notify();
}
