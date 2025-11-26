export async function apiPost(path:string, body?:any){
  return fetch('/api/'+path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r=>r.json());
}
