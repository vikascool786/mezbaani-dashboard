export async function syncRoles(token: string) {
  if (!window.posAPI) return;
  return window.posAPI.syncRoles(token);
}

export async function getLocalRoles() {
  return window.posAPI.getRoles();
}
