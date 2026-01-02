export async function syncUsers(token: string) {
  if (!window.posAPI) return;
  return window.posAPI.syncUsers(token);
}

export async function getLocalUsers() {
  return window.posAPI.getUsers();
}
