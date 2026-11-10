// Word lookup: pronunciation, synonyms with an estimated level, and intermediate (B1/B2) replacements
// for advanced (C1/C2) words. Sources, in order: built-in list (offline) → Free Dictionary + Datamuse
// (standalone site only) → Claude via the `sample` capability (published claude.ai page, on request).
(function () {
  'use strict';

  const LOCAL = window.ADVANCED_WORDS || {};
  const LOCAL_KEYS = Object.keys(LOCAL).sort();
  const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const DM_API = 'https://api.datamuse.com/';
  // Inside a claude.ai viewer the network is sandboxed, so skip the web APIs there.
  const IN_CLAUDE = !!(window.claude && typeof window.claude.use === 'function');
  const USE_WEB = !IN_CLAUDE;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CYR = /[а-яёөү]/i;

  // ---------- storage (may be unavailable) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };
  let recent = store.get('vocab.history', []);
  let saved = store.get('vocab.saved', []);

  // ---------- Claude (sample capability) ----------
  let sampleFn = null;
  if (IN_CLAUDE) {
    window.claude.use('sample').then(s => { sampleFn = s || null; refreshAiButtons(); }).catch(() => {});
  }

  // ---------- indexes for offline related words ----------
  const byMid = {}; // simple word -> [advanced words]
  LOCAL_KEYS.forEach(k => LOCAL[k].mid.forEach(m => (byMid[m] = byMid[m] || []).push(k)));
  function relatedAdvanced(word) {
    const score = {};
    const e = LOCAL[word];
    if (e) e.mid.forEach(m => (byMid[m] || []).forEach(k => { if (k !== word) score[k] = (score[k] || 0) + 1; }));
    (byMid[word] || []).forEach(k => { score[k] = (score[k] || 0) + 2; });
    return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, 12);
  }

  // ---------- level from frequency (per million words) ----------
  function levelFromFreq(f) {
    if (f == null || isNaN(f)) return null;
    if (f >= 60) return 'A';
    if (f >= 15) return 'B1';
    if (f >= 4) return 'B2';
    if (f >= 1) return 'C1';
    return 'C2';
  }
  const LV = ['A', 'B1', 'B2', 'C1', 'C2'];
  const normLvl = l => { l = String(l || '').toUpperCase(); if (l === 'A1' || l === 'A2') return 'A'; return LV.includes(l) ? l : null; };
  const isAdvanced = l => l === 'C1' || l === 'C2';
  const isMid = l => l === 'B1' || l === 'B2';
  const badge = l => `<span class="lvl ${l ? 'lvl-' + l : 'lvl-unk'}" title="${l ? 'Түвшин ≈ ' + l : 'Түвшин тодорхойгүй'}">${l || '?'}</span>`;

  // ---------- network ----------
  async function getJSON(url, ms = 8000) {
    if (!USE_WEB) return null;
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
  function play(url, text, lang) {
    if (url && USE_WEB) new Audio(url).play().catch(() => speak(text, lang));
    else speak(text, lang);
  }

  // ---------- lookup ----------
  let current = null;
  let reqId = 0;

  function setHash(word) {
    if (!/^[a-z-]+$/.test(word)) return;
    if (location.hash.slice(1) !== word) { try { location.hash = word; } catch (e) { /* ignore */ } }
  }

  async function lookup(raw) {
    const word = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!word) return;
    $('q').value = word;
    if (CYR.test(word)) { showMnResults(word); return; }
    if (!cleanWord(word)) { showStatus('Англи үсгээр бичнэ үү. Монгол утгаар хайж бас болно (жш: нямбай).'); return; }
    const my = ++reqId;
    current = { word, pending: true };
    setHash(word);
    const local = LOCAL[word];
    const ai = store.get('vocab.ai.' + word, null);

    if (USE_WEB) showStatus('<div class="spinner"></div>Хайж байна…', true);
    const enc = encodeURIComponent(word);
    const [dict, self, syn, ml] = USE_WEB ? await Promise.all([
      getJSON(DICT_API + enc),
      getJSON(`${DM_API}words?sp=${enc}&md=f&ipa=1&qe=sp&max=1`),
      getJSON(`${DM_API}words?rel_syn=${enc}&md=f&max=40`),
      getJSON(`${DM_API}words?ml=${enc}&md=f&max=30`),
    ]) : [null, null, null, null];
    if (my !== reqId) return;

    const selfItem = Array.isArray(self) && self[0] && self[0].word === word ? self[0] : null;
    const selfF = selfItem ? freqOf(selfItem) : null;
    let entries = Array.isArray(dict) ? dict : [];

    const cands = new Map();
    const add = (w, rank, f, curated, lvl) => {
      w = String(w).toLowerCase().trim();
      if (!w || w === word || !cleanWord(w)) return;
      const c = cands.get(w) || { w, rank: 0, f: null, curated: false, lvl: null };
      c.rank += rank;
      if (f != null && c.f == null) c.f = f;
      if (curated) c.curated = true;
      if (lvl && !c.lvl) c.lvl = lvl;
      cands.set(w, c);
    };
    if (local) local.mid.forEach((w, i) => add(w, 1000 - i, null, true));
    if (Array.isArray(syn)) syn.forEach((it, i) => add(it.word, 300 - i * 4, freqOf(it)));
    entries.forEach(e => (e.meanings || []).forEach(m => {
      (m.synonyms || []).forEach((w, i) => add(w, 220 - i * 5));
      (m.definitions || []).forEach(d => (d.synonyms || []).forEach((w, i) => add(w, 200 - i * 5)));
    }));
    if (Array.isArray(ml)) ml.slice(0, 20).forEach((it, i) => add(it.word, 120 - i * 5, freqOf(it)));
    relatedAdvanced(word).forEach((k, i) => add(k, 150 - i * 3, null, false, LOCAL[k].lvl));
    if (ai) applyAi(ai, add);

    if (!entries.length && !cands.size && !local && !selfItem && !ai) {
      const sug = await getJSON(`${DM_API}sug?s=${enc}&max=6`);
      if (my !== reqId) return;
      showNotFound(word, (sug || []).map(s => s.word).filter(w => w !== word));
      return;
    }

    const list = [...cands.values()].sort((a, b) => b.rank - a.rank).slice(0, 30);
    const missing = list.filter(c => c.f == null && !c.lvl && !c.w.includes(' ')).slice(0, 15);
    await Promise.all(missing.map(async c => {
      const r = await getJSON(`${DM_API}words?sp=${encodeURIComponent(c.w)}&md=f&max=1`, 5000);
      if (Array.isArray(r) && r[0] && r[0].word === c.w) c.f = freqOf(r[0]);
    }));
    if (my !== reqId) return;
    list.forEach(c => {
      if (LOCAL[c.w]) c.lvl = LOCAL[c.w].lvl;
      else if (!c.lvl) c.lvl = levelFromFreq(c.f);
      if (!c.lvl && c.curated) c.lvl = 'B1';
    });

    if (!entries.length && ai && ai.definition) {
      entries = [{ meanings: [{ partOfSpeech: ai.pos || '', definitions: [{ definition: ai.definition, example: ai.example }] }] }];
    }
    const lvl = local ? local.lvl : (normLvl(ai && ai.level) || levelFromFreq(selfF));
    const pron = pickPron(entries, selfItem);
    if (!pron.ipa) pron.ipa = (local && local.ipa) || (ai && ai.ipa) || null;
    const mn = local ? local.mn : (ai && ai.mn) || '';
    current = { word, lvl, local, entries, list, pron, selfF, mn, ai: !!ai };
    render(current);
    remember(word);
  }

  function applyAi(ai, add) {
    (ai.intermediate || []).forEach((w, i) => { if (typeof w === 'string') add(w, 900 - i, null, true); });
    (ai.synonyms || []).forEach((s, i) => {
      const w = typeof s === 'string' ? s : s && s.w;
      if (typeof w === 'string') add(w, 400 - i * 5, null, false, normLvl(s && s.level));
    });
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

  // ---------- ask Claude ----------
  let aiBusy = false;
  async function askClaude(word) {
    if (!sampleFn || aiBusy) return;
    aiBusy = true;
    document.querySelectorAll('[data-ai]').forEach(b => { b.disabled = true; b.textContent = '✨ Claude бодож байна…'; });
    const prompt =
      `You help Mongolian learners of English. For the English word or phrase "${word}", reply with only one JSON object:\n` +
      `{"ipa":"/US IPA/","level":"A|B1|B2|C1|C2 (CEFR estimate)","pos":"part of speech",` +
      `"mn":"short Mongolian meaning in Cyrillic","definition":"simple English definition","example":"short example sentence",` +
      `"intermediate":["3-6 B1/B2 words or short phrases with the same meaning, most natural first"],` +
      `"synonyms":[{"w":"synonym","level":"CEFR estimate"}]}\n` +
      `Give up to 10 synonyms of mixed levels. If "${word}" is not real English, reply {"error":"not_found","suggestions":["closest real words"]}.`;
    let msg = '';
    try {
      const r = await sampleFn.json(prompt, { modelTier: 'quick' });
      if (!r || typeof r !== 'object') throw { code: 'invalid_json' };
      aiBusy = false;
      if (r.error) {
        showNotFound(word, Array.isArray(r.suggestions) ? r.suggestions.filter(s => typeof s === 'string').slice(0, 6) : [], true);
        return;
      }
      store.set('vocab.ai.' + word, r);
      current = null;
      lookup(word);
      return;
    } catch (e) {
      const code = e && e.code;
      if (code === 'not_granted' || code === 'sampling_disabled' || code === 'capability_disabled' || code === 'not_declared') {
        sampleFn = null; msg = 'Claude ашиглах зөвшөөрөл олгогдоогүй байна.';
      } else if (code === 'rate_limited') msg = 'Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.';
      else if (code === 'cancelled') msg = '';
      else msg = 'Claude-аас хариу авч чадсангүй. Дахин оролдоно уу.';
    }
    aiBusy = false;
    refreshAiButtons(msg);
  }
  function refreshAiButtons(msg) {
    document.querySelectorAll('.ai-slot').forEach(slot => {
      const w = slot.dataset.word;
      const note = msg ? `<p class="ai-msg">${esc(msg)}</p>` : '';
      slot.innerHTML = (sampleFn ? `<button class="btn ai" type="button" data-ai="${esc(w)}">${esc(slot.dataset.label)}</button>` : '') + note;
    });
  }
  const aiSlot = (word, label) => `<div class="ai-slot" data-word="${esc(word)}" data-label="${esc(label)}"></div>`;

  // ---------- render ----------
  function chip(w, lvl) {
    return `<button class="chip" type="button" data-go="${esc(w)}">${lvl !== undefined ? badge(lvl) : ''}${esc(w)}</button>`;
  }
  function midItem(c) {
    return `<div class="mid-item"><button class="go" type="button" data-go="${esc(c.w)}">${badge(c.lvl)}<span>${esc(c.w)}</span></button>` +
      `<button class="say" type="button" data-say="${esc(c.w)}" aria-label="${esc(c.w)} дуудах">🔊</button></div>`;
  }
  function showOnly(id) { ['welcome', 'status', 'result'].forEach(k => { $(k).hidden = k !== id; }); }

  function render(d) {
    showOnly('result');
    $('wTitle').textContent = d.word;
    const pos = [...new Set(d.entries.flatMap(e => (e.meanings || []).map(m => m.partOfSpeech)))].filter(Boolean);
    $('wMeta').innerHTML = badge(d.lvl) +
      `<span>${d.lvl ? (isAdvanced(d.lvl) ? 'Ахисан түвшин' : isMid(d.lvl) ? 'Дунд түвшин' : 'Анхан түвшин') : 'Түвшин тодорхойгүй'}</span>` +
      (pos.length ? `<span>· ${esc(pos.join(', '))}</span>` : '') +
      (d.ai ? '<span>· ✨ Claude</span>' : '');

    const p = d.pron;
    const ipaUS = (p.us && p.us.text) || p.ipa || '';
    const ipaUK = (p.uk && p.uk.text) || '';
    $('pron').innerHTML =
      `<button class="pron-btn" type="button" data-pron="us">🇺🇸 <span class="ipa">${esc(ipaUS || 'US')}</span> 🔊</button>` +
      `<button class="pron-btn" type="button" data-pron="uk">🇬🇧 <span class="ipa">${esc(ipaUK || 'UK')}</span> 🔊</button>` +
      `<button class="pron-btn" type="button" data-pron="slow">🐢 <small>Удаан</small></button>`;

    const gt = `https://translate.google.com/?sl=en&tl=mn&text=${encodeURIComponent(d.word)}`;
    $('mn').innerHTML = d.mn
      ? `<b>🇲🇳 Монгол:</b>${esc(d.mn)}`
      : `<b>🇲🇳 Монгол:</b><a href="${gt}" target="_blank" rel="noopener">Google Translate-ээр харах ↗</a>`;

    const adv = isAdvanced(d.lvl) || !!d.local;
    let items, title, hint;
    if (adv) {
      items = d.list.filter(c => c.curated || (isMid(c.lvl) && (d.selfF == null || c.f == null || c.f > d.selfF)));
      if (items.length < 3) items = items.concat(d.list.filter(c => c.lvl === 'A' && !items.includes(c)));
      items = items.slice(0, 8);
      title = '🎯 Дунд түвшний орлуулах үгс';
      hint = `“${d.word}”${d.lvl ? ' (' + d.lvl + ')' : ''} гэдгийг энгийнээр хэлбэл:`;
    } else {
      items = d.list.filter(c => isAdvanced(c.lvl)).slice(0, 8);
      title = '🚀 Ахисан түвшний хувилбар';
      hint = `“${d.word}” нь ахисан түвшний үг биш. Үгийн сангаа өргөжүүлэх хувилбарууд:`;
    }
    $('midTitle').textContent = title;
    $('midHint').textContent = hint;
    $('midList').innerHTML = items.length ? items.map(midItem).join('')
      : '<p class="empty-note">Тохирох үг олдсонгүй.</p>';

    const defs = [];
    d.entries.forEach(e => (e.meanings || []).forEach(m => {
      const def = (m.definitions || [])[0];
      if (def && def.definition && defs.length < 4) defs.push({ pos: m.partOfSpeech, def: def.definition, ex: def.example });
    }));
    $('defCard').hidden = !defs.length && !IN_CLAUDE;
    $('defs').innerHTML = defs.length
      ? defs.map(x => `<div class="def">${x.pos ? `<span class="pos">${esc(x.pos)}</span>` : ''}` +
        `<p>${esc(x.def)}</p>${x.ex ? `<p class="ex">“${esc(x.ex)}”</p>` : ''}</div>`).join('')
      : `<p class="empty-note">Англи тайлбар, жишээ өгүүлбэр, нэмэлт ижил үгсийг Claude-аас авч болно.</p>${aiSlot(d.word, '✨ Claude-аар дэлгэрүүлэх')}`;

    const syns = d.list.slice(0, 24);
    $('synTitle').textContent = !USE_WEB ? '🔁 Ижил төстэй ба холбоотой үгс' : '🔁 Ижил төстэй үгс';
    $('syns').innerHTML = syns.length ? syns.map(c => chip(c.w, c.lvl)).join('')
      : '<p class="empty-note">Ижил төстэй үг олдсонгүй.</p>';

    refreshAiButtons();
    updateStar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showStatus(html, loading) {
    $('status').innerHTML = html;
    showOnly('status');
    if (!loading) current = null;
  }

  function showNotFound(word, opts, fromAi) {
    const close = LOCAL_KEYS.filter(k => k.startsWith(word.slice(0, 3))).slice(0, 6);
    const all = [...new Set([...opts, ...close])].filter(w => w !== word).slice(0, 8);
    showStatus(`<b>“${esc(word)}”</b> ${fromAi ? 'англи үг биш бололтой.' : 'жагсаалтад олдсонгүй.'}` +
      (!fromAi && IN_CLAUDE ? `<div class="ai-center">${aiSlot(word, '✨ Claude-аас асуух')}</div>` : '') +
      (all.length ? `<p>Та үүнийг хэлэх гэсэн үү?</p><div class="chips center">${all.map(w => chip(w, LOCAL[w] ? LOCAL[w].lvl : undefined)).join('')}</div>` : '') +
      (!fromAi && !IN_CLAUDE && !all.length ? '<br><small>Интернэт холболтоо шалгана уу.</small>' : ''));
    refreshAiButtons();
  }

  function showMnResults(q) {
    const hits = LOCAL_KEYS.filter(k => LOCAL[k].mn.toLowerCase().includes(q));
    showStatus(hits.length
      ? `<p class="mn-q">🇲🇳 “${esc(q)}” гэсэн утгатай ${hits.length} үг:</p><ul class="word-rows">${hits.slice(0, 40).map(rowHtml).join('')}</ul>`
      : `<b>“${esc(q)}”</b> утгатай үг жагсаалтад олдсонгүй.`);
  }

  // ---------- word list (browse) ----------
  let browseLvl = 'all';
  let browseShown = 40;
  function rowHtml(k) {
    const e = LOCAL[k];
    return `<li><button class="row-go" type="button" data-go="${esc(k)}">${badge(e.lvl)}<span class="r-word">${esc(k)}</span>` +
      `<span class="r-mn">${esc(e.mn)}</span><span class="r-mid">→ ${esc(e.mid.join(', '))}</span></button></li>`;
  }
  function renderBrowse() {
    const f = $('browseFilter').value.trim().toLowerCase();
    const keys = LOCAL_KEYS.filter(k => (browseLvl === 'all' || LOCAL[k].lvl === browseLvl) &&
      (!f || k.startsWith(f) || LOCAL[k].mn.toLowerCase().includes(f) || LOCAL[k].mid.some(m => m.startsWith(f))));
    $('browseCount').textContent = `${keys.length} үг`;
    $('browseList').innerHTML = keys.slice(0, browseShown).map(rowHtml).join('') ||
      '<li class="empty-note">Тохирох үг алга.</li>';
    $('browseMore').hidden = keys.length <= browseShown;
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
  function updateStar() {
    const on = current && saved.some(s => s.w === current.word);
    $('saveBtn').classList.toggle('on', !!on);
    $('saveBtn').textContent = on ? '★' : '☆';
    $('saveBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function toggleSave() {
    if (!current || current.pending) return;
    const i = saved.findIndex(s => s.w === current.word);
    if (i >= 0) saved.splice(i, 1);
    else {
      const mids = [...$('midList').querySelectorAll('[data-go]')].map(b => b.dataset.go).slice(0, 3);
      saved.unshift({ w: current.word, lvl: current.lvl, mn: current.mn || '', mid: mids });
    }
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
    resetClear();
  }
  let clearArmed = false, clearTimer;
  function resetClear() { clearArmed = false; clearTimeout(clearTimer); $('clearSaved').textContent = 'Бүгдийг устгах'; }

  // ---------- autocomplete ----------
  let sugTimer;
  $('q').addEventListener('input', () => {
    clearTimeout(sugTimer);
    const s = $('q').value.trim().toLowerCase();
    if (s.length < 2 || CYR.test(s)) return;
    sugTimer = setTimeout(async () => {
      const localHits = LOCAL_KEYS.filter(k => k.startsWith(s)).slice(0, 8);
      const r = await getJSON(`${DM_API}sug?s=${encodeURIComponent(s)}&max=8`, 3000);
      const words = [...new Set([...localHits, ...((r || []).map(x => x.word))])].slice(0, 10);
      $('sugList').innerHTML = words.map(w => `<option value="${esc(w)}"></option>`).join('');
    }, 150);
  });

  // ---------- events ----------
  $('searchForm').addEventListener('submit', e => { e.preventDefault(); lookup($('q').value); });
  $('randomBtn').addEventListener('click', () => lookup(LOCAL_KEYS[Math.floor(Math.random() * LOCAL_KEYS.length)]));
  $('saveBtn').addEventListener('click', toggleSave);
  $('clearSaved').addEventListener('click', () => {
    if (!clearArmed) {
      clearArmed = true;
      $('clearSaved').textContent = 'Дахин дарж баталгаажуулна уу';
      clearTimer = setTimeout(resetClear, 4000);
      return;
    }
    saved = []; store.set('vocab.saved', saved); renderSaved(); updateStar();
  });
  $('browseFilter').addEventListener('input', () => { browseShown = 40; renderBrowse(); });
  $('browseLevels').addEventListener('click', e => {
    const b = e.target.closest('[data-lvl]');
    if (!b) return;
    browseLvl = b.dataset.lvl; browseShown = 40;
    $('browseLevels').querySelectorAll('[data-lvl]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    renderBrowse();
  });
  $('browseMore').addEventListener('click', () => { browseShown += 60; renderBrowse(); });
  $('homeBtn').addEventListener('click', () => {
    if (location.hash) { try { location.hash = ''; } catch (e) { /* ignore */ } }
    showWelcome();
  });

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    const say = e.target.closest('[data-say]');
    const pr = e.target.closest('[data-pron]');
    const del = e.target.closest('[data-del]');
    const ai = e.target.closest('[data-ai]');
    if (ai) { askClaude(ai.dataset.ai); return; }
    if (say) { speak(say.dataset.say); return; }
    if (del) { saved = saved.filter(s => s.w !== del.dataset.del); store.set('vocab.saved', saved); renderSaved(); updateStar(); return; }
    if (go) { lookup(go.dataset.go); return; }
    if (pr && current && !current.pending) {
      const p = current.pron, w = current.word, k = pr.dataset.pron;
      if (k === 'us') play(p.us && p.us.audio, w, 'en-US');
      else if (k === 'uk') play(p.uk && p.uk.audio, w, 'en-GB');
      else speak(w, 'en-US', 0.55);
    }
  });
  window.addEventListener('hashchange', () => {
    const w = decodeURIComponent(location.hash.slice(1));
    if (!w) showWelcome();
    else if (!current || current.word !== w) lookup(w);
  });
  function showWelcome() { showOnly('welcome'); $('q').value = ''; current = null; }

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
  $('totalCount').textContent = LOCAL_KEYS.length;
  $('examples').innerHTML = ['ubiquitous', 'meticulous', 'ephemeral', 'alleviate', 'procrastinate', 'happy']
    .map(w => chip(w, LOCAL[w] ? LOCAL[w].lvl : undefined)).join('');
  renderHistory();
  renderSaved();
  renderBrowse();
  const start = decodeURIComponent(location.hash.slice(1));
  if (start) lookup(start);
})();
