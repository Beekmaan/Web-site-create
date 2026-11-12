(() => {
  'use strict';

  // ---------- Config ----------
  const STORAGE_KEY = 'minii-sankhuu:v1';
  const PREFS_KEY = 'minii-sankhuu:prefs';
  const MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

  const BASE_CATEGORIES = {
    expense: [
      { id: 'food', name: 'Хоол хүнс', icon: '🛒', color: '#f97316' },
      { id: 'cafe', name: 'Кафе, ресторан', icon: '🍽️', color: '#fb923c' },
      { id: 'housing', name: 'Орон байр, түрээс', icon: '🏠', color: '#8b5cf6' },
      { id: 'utilities', name: 'Цахилгаан, дулаан, ус', icon: '💡', color: '#eab308' },
      { id: 'phone', name: 'Утас, интернэт', icon: '📱', color: '#0ea5e9' },
      { id: 'transport', name: 'Нийтийн тээвэр, такси', icon: '🚌', color: '#3b82f6' },
      { id: 'car', name: 'Машин, шатахуун', icon: '⛽', color: '#1d4ed8' },
      { id: 'clothing', name: 'Хувцас, гутал', icon: '👕', color: '#ec4899' },
      { id: 'shopping', name: 'Гэр ахуйн бараа', icon: '🛍️', color: '#db2777' },
      { id: 'beauty', name: 'Гоо сайхан, үсчин', icon: '💄', color: '#f472b6' },
      { id: 'health', name: 'Эрүүл мэнд, эм', icon: '💊', color: '#14b8a6' },
      { id: 'sport', name: 'Спорт, фитнес', icon: '🏋️', color: '#10b981' },
      { id: 'education', name: 'Боловсрол, сургалт', icon: '📚', color: '#6366f1' },
      { id: 'kids', name: 'Хүүхэд', icon: '🧸', color: '#a78bfa' },
      { id: 'pets', name: 'Тэжээвэр амьтан', icon: '🐾', color: '#a16207' },
      { id: 'fun', name: 'Зугаа цэнгэл', icon: '🎬', color: '#f43f5e' },
      { id: 'subs', name: 'Захиалгат үйлчилгээ', icon: '📺', color: '#e11d48' },
      { id: 'travel', name: 'Аялал', icon: '✈️', color: '#06b6d4' },
      { id: 'gifts', name: 'Бэлэг, баяр ёслол', icon: '🎁', color: '#c026d3' },
      { id: 'charity', name: 'Хандив, тусламж', icon: '🤝', color: '#65a30d' },
      { id: 'loan', name: 'Зээл, хүүний төлбөр', icon: '🏦', color: '#b91c1c' },
      { id: 'insurance', name: 'Даатгал', icon: '🛡️', color: '#0f766e' },
      { id: 'tax', name: 'Татвар, хураамж', icon: '🧾', color: '#78716c' },
      { id: 'other_e', name: 'Бусад', icon: '📦', color: '#64748b' },
    ],
    income: [
      { id: 'salary', name: 'Цалин', icon: '💼', color: '#12a36b' },
      { id: 'business', name: 'Бизнес, нэмэлт ажил', icon: '📈', color: '#0ea5e9' },
      { id: 'gift', name: 'Бэлэг', icon: '🎁', color: '#a855f7' },
      { id: 'invest', name: 'Хөрөнгө оруулалт, хүү', icon: '💰', color: '#f59e0b' },
      { id: 'other_i', name: 'Бусад', icon: '➕', color: '#64748b' },
    ],
  };
  const GOAL_ICONS = ['🎯', '🛡️', '🏠', '🚗', '✈️', '🎓', '💍', '💻', '👶', '🏥', '🎉'];
  const CUSTOM_COLORS = ['#0891b2', '#7c3aed', '#ca8a04', '#be123c', '#15803d', '#9333ea', '#c2410c', '#0369a1'];
  const SAVING_COLOR = '#0e7490';

  // ---------- Helpers ----------
  const $ = id => document.getElementById(id);
  const today = new Date();
  const fmt = n => Math.round(n).toLocaleString('en-US') + ' ₮';
  const fmtShort = n => {
    const a = Math.abs(n);
    if (a >= 1e6) return String(+(n / 1e6).toFixed(a >= 1e7 ? 0 : 1)) + 'сая';
    if (a >= 1e3) return Math.round(n / 1e3) + 'мян';
    return String(Math.round(n));
  };
  const pad = n => String(n).padStart(2, '0');
  const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parseAmount = s => Number(String(s).replace(/[^\d.]/g, '')) || 0;
  const monthKey = date => 'm-' + date.slice(0, 7);
  const safeId = v => String(v || '').replace(/[^\w-]/g, '').slice(0, 40);
  const inMonth = (tx, y, m) => {
    const [ty, tm] = tx.date.split('-').map(Number);
    return ty === y && tm - 1 === m;
  };
  const sum = list => list.reduce((s, t) => s + t.amount, 0);
  // Net money moved into savings (deposits minus withdrawals).
  const savingNet = list => list.filter(t => t.type === 'saving')
    .reduce((s, t) => s + (t.dir === 'out' ? -t.amount : t.amount), 0);

  const validTx = t => t && ['income', 'expense', 'saving'].includes(t.type) &&
    Number(t.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    (t.type !== 'saving' || !!safeId(t.goalId));
  const cleanTx = t => {
    const tx = {
      id: safeId(t.id) || uid(),
      type: t.type,
      amount: Math.round(Number(t.amount)),
      date: t.date,
      note: String(t.note || '').slice(0, 80),
    };
    if (t.type === 'saving') {
      tx.goalId = safeId(t.goalId);
      tx.dir = t.dir === 'out' ? 'out' : 'in';
    } else {
      tx.category = safeId(t.category) || (t.type === 'income' ? 'other_i' : 'other_e');
    }
    return tx;
  };
  const cleanGoal = g => ({
    id: safeId(g.id) || uid(),
    name: String(g.name || 'Зорилго').slice(0, 60),
    icon: GOAL_ICONS.includes(g.icon) ? g.icon : '🎯',
    target: Math.max(0, Math.round(Number(g.target) || 0)),
    deadline: /^\d{4}-\d{2}$/.test(g.deadline || '') ? g.deadline : '',
  });
  const cleanCat = c => ({
    id: safeId(c.id) || 'c_' + uid(),
    type: c.type === 'income' ? 'income' : 'expense',
    name: String(c.name || 'Ангилал').slice(0, 40),
    icon: String(c.icon || '🏷️').slice(0, 8),
    color: /^#[0-9a-f]{6}$/i.test(c.color || '') ? c.color : CUSTOM_COLORS[0],
  });

  function readJson(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  // ---------- State ----------
  const hosted = !!(window.claude && typeof window.claude.use === 'function');
  const prefs = Object.assign({ theme: null, demoHidden: false }, readJson(PREFS_KEY, {}));
  let state = { transactions: [], goals: [], customCats: [], budget: 0 };
  let loaded = false;
  let view = { year: today.getFullYear(), month: today.getMonth() };
  let editingId = null;
  let activeChart = 'category';
  const demo = buildDemo();

  const isDemo = () => loaded && !state.transactions.length && !state.goals.length && !prefs.demoHidden;
  const allTx = () => isDemo() ? demo.transactions : state.transactions;
  const allGoals = () => isDemo() ? demo.goals : state.goals;
  const savePrefs = () => writeJson(PREFS_KEY, prefs);
  const leaveDemo = () => { if (!prefs.demoHidden) { prefs.demoHidden = true; savePrefs(); } };

  const categories = type => [...BASE_CATEGORIES[type], ...state.customCats.filter(c => c.type === type)];
  function getCat(id) {
    return BASE_CATEGORIES.expense.find(c => c.id === id) ||
      BASE_CATEGORIES.income.find(c => c.id === id) ||
      state.customCats.find(c => c.id === id) ||
      { id, name: 'Бусад', icon: '📦', color: '#64748b' };
  }
  const getGoal = id => allGoals().find(g => g.id === id) || { id, name: 'Устгасан зорилго', icon: '🐷', target: 0 };
  const goalSaved = id => savingNet(allTx().filter(t => t.goalId === id));

  // ---------- Storage: private cloud (hosted) or this browser ----------
  const store = {
    mode: 'local',
    col: null,
    queue: Promise.resolve(),

    initLocal() {
      this.mode = 'local';
      const data = readJson(STORAGE_KEY, null);
      if (data) applyData(data);
      loaded = true;
    },

    async initCloud() {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const id = user ? await user.id() : null;
      if (!db || !id) return false;
      this.mode = 'cloud';
      this.col = db.collection('data/users/' + id);
      const timer = setTimeout(() => {
        if (!loaded) showStorageNotice('Өгөгдөл ачаалж чадахгүй байна. Холболтоо шалгаад түр хүлээнэ үү.');
      }, 10000);
      this.col.onSnapshot(snap => {
        const data = { transactions: [], goals: [], customCats: [], budget: 0 };
        snap.docs.forEach(d => {
          const body = d.data() || {};
          if (d.id === 'settings') {
            data.budget = body.budget;
            data.customCats = body.customCats || [];
          } else if (d.id === 'goals') {
            data.goals = body.items || [];
          } else if (d.id.startsWith('m-') && Array.isArray(body.transactions)) {
            data.transactions.push(...body.transactions);
          }
        });
        applyData(data);
        if (!editingId && $('category').value !== '__new') fillCategories(currentType(), $('category').value);
        if (!snap.metadata.fromCache) { clearTimeout(timer); hideStorageNotice(); }
        loaded = true;
        render();
      }, () => {
        clearTimeout(timer);
        loaded = true;
        showStorageNotice('Өгөгдөлтэй холбогдох боломжгүй боллоо. Хуудсаа дахин нээнэ үү.');
        render();
      });
      return true;
    },

    // Cloud writes run one at a time.
    enqueue(fn) {
      this.queue = this.queue.then(fn).catch(err => {
        if (err && err.code === 'invalid_argument') toast('Танд энэ хуудсанд хадгалах эрх алга байна');
        else if (err && err.code === 'quota_exceeded') toast('Хадгалах багтаамж дүүрсэн байна');
        else toast('Хадгалж чадсангүй. Дахин оролдоно уу');
      });
      return this.queue;
    },

    saveLocal() { writeJson(STORAGE_KEY, state); },

    saveMonths(keys) {
      if (this.mode === 'local') return this.saveLocal();
      [...new Set(keys)].forEach(key => this.enqueue(() => {
        const txs = state.transactions.filter(t => monthKey(t.date) === key);
        const ref = this.col.doc(key);
        return txs.length ? ref.set({ transactions: txs }) : ref.delete();
      }));
    },

    saveSettings() {
      if (this.mode === 'local') return this.saveLocal();
      this.enqueue(() => this.col.doc('settings').set({ budget: state.budget, customCats: state.customCats }));
    },

    saveGoals() {
      if (this.mode === 'local') return this.saveLocal();
      this.enqueue(() => this.col.doc('goals').set({ items: state.goals }));
    },

    replaceAll(oldTxs) {
      this.saveMonths([...oldTxs, ...state.transactions].map(t => monthKey(t.date)));
      this.saveGoals();
      this.saveSettings();
    },
  };

  function applyData(data) {
    state.transactions = (data.transactions || []).filter(validTx).map(cleanTx);
    state.goals = (data.goals || []).map(cleanGoal);
    state.customCats = (data.customCats || []).map(cleanCat);
    state.budget = Number(data.budget) || 0;
    if (data.theme && !prefs.theme) prefs.theme = data.theme;
  }

  function showStorageNotice(text) {
    const n = $('storageNotice');
    n.textContent = text;
    n.classList.remove('hidden');
  }
  function hideStorageNotice() { $('storageNotice').classList.add('hidden'); }

  // ---------- Toast & dialogs ----------
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /**
   * In-page dialog. With `fields` it is a small form and resolves the values
   * (or null); without, it is a yes/no question and resolves true/false.
   * field: {name, label, type: text|amount|month|date|select, value, options, placeholder}
   */
  function dialog({ title, text = '', ok = 'Устгах', danger = true, fields = null, validate = null }) {
    return new Promise(resolve => {
      const m = $('modal');
      $('modalTitle').textContent = title;
      $('modalText').textContent = text;
      $('modalOk').textContent = ok;
      $('modalOk').className = 'btn ' + (danger ? 'danger' : 'primary');
      $('modalError').classList.add('hidden');
      const box = $('modalFields');
      box.innerHTML = (fields || []).map(f => {
        const id = 'mf_' + f.name;
        const ph = f.placeholder ? ` placeholder="${escapeHtml(f.placeholder)}"` : '';
        let input;
        if (f.type === 'select') {
          input = `<select id="${id}">${f.options.map(o =>
            `<option value="${escapeHtml(o.value)}" ${o.value === f.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>`;
        } else if (f.type === 'amount') {
          input = `<input id="${id}" type="text" inputmode="numeric" data-amount value="${f.value ? Number(f.value).toLocaleString('en-US') : ''}"${ph} />`;
        } else {
          input = `<input id="${id}" type="${f.type || 'text'}" maxlength="${f.max || 60}" value="${escapeHtml(f.value || '')}"${ph} />`;
        }
        return `<label class="field"><span>${escapeHtml(f.label)}</span>${input}</label>`;
      }).join('');
      box.querySelectorAll('[data-amount]').forEach(el => el.addEventListener('input', groupDigits));
      m.classList.remove('hidden');
      (box.querySelector('input, select') || $('modalCancel')).focus();

      const close = v => {
        m.classList.add('hidden');
        box.innerHTML = '';
        $('modalOk').onclick = $('modalCancel').onclick = m.onclick = m.onkeydown = null;
        resolve(v);
      };
      const submit = () => {
        if (!fields) return close(true);
        const values = {};
        fields.forEach(f => {
          const v = $('mf_' + f.name).value;
          values[f.name] = f.type === 'amount' ? parseAmount(v) : v.trim();
        });
        const err = validate && validate(values);
        if (err) {
          $('modalError').textContent = err;
          $('modalError').classList.remove('hidden');
          return;
        }
        close(values);
      };
      $('modalOk').onclick = submit;
      $('modalCancel').onclick = () => close(fields ? null : false);
      m.onclick = e => { if (e.target === m) close(fields ? null : false); };
      m.onkeydown = e => {
        if (e.key === 'Escape') close(fields ? null : false);
        if (e.key === 'Enter' && fields && e.target.tagName === 'INPUT') { e.preventDefault(); submit(); }
      };
    });
  }
  const confirmDialog = opts => dialog(opts);

  function groupDigits(e) {
    const n = parseAmount(e.target.value);
    e.target.value = n ? Math.floor(n).toLocaleString('en-US') : '';
  }

  // ---------- Theme ----------
  function applyTheme() {
    if (hosted) return; // the viewer sets the theme
    if (prefs.theme) document.documentElement.dataset.theme = prefs.theme;
    else delete document.documentElement.dataset.theme;
  }
  function currentTheme() {
    const t = document.documentElement.dataset.theme;
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ---------- Transaction form ----------
  const currentType = () => document.querySelector('input[name="type"]:checked').value;

  function fillCategories(type, selected) {
    const base = BASE_CATEGORIES[type];
    const mine = state.customCats.filter(c => c.type === type);
    const opt = c => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${escapeHtml(c.icon + ' ' + c.name)}</option>`;
    $('category').innerHTML =
      `<optgroup label="Үндсэн">${base.map(opt).join('')}</optgroup>` +
      (mine.length ? `<optgroup label="Миний ангилал">${mine.map(opt).join('')}</optgroup>` : '') +
      `<option value="__new">+ Шинэ ангилал нэмэх…</option>`;
    $('category').dataset.prev = $('category').value;
  }

  async function addCustomCategory() {
    const type = currentType();
    const values = await dialog({
      title: type === 'income' ? 'Шинэ орлогын ангилал' : 'Шинэ зарлагын ангилал',
      ok: 'Нэмэх', danger: false,
      fields: [
        { name: 'name', label: 'Нэр', placeholder: 'Жишээ: Хадмын гэр', max: 40 },
        { name: 'icon', label: 'Тэмдэг (emoji)', value: '🏷️', max: 8 },
      ],
      validate: v => {
        if (!v.name) return 'Ангиллын нэрээ бичнэ үү';
        if (categories(type).some(c => c.name.toLowerCase() === v.name.toLowerCase())) return 'Ийм нэртэй ангилал аль хэдийн байна';
        return '';
      },
    });
    if (!values) { $('category').value = $('category').dataset.prev; return; }
    const cat = cleanCat({
      id: 'c_' + uid(), type, name: values.name, icon: values.icon || '🏷️',
      color: CUSTOM_COLORS[state.customCats.length % CUSTOM_COLORS.length],
    });
    state.customCats.push(cat);
    store.saveSettings();
    fillCategories(type, cat.id);
    renderMyCats();
    toast(`"${cat.name}" ангилал нэмэгдлээ`);
  }

  async function removeCustomCategory(id) {
    const cat = state.customCats.find(c => c.id === id);
    if (!cat) return;
    const used = state.transactions.filter(t => t.category === id).length;
    const ok = await confirmDialog({
      title: `"${cat.name}" ангиллыг устгах уу?`,
      text: used ? `Энэ ангилалтай ${used} гүйлгээ "Бусад" гэж харагдана.` : 'Энэ ангиллыг ашигласан гүйлгээ алга.',
    });
    if (!ok) return;
    state.transactions = state.transactions.map(t => t.category === id
      ? { ...t, category: cat.type === 'income' ? 'other_i' : 'other_e' } : t);
    const keys = state.transactions.filter(t => t.category === 'other_e' || t.category === 'other_i').map(t => monthKey(t.date));
    state.customCats = state.customCats.filter(c => c.id !== id);
    if (used) store.saveMonths(keys);
    store.saveSettings();
    fillCategories(currentType());
    render();
  }

  function resetForm() {
    editingId = null;
    $('txForm').reset();
    $('typeExpense').checked = true;
    fillCategories('expense');
    const isNow = view.year === today.getFullYear() && view.month === today.getMonth();
    $('date').value = isoDate(isNow ? today : new Date(view.year, view.month, 1));
    $('formTitle').textContent = 'Гүйлгээ нэмэх';
    $('submitBtn').textContent = 'Нэмэх';
    $('cancelEdit').classList.add('hidden');
  }

  function startEdit(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || tx.type === 'saving') return;
    editingId = id;
    $(tx.type === 'income' ? 'typeIncome' : 'typeExpense').checked = true;
    fillCategories(tx.type, tx.category);
    $('amount').value = tx.amount.toLocaleString('en-US');
    $('date').value = tx.date;
    $('note').value = tx.note || '';
    $('formTitle').textContent = 'Гүйлгээ засах';
    $('submitBtn').textContent = 'Хадгалах';
    $('cancelEdit').classList.remove('hidden');
    $('txForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('amount').focus({ preventScroll: true });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!loaded) return toast('Өгөгдөл ачаалж байна, түр хүлээнэ үү');
    const amount = parseAmount($('amount').value);
    if (amount <= 0) { toast('Дүнгээ 0-ээс их тоогоор оруулна уу'); $('amount').focus(); return; }
    if (!$('date').value) { toast('Огноогоо сонгоно уу'); $('date').focus(); return; }
    if ($('category').value === '__new') { toast('Ангиллаа сонгоно уу'); return; }
    const tx = cleanTx({
      id: editingId || uid(),
      type: currentType(),
      amount,
      category: $('category').value,
      date: $('date').value,
      note: $('note').value.trim(),
    });
    const keys = [monthKey(tx.date)];
    if (editingId) {
      const old = state.transactions.find(t => t.id === editingId);
      if (old) keys.push(monthKey(old.date));
      state.transactions = state.transactions.map(t => t.id === editingId ? tx : t);
      toast('Засвар хадгалагдлаа');
    } else {
      state.transactions.push(tx);
      leaveDemo();
      toast(tx.type === 'income' ? 'Орлого нэмэгдлээ' : 'Зарлага нэмэгдлээ');
    }
    const [y, m] = tx.date.split('-').map(Number);
    view = { year: y, month: m - 1 };
    store.saveMonths(keys);
    resetForm();
    render();
  }

  async function removeTx(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
    const label = tx.type === 'saving' ? `Хуримтлал: ${getGoal(tx.goalId).name}` : (tx.note || getCat(tx.category).name);
    const ok = await confirmDialog({ title: 'Гүйлгээ устгах уу?', text: `${label} — ${fmt(tx.amount)}` });
    if (!ok) return;
    state.transactions = state.transactions.filter(t => t.id !== id);
    if (editingId === id) resetForm();
    store.saveMonths([monthKey(tx.date)]);
    render();
    toast('Устгагдлаа');
  }

  // ---------- Savings goals ----------
  const goalIconOptions = GOAL_ICONS.map(i => ({ value: i, label: i }));

  async function editGoal(id) {
    const goal = id ? state.goals.find(g => g.id === id) : null;
    const values = await dialog({
      title: goal ? 'Зорилго засах' : 'Хуримтлалын шинэ зорилго',
      ok: goal ? 'Хадгалах' : 'Нэмэх', danger: false,
      fields: [
        { name: 'name', label: 'Нэр', value: goal?.name, placeholder: 'Жишээ: Яаралтай тусламжийн сан' },
        { name: 'icon', label: 'Тэмдэг', type: 'select', value: goal?.icon || '🎯', options: goalIconOptions },
        { name: 'target', label: 'Зорилтот дүн (₮)', type: 'amount', value: goal?.target, placeholder: '5,000,000' },
        { name: 'deadline', label: 'Хэзээ гэхэд (заавал биш)', type: 'month', value: goal?.deadline },
      ],
      validate: v => !v.name ? 'Зорилгынхоо нэрийг бичнэ үү' : v.target <= 0 ? 'Зорилтот дүнгээ оруулна уу' : '',
    });
    if (!values) return;
    if (goal) {
      Object.assign(goal, cleanGoal({ ...goal, ...values }));
      toast('Зорилго шинэчлэгдлээ');
    } else {
      state.goals.push(cleanGoal({ id: 'g' + uid(), ...values }));
      leaveDemo();
      toast('Зорилго нэмэгдлээ');
    }
    store.saveGoals();
    render();
  }

  async function moveSaving(goalId, dir) {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    const saved = goalSaved(goalId);
    const values = await dialog({
      title: dir === 'in' ? `${goal.icon} ${goal.name}: мөнгө хийх` : `${goal.icon} ${goal.name}: мөнгө авах`,
      text: `Одоо хуримтлагдсан: ${fmt(saved)}`,
      ok: dir === 'in' ? 'Хийх' : 'Авах', danger: false,
      fields: [
        { name: 'amount', label: 'Дүн (₮)', type: 'amount', placeholder: '0' },
        { name: 'date', label: 'Огноо', type: 'date', value: isoDate(today) },
        { name: 'note', label: 'Тайлбар (заавал биш)', max: 80 },
      ],
      validate: v => {
        if (v.amount <= 0) return 'Дүнгээ 0-ээс их тоогоор оруулна уу';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return 'Огноогоо сонгоно уу';
        if (dir === 'out' && v.amount > saved) return `Хуримтлалд ${fmt(saved)} л байна`;
        return '';
      },
    });
    if (!values) return;
    const tx = cleanTx({ id: uid(), type: 'saving', goalId, dir, amount: values.amount, date: values.date, note: values.note });
    state.transactions.push(tx);
    store.saveMonths([monthKey(tx.date)]);
    render();
    const after = goalSaved(goalId);
    toast(dir === 'in' && goal.target && after >= goal.target && after - tx.amount < goal.target
      ? `🎉 "${goal.name}" зорилгодоо хүрлээ!`
      : dir === 'in' ? `${fmt(tx.amount)} хуримтлалд орлоо` : `${fmt(tx.amount)} хуримтлалаас авлаа`);
  }

  async function removeGoal(id) {
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;
    const moves = state.transactions.filter(t => t.goalId === id);
    const ok = await confirmDialog({
      title: `"${goal.name}" зорилгыг устгах уу?`,
      text: moves.length
        ? `Энэ зорилгын ${moves.length} хуримтлалын бичилт хамт устна.`
        : 'Энэ зорилгод хуримтлал хийгээгүй байна.',
    });
    if (!ok) return;
    state.goals = state.goals.filter(g => g.id !== id);
    state.transactions = state.transactions.filter(t => t.goalId !== id);
    store.saveGoals();
    store.saveMonths(moves.map(t => monthKey(t.date)));
    render();
    toast('Зорилго устгагдлаа');
  }

  function monthsUntil(deadline) {
    const [y, m] = deadline.split('-').map(Number);
    return (y - today.getFullYear()) * 12 + (m - 1 - today.getMonth()) + 1; // this month counts
  }

  function renderGoals(monthTx) {
    const goals = allGoals();
    const demoMode = isDemo();
    const total = savingNet(allTx());
    const thisMonth = savingNet(monthTx);
    $('savingsSummary').textContent = goals.length
      ? `Нийт хуримтлал: ${fmt(total)} · Энэ сард: ${thisMonth >= 0 ? '+' : '−'}${fmt(Math.abs(thisMonth))}`
      : 'Мөнгө хуримтлуулах зорилгоо тавиад, сар бүр хэдийг хийснээ бүртгээрэй.';
    if (!goals.length) {
      $('goalList').innerHTML = '<p class="goals-empty">Зорилго алга. «+ Зорилго нэмэх» дарж эхний зорилгоо тавина уу.</p>';
      return;
    }
    $('goalList').innerHTML = goals.map(g => {
      const saved = goalSaved(g.id);
      const pct = g.target ? Math.min(100, Math.round((saved / g.target) * 100)) : 0;
      const done = g.target > 0 && saved >= g.target;
      const left = Math.max(0, g.target - saved);
      let hint = `Үлдсэн ${fmt(left)}`, hintCls = '';
      if (done) { hint = '🎉 Зорилгодоо хүрлээ'; hintCls = 'ok'; }
      else if (g.deadline) {
        const months = monthsUntil(g.deadline);
        if (months <= 0) { hint += ' · хугацаа хэтэрсэн'; hintCls = 'late'; }
        else hint += ` · сард ~${fmt(Math.ceil(left / months / 1000) * 1000)} хийх хэрэгтэй`;
      }
      const [dy, dm] = (g.deadline || '').split('-').map(Number);
      const sub = `Зорилго: ${fmt(g.target)}` + (g.deadline ? ` · ${dy} оны ${dm}-р сар` : '');
      return `
        <article class="goal ${done ? 'done' : ''}">
          <div class="goal-top">
            <span class="goal-icon">${g.icon}</span>
            <div><div class="goal-name">${escapeHtml(g.name)}</div><div class="goal-sub">${sub}</div></div>
          </div>
          <div class="goal-amt"><strong>${fmt(saved)}</strong><span>${pct}%</span></div>
          <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
          <div class="goal-hint ${hintCls}">${hint}</div>
          ${demoMode ? '' : `<div class="goal-actions">
            <button class="btn primary" data-goal-in="${g.id}">+ Хийх</button>
            <button class="btn ghost" data-goal-out="${g.id}" ${saved > 0 ? '' : 'disabled'}>− Авах</button>
            <span class="spacer"></span>
            <button class="link-btn" data-goal-edit="${g.id}">Засах</button>
            <button class="link-btn" data-goal-del="${g.id}">Устгах</button>
          </div>`}
        </article>`;
    }).join('');
  }

  // ---------- Render ----------
  function render() {
    $('monthLabel').textContent = `${view.year} оны ${MONTHS[view.month]}`;
    const txs = allTx();
    const monthTx = txs.filter(t => inMonth(t, view.year, view.month));
    const budget = isDemo() ? (state.budget || 1800000) : state.budget;
    $('demoBanner').classList.toggle('hidden', !isDemo());
    renderSummary(monthTx, txs);
    renderBudget(monthTx, budget);
    renderGoals(monthTx);
    renderList(monthTx);
    renderDonut(monthTx);
    renderBars(txs);
    renderMyCats();
  }

  function renderSummary(txs, all) {
    const inc = txs.filter(t => t.type === 'income');
    const exp = txs.filter(t => t.type === 'expense');
    const sumI = sum(inc), sumE = sum(exp), sav = savingNet(txs);
    const bal = sumI - sumE - sav;
    $('sumIncome').textContent = fmt(sumI);
    $('sumExpense').textContent = fmt(sumE);
    $('sumSaving').textContent = (sav < 0 ? '−' : '') + fmt(Math.abs(sav));
    $('savingTotal').textContent = `Нийт: ${fmt(savingNet(all))}`;
    $('sumBalance').textContent = (bal < 0 ? '−' : '') + fmt(Math.abs(bal));
    $('incomeCount').textContent = `${inc.length} гүйлгээ`;
    $('expenseCount').textContent = `${exp.length} гүйлгээ`;
    const rate = sumI > 0 ? Math.round((sav / sumI) * 100) : 0;
    $('savingRate').textContent = `Орлогын ${rate}%-ийг хуримтлуулсан`;
  }

  function renderBudget(txs, budget) {
    const spent = sum(txs.filter(t => t.type === 'expense'));
    const bar = $('budgetBar');
    bar.classList.remove('warn', 'over');
    if (!budget) {
      bar.style.width = '0';
      $('budgetText').textContent = 'Төсөв тохируулаагүй байна. Сарын зарлагын дээд хязгаараа тогтоогоорой.';
      return;
    }
    const pct = (spent / budget) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
    if (pct >= 100) bar.classList.add('over');
    else if (pct >= 80) bar.classList.add('warn');
    const left = budget - spent;
    $('budgetText').innerHTML = left >= 0
      ? `<strong>${fmt(spent)}</strong> / ${fmt(budget)} зарцуулсан · <strong>${fmt(left)}</strong> үлдсэн (${Math.round(pct)}%)`
      : `Төсөв <strong>${fmt(-left)}</strong>-өөр хэтэрсэн (${Math.round(pct)}%)`;
  }

  function renderList(txs) {
    if (!loaded) {
      $('emptyState').classList.add('hidden');
      $('txList').innerHTML = '<li class="empty"><p>Өгөгдөл ачаалж байна…</p></li>';
      return;
    }
    const q = $('search').value.trim().toLowerCase();
    const type = $('filterType').value;
    const demoMode = isDemo();
    const describe = t => {
      if (t.type === 'saving') {
        const g = getGoal(t.goalId);
        return { title: t.note || g.name, sub: t.dir === 'out' ? `Хуримтлалаас авсан · ${g.name}` : `Хуримтлал · ${g.name}`, icon: g.icon, color: SAVING_COLOR };
      }
      const c = getCat(t.category);
      return { title: t.note || c.name, sub: c.name, icon: c.icon, color: c.color };
    };
    const list = txs
      .filter(t => type === 'all' || t.type === type)
      .filter(t => {
        if (!q) return true;
        const d = describe(t);
        return d.title.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    const empty = txs.length === 0;
    $('emptyState').classList.toggle('hidden', !empty);
    const hasData = state.transactions.length || state.goals.length;
    $('showDemo').classList.toggle('hidden', !!hasData);
    $('emptyText').textContent = hasData
      ? 'Энэ сард гүйлгээ алга байна.'
      : 'Одоогоор гүйлгээ алга. Дээрх маягтаар эхний гүйлгээгээ нэмээрэй.';

    if (!empty && list.length === 0) {
      $('txList').innerHTML = '<li class="empty"><p>Хайлтад тохирох гүйлгээ олдсонгүй.</p></li>';
      return;
    }

    let html = '';
    let lastDate = '';
    for (const t of list) {
      if (t.date !== lastDate) {
        lastDate = t.date;
        const [, m, d] = t.date.split('-').map(Number);
        html += `<li class="tx-day">${t.date === isoDate(today) ? 'Өнөөдөр' : `${m}-р сарын ${d}`}</li>`;
      }
      const d = describe(t);
      const sign = t.type === 'income' || (t.type === 'saving' && t.dir === 'out') ? '+' : '−';
      html += `
        <li class="tx">
          <div class="tx-icon" style="background:${d.color}22">${d.icon}</div>
          <div class="tx-main">
            <div class="tx-title">${escapeHtml(d.title)}</div>
            <div class="tx-sub">${escapeHtml(d.sub)}</div>
          </div>
          <div class="tx-amt ${t.type}">${sign}${fmt(t.amount)}</div>
          ${demoMode ? '' : `<div class="tx-actions">
            ${t.type === 'saving' ? '' : `<button data-edit="${t.id}" aria-label="Засах">Засах</button>`}
            <button class="del" data-del="${t.id}" aria-label="Устгах">Устгах</button>
          </div>`}
        </li>`;
    }
    $('txList').innerHTML = html;
  }

  function renderDonut(txs) {
    const svg = $('donut');
    const totals = {};
    txs.filter(t => t.type === 'expense').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    $('donutTotal').textContent = fmt(total);

    const R = 80, r = 56, cx = 100, cy = 100;
    const mid = (R + r) / 2, w = R - r, C = 2 * Math.PI * mid;
    if (!total) {
      svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${mid}" fill="none" style="stroke:var(--surface-2)" stroke-width="${w}"/>`;
      $('legend').innerHTML = '<li class="muted">Энэ сард зарлага бүртгэгдээгүй.</li>';
      return;
    }
    let offset = 0;
    const gap = entries.length > 1 ? 2 : 0;
    svg.innerHTML = entries.map(([id, v]) => {
      const c = getCat(id);
      const len = (v / total) * C;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${mid}" fill="none"
        stroke="${c.color}" stroke-width="${w}"
        stroke-dasharray="${Math.max(len - gap, 0.5)} ${C}"
        stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})">
        <title>${escapeHtml(c.name)}: ${fmt(v)}</title></circle>`;
      offset += len;
      return seg;
    }).join('');

    $('legend').innerHTML = entries.map(([id, v]) => {
      const c = getCat(id);
      return `<li><span class="sw" style="background:${c.color}"></span>
        <span class="name">${c.icon} ${escapeHtml(c.name)}</span>
        <span class="pct">${Math.round((v / total) * 100)}%</span>
        <span class="amt">${fmt(v)}</span></li>`;
    }).join('');
  }

  function renderBars(all) {
    const svg = $('bars');
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(view.year, view.month - i, 1);
      const y = d.getFullYear(), m = d.getMonth();
      const txs = all.filter(t => inMonth(t, y, m));
      months.push({
        label: `${m + 1}-р сар`,
        income: sum(txs.filter(t => t.type === 'income')),
        expense: sum(txs.filter(t => t.type === 'expense')),
        saving: Math.max(0, savingNet(txs)),
      });
    }
    const series = [['income', 'орлого'], ['expense', 'зарлага'], ['saving', 'хуримтлал']];
    const W = 420, H = 240, L = 48, B = 28, T = 12, Rp = 8;
    const max = Math.max(1, ...months.flatMap(m => series.map(([k]) => m[k])));
    const nice = niceMax(max);
    const plotH = H - T - B, plotW = W - L - Rp;
    const slot = plotW / months.length, bw = Math.min(14, slot / 4.2), gap = 2;
    const yPos = v => T + plotH - (v / nice) * plotH;

    let g = '<g class="axis">';
    for (let i = 0; i <= 4; i++) {
      const v = (nice / 4) * i, y = yPos(v);
      g += `<line x1="${L}" x2="${W - Rp}" y1="${y}" y2="${y}" ${i ? 'stroke-dasharray="3 4"' : ''}/>
            <text x="${L - 8}" y="${y + 4}" text-anchor="end">${fmtShort(v)}</text>`;
    }
    months.forEach((m, i) => {
      g += `<text x="${L + slot * i + slot / 2}" y="${H - 8}" text-anchor="middle">${m.label}</text>`;
    });
    g += '</g>';
    const groupW = series.length * bw + (series.length - 1) * gap;
    months.forEach((m, i) => {
      const x0 = L + slot * i + slot / 2 - groupW / 2;
      series.forEach(([key, word], j) => {
        const v = m[key], y = yPos(v), h = T + plotH - y;
        g += `<rect x="${x0 + j * (bw + gap)}" y="${y}" width="${bw}" height="${Math.max(h, 0)}" rx="3"
          style="fill:var(--${key})"><title>${m.label} ${word}: ${fmt(v)}</title></rect>`;
      });
    });
    svg.innerHTML = g;
  }

  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10;
    return step * p;
  }

  function renderMyCats() {
    const box = $('myCats');
    if (!state.customCats.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<span class="muted">Миний ангиллууд:</span>' + state.customCats.map(c =>
      `<span class="chip">${escapeHtml(c.icon + ' ' + c.name)}<button data-cat-del="${c.id}" aria-label="${escapeHtml(c.name)} ангиллыг устгах">×</button></span>`
    ).join('');
  }

  // ---------- Demo data (shown, never saved) ----------
  function buildDemo() {
    const y = today.getFullYear(), m = today.getMonth();
    const transactions = [];
    const day = (k, d) => isoDate(new Date(y, m - k, k === 0 ? Math.min(d, today.getDate()) : d));
    const add = (type, amount, category, k, d, note) =>
      transactions.push({ id: 'demo' + transactions.length, type, amount, category, date: day(k, d), note });
    const save = (goalId, amount, k, d) =>
      transactions.push({ id: 'demo' + transactions.length, type: 'saving', dir: 'in', goalId, amount, date: day(k, d), note: '' });
    for (let k = 0; k < 6; k++) {
      add('income', 2400000 + k * 50000, 'salary', k, 5, 'Сарын цалин');
      if (k % 2 === 0) add('income', 350000, 'business', k, 18, 'Нэмэлт ажил');
      add('expense', 650000, 'housing', k, 3, 'Байрны түрээс');
      add('expense', 95000 + k * 6000, 'utilities', k, 10, 'Цахилгаан, дулаан');
      add('expense', 45000, 'phone', k, 10, 'Утас, интернэт');
      add('expense', 330000 + (k * 37000) % 120000, 'food', k, 8, 'Дэлгүүр');
      add('expense', 85000 + (k * 23000) % 60000, 'cafe', k, 14, 'Найзуудтай хоол');
      add('expense', 120000, 'car', k, 12, 'Шатахуун');
      add('expense', 100000 + (k * 53000) % 200000, 'clothing', k, 15, 'Хувцас');
      add('expense', 25000, 'subs', k, 1, 'Netflix, Spotify');
      add('expense', 60000, 'fun', k, 20, 'Кино');
      save('demo-g1', 300000, k, 6);
      save('demo-g2', 200000, k, 6);
    }
    add('expense', 45000, 'health', 0, 2, 'Эм');
    add('income', 200000, 'gift', 0, 1, 'Төрсөн өдрийн бэлэг');
    const dl = new Date(y, m + 8, 1);
    const goals = [
      { id: 'demo-g1', name: 'Яаралтай тусламжийн сан', icon: '🛡️', target: 5000000, deadline: '' },
      { id: 'demo-g2', name: 'Япон аялал', icon: '✈️', target: 3000000, deadline: `${dl.getFullYear()}-${pad(dl.getMonth() + 1)}` },
    ];
    return { transactions, goals };
  }

  // ---------- Files ----------
  let downloads = null;
  async function offerFile(filename, data, mime) {
    if (hosted) {
      if (!downloads) return toast('Энэ харагдац дээр файл татах боломжгүй');
      try {
        await downloads.save({ filename, data });
      } catch (err) {
        if (err && err.code === 'rate_limited') toast('Түр хүлээгээд дахин оролдоно уу');
        else if (err && err.code !== 'declined') toast('Файл татах боломжгүй байна');
      }
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: mime }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportCsv() {
    if (!state.transactions.length) return toast('Татах өгөгдөл алга');
    const typeName = t => t.type === 'income' ? 'Орлого' : t.type === 'expense' ? 'Зарлага'
      : t.dir === 'out' ? 'Хуримтлалаас авсан' : 'Хуримтлал';
    const rows = [['Огноо', 'Төрөл', 'Ангилал / Зорилго', 'Дүн', 'Тайлбар']];
    [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
      rows.push([t.date, typeName(t), t.type === 'saving' ? getGoal(t.goalId).name : getCat(t.category).name, t.amount, t.note || '']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    offerFile(`sankhuu-${isoDate(today)}.csv`, '﻿' + csv, 'text/csv;charset=utf-8');
  }

  function exportJson() {
    if (!state.transactions.length && !state.goals.length) return toast('Хадгалах өгөгдөл алга');
    offerFile(`sankhuu-backup-${isoDate(today)}.json`, JSON.stringify(state, null, 2), 'application/json');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      let data;
      try { data = JSON.parse(reader.result); } catch (e) { data = null; }
      if (!data || !Array.isArray(data.transactions)) return toast('Файл таарахгүй байна. Энэ сайтаас хадгалсан JSON нөөц сонгоно уу');
      const count = data.transactions.filter(validTx).length;
      if (state.transactions.length || state.goals.length) {
        const ok = await confirmDialog({
          title: 'Нөөцөөс сэргээх үү?',
          text: `Одоогийн ${state.transactions.length} гүйлгээ, ${state.goals.length} зорилгыг нөөцийн өгөгдлөөр солино.`,
          ok: 'Сэргээх',
        });
        if (!ok) return;
      }
      const old = state.transactions;
      applyData(data);
      leaveDemo();
      store.replaceAll(old);
      resetForm(); render();
      toast(`${count} гүйлгээ сэргээгдлээ`);
    };
    reader.readAsText(file);
  }

  // ---------- Events ----------
  function bind() {
    $('txForm').addEventListener('submit', onSubmit);
    $('cancelEdit').addEventListener('click', resetForm);
    document.querySelectorAll('input[name="type"]').forEach(r =>
      r.addEventListener('change', () => fillCategories(currentType())));
    $('category').addEventListener('change', e => {
      if (e.target.value === '__new') addCustomCategory();
      else e.target.dataset.prev = e.target.value;
    });

    $('amount').addEventListener('input', groupDigits);
    $('budgetInput').addEventListener('input', groupDigits);

    $('prevMonth').addEventListener('click', () => shiftMonth(-1));
    $('nextMonth').addEventListener('click', () => shiftMonth(1));

    $('themeToggle').addEventListener('click', () => {
      prefs.theme = currentTheme() === 'dark' ? 'light' : 'dark';
      savePrefs(); applyTheme();
    });

    $('search').addEventListener('input', render);
    $('filterType').addEventListener('change', render);

    $('txList').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.edit) startEdit(btn.dataset.edit);
      if (btn.dataset.del) removeTx(btn.dataset.del);
    });

    $('addGoal').addEventListener('click', () => loaded ? editGoal(null) : toast('Өгөгдөл ачаалж байна'));
    $('goalList').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.goalIn) moveSaving(b.dataset.goalIn, 'in');
      if (b.dataset.goalOut) moveSaving(b.dataset.goalOut, 'out');
      if (b.dataset.goalEdit) editGoal(b.dataset.goalEdit);
      if (b.dataset.goalDel) removeGoal(b.dataset.goalDel);
    });
    $('myCats').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && b.dataset.catDel) removeCustomCategory(b.dataset.catDel);
    });

    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
      activeChart = tab.dataset.chart;
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      $('chartCategory').classList.toggle('hidden', activeChart !== 'category');
      $('chartTrend').classList.toggle('hidden', activeChart !== 'trend');
    }));

    $('editBudget').addEventListener('click', () => {
      $('budgetForm').classList.remove('hidden');
      $('budgetInput').value = state.budget ? state.budget.toLocaleString('en-US') : '';
      $('budgetInput').focus();
    });
    $('budgetCancel').addEventListener('click', () => $('budgetForm').classList.add('hidden'));
    $('budgetForm').addEventListener('submit', e => {
      e.preventDefault();
      if (!loaded) return;
      state.budget = parseAmount($('budgetInput').value);
      $('budgetForm').classList.add('hidden');
      store.saveSettings();
      render();
      toast(state.budget ? 'Төсөв хадгалагдлаа' : 'Төсөв цуцлагдлаа');
    });

    $('hideDemo').addEventListener('click', () => { prefs.demoHidden = true; savePrefs(); render(); });
    $('showDemo').addEventListener('click', () => {
      prefs.demoHidden = false; savePrefs();
      view = { year: today.getFullYear(), month: today.getMonth() };
      render();
    });

    $('exportCsv').addEventListener('click', exportCsv);
    $('exportJson').addEventListener('click', exportJson);
    $('importJson').addEventListener('change', e => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = '';
    });
    $('clearAll').addEventListener('click', async () => {
      if (!state.transactions.length && !state.goals.length) return toast('Устгах өгөгдөл алга');
      const ok = await confirmDialog({
        title: 'Бүх өгөгдлийг устгах уу?',
        text: `${state.transactions.length} гүйлгээ, ${state.goals.length} хуримтлалын зорилго бүрмөсөн устна. Буцаах боломжгүй тул эхлээд нөөц хадгалахыг зөвлөе.`,
        ok: 'Бүгдийг устгах',
      });
      if (!ok) return;
      const old = state.transactions;
      state.transactions = [];
      state.goals = [];
      leaveDemo();
      store.replaceAll(old);
      resetForm(); render();
      toast('Бүх өгөгдөл устгагдлаа');
    });

    document.addEventListener('keydown', e => {
      if (!$('modal').classList.contains('hidden')) return;
      if (e.target.matches('input, select, textarea')) return;
      if (e.key === 'ArrowLeft') shiftMonth(-1);
      if (e.key === 'ArrowRight') shiftMonth(1);
    });
  }

  function shiftMonth(delta) {
    const d = new Date(view.year, view.month + delta, 1);
    view = { year: d.getFullYear(), month: d.getMonth() };
    if (!editingId) resetForm();
    render();
  }

  // ---------- Init ----------
  async function init() {
    applyTheme();
    bind();
    resetForm();
    if (!hosted) {
      store.initLocal();
      fillCategories('expense');
      render();
      return;
    }
    $('themeToggle').classList.add('hidden');
    render(); // loading state
    let cloud = false;
    try { cloud = await store.initCloud(); } catch (e) { cloud = false; }
    downloads = await window.claude.use('downloads').catch(() => null);
    if (!downloads) ['exportCsv', 'exportJson'].forEach(id => $(id).classList.add('hidden'));
    if (cloud) {
      $('storageText').textContent = 'Өгөгдөл таны бүртгэлд нууцаар хадгалагдана: энэ хуудсыг нээсэн хүн бүр зөвхөн өөрийнхөө өгөгдлийг харна.';
    } else {
      store.initLocal();
      $('storageText').textContent = 'Нэвтрээгүй тул өгөгдөл зөвхөн энэ хөтөч дээр хадгалагдана.';
      fillCategories('expense');
      render();
    }
  }

  init();
})();
