(function(){
  const $ = s => document.querySelector(s);
  const modal = $("#gateModal"), openBtn = $("#openBtn"), closeBtn = $("#closeModal"),
        submitBtn = $("#submitCode"), input = $("#secretInput"), status = $("#statusMsg"),
        protectedSec = $("#protected"), greet = $("#greet"), goApp = $("#goApp"), logout = $("#logout");

  const sessKey = "nl_gate_token_v1";
  const profKey = "nl_profile_v1";

  function now(){ return Date.now(); }
  function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function load(k){ try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function clear(k){ localStorage.removeItem(k); }

  async function sha256Hex(str){
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  function setSession(profile){
    save(sessKey, {ok:true, exp: now() + (24*60*60*1000)});
    save(profKey, profile);
  }

  function sessionValid(){
    const t = load(sessKey);
    return t && t.ok && t.exp > now();
  }

  function showProtected(profile){
    protectedSec.classList.remove("hidden");
    modal.classList.add("hidden");
    greet.textContent = `Hola, ${profile.name} — rol: ${profile.role} (${(profile.scopes||[]).join(", ")||"sin scopes"})`;
  }

  function updateStatus(msg, cls){ status.textContent = msg || ""; status.className = "status " + (cls || ""); }

  async function handleSubmit(){
    const code = input.value.trim();
    if(!code){ updateStatus("Ingresa un código.", "err"); return; }
    const hash = await sha256Hex(code);
    const profile = (window.NL_PROFILES || []).find(p => p.hash === hash);
    if(!profile){ updateStatus("Código incorrecto.", "err"); return; }
    setSession(profile);
    updateStatus("Acceso concedido.", "ok");
    showProtected(profile);
  }

  function openModal(){
    if(sessionValid()){
      const p = load(profKey);
      if(p){ showProtected(p); return; }
    }
    modal.classList.remove("hidden"); input.value=""; updateStatus("", ""); setTimeout(()=> input.focus(), 50);
  }

  function closeModal(){ modal.classList.add("hidden"); }

  document.addEventListener("click", e=>{
    if(e.target.id==="openBtn") openModal();
    if(e.target.id==="closeModal") closeModal();
    if(e.target.id==="submitCode") handleSubmit();
    if(e.target.id==="goApp"){ const p = load(profKey)||{}; location.href = "../app/index.html?pid=" + encodeURIComponent(p.id||"anon"); }
    if(e.target.id==="logout"){ clear(sessKey); clear(profKey); location.reload(); }
  });

  document.addEventListener("keydown", e=>{ if(e.key==="Enter" && modal && !modal.classList.contains("hidden")) handleSubmit(); });

  if(sessionValid()){ const p = load(profKey); if(p) showProtected(p); }
})();