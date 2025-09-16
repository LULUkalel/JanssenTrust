// Config Supabase (mêmes valeurs que app.js)
const SUPABASE_URL  = "https://ywpshnlnbpyfplapzzac.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cHNobmxuYnB5ZnBsYXB6emFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODg1NTYsImV4cCI6MjA3Mjg2NDU1Nn0.J-0ATeb3dxkQ6m4E0KuDLOHD072akgielLKQb-m22B8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const $ = (id) => document.getElementById(id);
const set = (el, msg, ok=true)=>{ el.textContent = msg; el.style.color = ok ? "#8be28b" : "#ff8b8b"; };

async function refreshAuthStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  const box = $("auth-status");
  if (user) set(box, `Connecté en tant que ${user.email}`);
  else set(box, "Non connecté", false);
}

$("btn-login").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const box = $("auth-status");
  set(box, "Connexion…");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) set(box, "Échec connexion : " + error.message, false);
  else set(box, "Connecté 👍");
});

$("btn-logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  set($("auth-status"), "Déconnecté");
});

$("btn-publish").addEventListener("click", async () => {
  const title     = $("title").value.trim();
  const content   = $("content").value.trim();
  const media_url = $("media_url").value.trim() || null;
  const link_url  = $("link_url").value.trim() || null;

  const out = $("pub-status");
  if (!title || !content) { set(out, "Titre et contenu requis.", false); return; }

  set(out, "Publication en cours…");

  // On insère dans la table posts, catégorie "bio"
  const payload = {
    category: "bio",
    title, content, media_url, link_url,
    author: "Pierre Janssen" // optionnel
  };

  const { error } = await supabase.from("posts").insert(payload);
  if (error) { set(out, "Erreur: " + error.message, false); return; }

  set(out, "Publié ✔ — va voir sur la page Super Yachts !");
  // reset léger
  $("title").value = ""; $("content").value = ""; $("media_url").value=""; $("link_url").value="";
});

// init
refreshAuthStatus();