const STORAGE_KEY = 'hk-trip-nickname';

export function getNickname() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setNickname(nickname) {
  localStorage.setItem(STORAGE_KEY, nickname);
}
