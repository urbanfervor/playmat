import { auth } from "./firebase";

/** POSTs JSON to one of our API routes as the signed-in user. */
export async function postAsUser(url: string, body: object) {
  const token = await auth().currentUser?.getIdToken();
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
}
