// ===== Config Supabase (identique à app.js)
const SUPABASE_URL  = "https://ywpshnlnbpyfplapzzac.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cHNobmxuYnB5ZnBsYXB6emFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODg1NTYsImV4cCI6MjA3Mjg2NDU1Nn0.J-0ATeb3dxkQ6m4E0KuDLOHD072akgielLKQb-m22B8";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const $ = (id) => document.getElementById(id);
const set = (el, msg, ok=true)=>{ el.textContent = msg; el.style.color = ok ? "#8be28b" : "#ff8b8b"; };

// ============ Auth UI ============
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
  await refreshAuthStatus();
});

$("btn-logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  set($("auth-status"), "Déconnecté");
});

// ============ UPLOAD ============
// Pré-requis côté Supabase Storage : bucket "media" (public)
// Policies conseillées plus bas.

const drop = $("drop");
const fileInput = $("file");
const pickBtn = $("pick");
const upStatus = $("up-status");
const preview = $("preview");
const previewImg = $("preview-img");

pickBtn.addEventListener("click", () => fileInput.click());

["dragenter","dragover"].forEach(ev => drop.addEventListener(ev, e => {
  e.preventDefault(); e.stopPropagation(); drop.classList.add("drag");
}));
["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => {
  e.preventDefault(); e.stopPropagation(); drop.classList.remove("drag");
}));
drop.addEventListener("drop", e => {
  const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
});
fileInput.addEventListener("change", e => {
  const f = e.target.files?.[0]; if (f) handleFile(f);
});

async function handleFile(file){
  if (!file || !file.type.startsWith("image/")) {
    set(upStatus, "Sélectionne une image valide.", false); return;
  }
  // Doit être connecté pour uploader
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { set(upStatus, "Connecte-toi pour uploader.", false); return; }

  set(upStatus, "Upload en cours…");
  try {
    // Nom unique: userId/yyyymmdd/timestamp_nom.ext
    const d = new Date();
    const folder = `${user.id}/${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${folder}/${Date.now()}_${safeName}`;

    // Upload vers le bucket "media"
    const { error: upErr } = await supabase
      .storage.from("media")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (upErr) throw upErr;

    // URL publique (si bucket public)
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    $("media_url").value = pub.publicUrl;

    // Preview
    previewImg.src = pub.publicUrl;
    preview.classList.remove("hidden");

    set(upStatus, "Upload terminé ✔");
  } catch (err) {
    console.error(err);
    set(upStatus, "Erreur upload : " + err.message, false);
  }
}

// ============ Publish ============
$("btn-publish").addEventListener("click", async () => {
  const title     = $("title").value.trim();
  const content   = $("content").value.trim();
  const media_url = $("media_url").value.trim() || null;
  const link_url  = $("link_url").value.trim() || null;
  const out = $("pub-status");

  if (!title || !content) { set(out, "Titre et contenu requis.", false); return; }

  set(out, "Publication en cours…");
  const payload = { category:"bio", title, content, media_url, link_url, author:"Pierre Janssen" };

  const { error } = await supabase.from("posts").insert(payload);
  if (error) { set(out, "Erreur: " + error.message, false); return; }

  set(out, "Publié ✔ — va voir sur la page Super Yachts !");
  $("title").value = ""; $("content").value = ""; $("media_url").value=""; $("link_url").value="";
  preview.classList.add("hidden");
});

// init
refreshAuthStatus();