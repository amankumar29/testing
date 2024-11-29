export function getStorage(key) {
  return sessionStorage.getItem(key);
}

export function setStorage(key, value) {
  sessionStorage.setItem(key, value);
}

export function clearStorage(key) {
  sessionStorage.removeItem(key);
}
