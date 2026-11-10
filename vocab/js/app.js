// Word lookup: pronunciation (Free Dictionary API + speech fallback), synonyms (Datamuse + dictionary),
// level estimate from word frequency, and intermediate (B1/B2) replacements for advanced (C1/C2) words.
(function () {
  'use strict';

  const LOCAL = window.ADVANCED_WORDS || {};
  const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const DM_API = 'https://api.datamuse.com/';
  const LEVELS = ['A', 'B1', 'B2', 'C1', 'C2'];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- storage (wrapped: may be unavailable) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  let recent = store.get('vocab.history', []);
  let saved = store.get('vocab.saved', []);

  // ---------- level from frequency (occurrences per million words) ----------
  function levelFromFreq(f) {
    if (f == null || isNaN(f)) return null;
    if (f >= 60) return 'A';
    if (f >= 15) return 'B1';
    if (f >= 4) return 'B2';
    if (f >= 1) return 'C1';
    return 'C2';
  }
  const isAdvanced = l => l === 'C1' || l === 'C2';
  const isMid = l => l === 'B1' || l === 'B2';
  const badge = l => `<span class="lvl ${l ? 'lvl-' + l : 'lvl-unk'}" title="${l ? 'Түвшин ≈ ' + l : 'Түвшин тодорхойгүй'}">${l || '?'}</span>`;

  // ---------- network ----------
  async function getJSON(url, ms = 8000) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; } finally { clearTimeout(t); }
  }
  const tag = (item, prefix) => {
    const t = (item && item.tags || []).find(x => x.startsWith(prefix));
    return t ? t.slice(prefix.length) : null;
  };
  const freqOf = item => { const f = tag(item, 'f:'); return f == null ? null : parseFloat(f); };
  const cleanWord = w => /^[a-z][a-z' -]{0,40}$/i.test(w) && w.split(' ').length <= 3;

  // ---------- speech ----------
  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, lang = 'en-US', rate = 0.9) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = rate;
    const v = voices.find(v => v.lang.replace('_', '-') === lang) || voices.find(v => v.lang.startsWith('en'));
    if (v) u.voice = v;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
  function play(url, text, lang, rate) {
    if (url && rate >= 0.9) {
      const a = new Audio(url);
      a.play().catch(() => speak(text, lang, rate));
    } else speak(text, lang, rate);
  }

  // ---------- lookup ----------
  let current = null;
  let reqId = 0;

  async function lookup(raw) {
    const word = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!word) return;
    if (!cleanWord(word)) { showStatus('Зөвхөн англи үсгээр бичнэ үү.'); return; }
    $('q').value = word;
    if (decodeURIComponent(location.hash.slice(1)) !== word) {
      try { window.history.pushState(null, '', '#' + encodeURIComponent(word)); } catch (e) { /* ignore */ }
    }
    const my = ++reqId;
    showStatus('<div class="spinner"></div>Хайж байна…', true);

    const enc = encodeURIComponent(word);
    const [dict, self, syn, ml] = await Promise.all([
      getJSON(DICT_API + enc),
      getJSON(`${DM_API}words?sp=${enc}&md=f&ipa=1&qe=sp&max=1`),
      getJSON(`${DM_API}words?rel_syn=${enc}&md=f&max=40`),
      getJSON(`${DM_API}words?ml=${enc}&md=f&max=30`),
    ]);
    if (my !== reqId) return;

    const local = LOCAL[word];
    const selfItem = Array.isArray(self) && self[0] && self[0].word === word ? self[0] : null;
    const selfF = selfItem ? freqOf(selfItem) : null;
    const entries = Array.isArray(dict) ? dict : [];

    // Candidate synonyms with a relevance rank.
    const cands = new Map();
    const add = (w, rank, f, src) => {
      w = String(w).toLowerCase().trim();
      if (!w || w === word || !cleanWord(w)) return;
      const c = cands.get(w) || { w, rank: 0, f: null, curated: false };
      c.rank += rank;
      if (f != null && c.f == null) c.f = f;
      if (src === 'local') c.curated = true;
      cands.set(w, c);
    };
    if (local) local.mid.forEach((w, i) => add(w, 1000 - i, null, 'local'));
    if (Array.isArray(syn)) syn.forEach((it, i) => add(it.word, 300 - i * 4, freqOf(it), 'syn'));
    entries.forEach(e => (e.meanings || []).forEach(m => {
      (m.synonyms || []).forEach((w, i) => add(w, 220 - i * 5, null, 'dict'));
      (m.definitions || []).forEach(d => (d.synonyms || []).forEach((w, i) => add(w, 200 - i * 5, null, 'dict')));
    }));
    if (Array.isArray(ml)) ml.slice(0, 20).forEach((it, i) => add(it.word, 120 - i * 5, freqOf(it), 'ml'));
    // Reverse: advanced words in the built-in list whose simple form is this word (for "upgrade" suggestions).
    Object.keys(LOCAL).forEach(k => { if (LOCAL[k].mid.includes(word)) add(k, 150, null, 'rev'); });

    if (!entries.length && !cands.size && !local && !selfItem) {
      const sug = await getJSON(`${DM_API}sug?s=${enc}&max=6`);
      if (my !== reqId) return;
      const opts = (sug || []).map(s => s.word).filter(w => w !== word);
      showStatus(`<b>“${esc(word)}”</b> олдсонгүй.` + (opts.length
        ? `<br><br>Та үүнийг хэлэх гэсэн үү?<div class="chips" style="justify-content:center;margin-top:8px">${opts.map(w => chip(w)).join('')}</div>`
        : '<br><small>Интернэт холболтоо шалгана уу.</small>'));
      return;
    }

    // Fill missing frequencies for the top candidates (one small request each).
    const list = [...cands.values()].sort((a, b) => b.rank - a.rank).slice(0, 30);
    const missing = list.filter(c => c.f == null && !c.w.includes(' ')).slice(0, 15);
    await Promise.all(missing.map(async c => {
      const r = await getJSON(`${DM_API}words?sp=${encodeURIComponent(c.w)}&md=f&max=1`, 5000);
      if (Array.isArray(r) && r[0] && r[0].word === c.w) c.f = freqOf(r[0]);
    }));
    if (my !== reqId) return;
    list.forEach(c => {
      c.lvl = LOCAL[c.w] ? LOCAL[c.w].lvl : levelFromFreq(c.f);
      if (!c.lvl && c.curated) c.lvl = 'B1'; // curated plain phrases ("make better")
    });

    const lvl = local ? local.lvl : levelFromFreq(selfF);
    const pron = pickPron(entries, selfItem);
    current = { word, lvl, local, entries, list, pron, selfF };
    render(current);
    remember(word);
  }

  function pickPron(entries, selfItem) {
    const out = { us: null, uk: null, ipa: null };
    entries.forEach(e => {
      if (!out.ipa && e.phonetic) out.ipa = e.phonetic;
      (e.phonetics || []).forEach(p => {
        const a = p.audio || '';
        if (!out.ipa && p.text) out.ipa = p.text;
        if (/-us\.mp3$/.test(a) && !out.us) out.us = { audio: a, text: p.text };
        else if (/-(uk|gb)\.mp3$/.test(a) && !out.uk) out.uk = { audio: a, text: p.text };
        else if (a && !out.us && !/-(uk|gb|au)\.mp3$/.test(a)) out.us = { audio: a, text: p.text };
      });
    });
    if (!out.ipa && selfItem) { const ipa = tag(selfItem, 'ipa_pron:'); if (ipa) out.ipa = '/' + ipa + '/'; }
    return out;
  }

  // ---------- render ----------
  function chip(w, lvl) {
    return `<button class="chip" type="button" data-go="${esc(w)}">${lvl !== undefined ? badge(lvl) : ''}${esc(w)}</button>`;
  }
  function midItem(c) {
    return `<div class="mid-item"><button class="go" type="button" data-go="${esc(c.w)}">${badge(c.lvl)}<span>${esc(c.w)}</span></button>` +
      `<button class="say" type="button" data-say="${esc(c.w)}" aria-label="${esc(c.w)} дуудах">🔊</button></div>`;
  }

  function render(d) {
    $('welcome').hidden = true;
    $('status').hidden = true;
    $('result').hidden = false;

    $('wTitle').textContent = d.word;
    const pos = [...new Set(d.entries.flatMap(e => (e.meanings || []).map(m => m.partOfSpeech)))].filter(Boolean);
    $('wMeta').innerHTML = badge(d.lvl) +
      `<span>${d.lvl ? (isAdvanced(d.lvl) ? 'Ахисан түвшин' : isMid(d.lvl) ? 'Дунд түвшин' : 'Анхан түвшин') : 'Түвшин тодорхойгүй'}</span>` +
      (pos.length ? `<span>· ${esc(pos.join(', '))}</span>` : '');

    // Pronunciation
    const p = d.pron;
    const ipaUS = (p.us && p.us.text) || p.ipa || '';
    const ipaUK = (p.uk && p.uk.text) || p.ipa || '';
    $('pron').innerHTML =
      `<button class="pron-btn" type="button" data-pron="us">🇺🇸 <span class="ipa">${esc(ipaUS || 'US')}</span> 🔊</button>` +
      `<button class="pron-btn" type="button" data-pron="uk">🇬🇧 <span class="ipa">${esc(ipaUK || 'UK')}</span> 🔊</button>` +
      `<button class="pron-btn" type="button" data-pron="slow">🐢 <small>Удаан</small></button>`;

    // Mongolian meaning
    const gt = `https://translate.google.com/?sl=en&tl=mn&text=${encodeURIComponent(d.word)}`;
    $('mn').innerHTML = d.local
      ? `<b>🇲🇳 Монгол:</b>${esc(d.local.mn)}`
      : `<b>🇲🇳 Монгол:</b><a href="${gt}" target="_blank" rel="noopener">Google Translate-ээр харах ↗</a>`;

    // Intermediate equivalents (main feature) / upgrades for simple words
    const adv = isAdvanced(d.lvl) || !!d.local;
    let items, title, hint;
    if (adv) {
      items = d.list.filter(c => c.curated || (isMid(c.lvl) && (d.selfF == null || c.f == null || c.f > d.selfF)));
      if (items.length < 3) items = items.concat(d.list.filter(c => c.lvl === 'A' && !items.includes(c)));
      items = items.slice(0, 8);
      title = '🎯 Дунд түвшний орлуулах үгс';
      hint = `“${d.word}” ${d.lvl ? '(' + d.lvl + ')' : ''} гэдгийг энгийнээр хэлбэл:`;
    } else {
      items = d.list.filter(c => isAdvanced(c.lvl)).slice(0, 8);
      title = '🚀 Ахисан түвшний хувилбар';
      hint = `“${d.word}” нь ахисан түвшний үг биш. Үгийн сангаа өргөжүүлэх хувилбарууд:`;
    }
    $('midTitle').textContent = title;
    $('midHint').textContent = hint;
    $('midList').innerHTML = items.length ? items.map(midItem).join('')
      : '<p class="empty-note">Тохирох үг олдсонгүй.</p>';

    // Definitions
    const defs = [];
    d.entries.forEach(e => (e.meanings || []).forEach(m => {
      const def = (m.definitions || [])[0];
      if (def && defs.length < 4) defs.push({ pos: m.partOfSpeech, def: def.definition, ex: def.example });
    }));
    $('defCard').hidden = !defs.length;
    $('defs').innerHTML = defs.map(x => `<div class="def"><span class="pos">${esc(x.pos || '')}</span>` +
      `<p>${esc(x.def)}</p>${x.ex ? `<p class="ex">“${esc(x.ex)}”</p>` : ''}</div>`).join('');

    // All synonyms
    const syns = d.list.slice(0, 24);
    $('syns').innerHTML = syns.length ? syns.map(c => chip(c.w, c.lvl)).join('')
      : '<p class="empty-note">Ижил төстэй үг олдсонгүй.</p>';

    updateStar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showStatus(html, loading) {
    $('status').innerHTML = html;
    $('status').hidden = false;
    $('result').hidden = true;
    $('welcome').hidden = true;
    if (!loading) current = null;
  }

  // ---------- history & saved ----------
  function remember(w) {
    recent = [w, ...recent.filter(x => x !== w)].slice(0, 10);
    store.set('vocab.history', recent);
    renderHistory();
  }
  function renderHistory() {
    $('historyRow').hidden = !recent.length;
    $('history').innerHTML = recent.map(w => `<button class="chip sm" type="button" data-go="${esc(w)}">${esc(w)}</button>`).join('');
  }
  function midWords() {
    return [...$('midList').querySelectorAll('[data-go]')].map(b => b.dataset.go).slice(0, 3);
  }
  function updateStar() {
    const on = current && saved.some(s => s.w === current.word);
    $('saveBtn').classList.toggle('on', !!on);
    $('saveBtn').textContent = on ? '★' : '☆';
  }
  function toggleSave() {
    if (!current) return;
    const i = saved.findIndex(s => s.w === current.word);
    if (i >= 0) saved.splice(i, 1);
    else saved.unshift({ w: current.word, lvl: current.lvl, mn: current.local ? current.local.mn : '', mid: midWords() });
    store.set('vocab.saved', saved);
    updateStar();
    renderSaved();
  }
  function renderSaved() {
    $('savedCard').hidden = !saved.length;
    $('savedCount').textContent = saved.length ? `(${saved.length})` : '';
    $('savedList').innerHTML = saved.map(s =>
      `<li>${badge(s.lvl)}<button class="s-word" type="button" data-go="${esc(s.w)}">${esc(s.w)}</button>` +
      `<span class="s-arrow">→</span><span class="s-mid">${esc(s.mid.join(', '))}${s.mn ? ' · ' + esc(s.mn) : ''}</span>` +
      `<button class="say" type="button" data-say="${esc(s.w)}" aria-label="Дуудах">🔊</button>` +
      `<button class="s-del" type="button" data-del="${esc(s.w)}" aria-label="Устгах">✕</button></li>`).join('');
  }

  // ---------- autocomplete ----------
  let sugTimer;
  $('q').addEventListener('input', () => {
    clearTimeout(sugTimer);
    const s = $('q').value.trim().toLowerCase();
    if (s.length < 2) return;
    sugTimer = setTimeout(async () => {
      const localHits = Object.keys(LOCAL).filter(k => k.startsWith(s)).slice(0, 5);
      const r = await getJSON(`${DM_API}sug?s=${encodeURIComponent(s)}&max=8`, 3000);
      const words = [...new Set([...localHits, ...((r || []).map(x => x.word))])].slice(0, 10);
      $('sugList').innerHTML = words.map(w => `<option value="${esc(w)}"></option>`).join('');
    }, 200);
  });

  // ---------- events ----------
  $('searchForm').addEventListener('submit', e => { e.preventDefault(); lookup($('q').value); });
  $('randomBtn').addEventListener('click', () => {
    const keys = Object.keys(LOCAL);
    lookup(keys[Math.floor(Math.random() * keys.length)]);
  });
  $('saveBtn').addEventListener('click', toggleSave);
  $('clearSaved').addEventListener('click', () => {
    if (!confirm('Хадгалсан бүх үгийг устгах уу?')) return;
    saved = []; store.set('vocab.saved', saved); renderSaved(); updateStar();
  });
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    const say = e.target.closest('[data-say]');
    const pr = e.target.closest('[data-pron]');
    const del = e.target.closest('[data-del]');
    if (say) { speak(say.dataset.say); return; }
    if (del) { saved = saved.filter(s => s.w !== del.dataset.del); store.set('vocab.saved', saved); renderSaved(); updateStar(); return; }
    if (go) { lookup(go.dataset.go); return; }
    if (pr && current) {
      const p = current.pron, w = current.word, k = pr.dataset.pron;
      if (k === 'us') play(p.us && p.us.audio, w, 'en-US', 0.9);
      else if (k === 'uk') play(p.uk && p.uk.audio, w, 'en-GB', 0.9);
      else speak(w, 'en-US', 0.55);
    }
  });
  window.addEventListener('popstate', () => {
    const w = decodeURIComponent(location.hash.slice(1));
    if (w) lookup(w); else showWelcome();
  });
  function showWelcome() {
    $('welcome').hidden = false; $('result').hidden = true; $('status').hidden = true; $('q').value = ''; current = null;
  }

  // Theme toggle (remembered per browser)
  const theme = store.get('vocab.theme', null);
  if (theme) document.documentElement.dataset.theme = theme;
  $('themeToggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('vocab.theme', next);
  });

  // ---------- init ----------
  $('examples').innerHTML = ['ubiquitous', 'meticulous', 'ephemeral', 'alleviate', 'procrastinate', 'happy']
    .map(w => chip(w, LOCAL[w] ? LOCAL[w].lvl : undefined)).join('');
  renderHistory();
  renderSaved();
  const start = decodeURIComponent(location.hash.slice(1));
  if (start) lookup(start);
})();
