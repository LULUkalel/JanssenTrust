// ==========================
//  CONFIG
// ==========================
const SUPABASE_URL = "https://ywpshnlnbpyfplapzzac.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cHNobmxuYnB5ZnBsYXB6emFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODg1NTYsImV4cCI6MjA3Mjg2NDU1Nn0.J-0ATeb3dxkQ6m4E0KuDLOHD072akgielLKQb-m22B8";
const esc = s => (s ?? "").toString().replace(/[&<>"']/g, m =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
);

// ==========================
//  NAVIGATION (mobile) + INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("mobileMenu");
  if (btn && menu) {
    btn.addEventListener("click", () => menu.classList.toggle("hidden"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.add("hidden")));
  }

  // année dynamique footer
  const year = document.getElementById("year") || document.getElementById("y");
  if (year) year.textContent = new Date().getFullYear();

  // si la page contient un feed → on charge les posts
  if (document.getElementById("feed-crypto")) loadPosts("crypto", "feed-crypto");
  if (document.getElementById("feed-news")) loadPosts("news", "feed-news");
  if (document.getElementById("feed-bio")) loadPosts("bio", "feed-bio");
  if (document.getElementById("feed-optimum")) loadPosts("optimumelite", "feed-optimum");

  // injection ticker
  injectTradingViewTicker();

  // init background vertical scroller
  initBgVerticalScroller();
});

// ==========================
//  SUPABASE FEED
// ==========================
async function loadPosts(category, targetId){
  try {
    const url = `${SUPABASE_URL}/rest/v1/posts?select=*&category=eq.${category}&order=created_at.desc`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const posts = await res.json();
    renderPosts(posts, targetId);
  } catch (e) {
    console.error("Erreur Supabase:", e);
    document.getElementById(targetId).innerHTML = `<div class="text-red-400">Erreur de chargement.</div>`;
  }
}

function renderPosts(posts, targetId){
  const root = document.getElementById(targetId);
  if (!root) return;
  if (!posts.length) {
    root.innerHTML = `<div class="text-white/60">Aucune publication.</div>`;
    return;
  }
  root.innerHTML = posts.map(p => `
    <article class="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 class="font-semibold text-lg">${esc(p.title || 'Publication')}</h3>
      ${p.link_url ? `<p><a class="text-blue-300 underline break-all" href="${esc(p.link_url)}" target="_blank">Lien</a></p>` : ''}
      ${p.media_url ? `<img src="${esc(p.media_url)}" class="mt-3 rounded-xl w-full h-auto"/>` : ''}
      ${p.content ? `<p class="mt-3 text-white/80 text-sm whitespace-pre-wrap">${esc(p.content)}</p>` : ''}
      ${p.btc_price ? `<p class="mt-3 text-xs text-white/50">BTC : ${Number(p.btc_price).toFixed(2)} €</p>` : ''}
      <div class="mt-4 text-xs text-white/50 flex justify-between">
        <span>${new Date(p.created_at).toLocaleString('fr-BE')}</span>
        <span>${esc(p.author || '—')}</span>
      </div>
    </article>`).join('');
}

// ==========================
//  TRADINGVIEW TICKER
// ==========================
// Injection TradingView — robuste (attend le partial et évite les doublons)
function injectTradingViewTicker(){
  // Empêche l’initialisation multiple
  if (window.__tvTickerInitialized) return;

  const tryInit = () => {
    const container = document.querySelector('#tv-ticker .tradingview-widget-container');
    if (!container) return false;

    // Marque comme initialisé
    window.__tvTickerInitialized = true;

    const cfg = {
      symbols: [
        {proName:"FOREXCOM:XAUUSD",title:"Gold"},
        {proName:"BITSTAMP:BTCUSD",title:"BTC"},
        {proName:"COINBASE:ETHUSD",title:"ETH"},
        {proName:"OANDA:SPX500USD",title:"S&P 500"},
        {proName:"FX_IDC:EURUSD",title:"EUR/USD"}
      ],
      showSymbolLogo:true,isTransparent:true,displayMode:"adaptive",colorTheme:"dark",locale:"fr"
    };

    const s = document.createElement('script');
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    s.innerHTML = JSON.stringify(cfg);
    container.appendChild(s);
    return true;
  };

  // 1) Essai immédiat
  if (tryInit()) return;

  // 2) Observe si le partial arrive ensuite
  const obs = new MutationObserver(() => { if (tryInit()) obs.disconnect(); });
  obs.observe(document.documentElement, { childList:true, subtree:true });

  // 3) Filet de sécurité: quelques retries temporisés
  let attempts = 0;
  const id = setInterval(() => {
    if (tryInit() || ++attempts > 20) clearInterval(id);
  }, 150);
}
// ==========================
//  BACKGROUND VERTICAL SCROLLER
//  -> Seules les PHOTOS de fond se déplacent
// ==========================
function initBgVerticalScroller(){
  const root = document.getElementById('bg-scroller');
  if(!root) return;

  const track = root.querySelector('.vtrack');
  const imgs  = [...root.querySelectorAll('.bgimg')];
  if(!track || !imgs.length) return;

  // Étendre la piste si la page est longue (duplication simple)
  const ensureLength = () => {
    const docH = document.documentElement.scrollHeight || document.body.scrollHeight;
    while (track.scrollHeight < docH * 1.3) {
      imgs.forEach(img => track.appendChild(img.cloneNode(true)));
    }
  };
  ensureLength();

  // Parallax lent : le contenu de la page scrolle normalement,
  // seule la PISTE en arrière-plan se déplace plus lentement.
  const compute = () => {
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight || 1;
    const maxScroll = Math.max(1, docH - winH);
    const y = window.scrollY || 0;
    const progress = y / maxScroll;

    const trackH = track.scrollHeight;
    const extra = Math.max(0, trackH - winH);
    const ty = - extra * progress * 0.25;      // vitesse plus lente (parallax net)
    track.style.transform = `translate(-50%, ${ty}px)`;
    //track.style.transition = 'transform 60ms linear'; // inertie discrète
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { compute(); ticking = false; });
  };

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', () => { ensureLength(); onScroll(); });
  compute();
}