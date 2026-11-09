(() => {
  'use strict';

  // ---------- Config ----------
  const STORAGE_KEY = 'minii-sankhuu:v1';
  const MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар',
    '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'];

  const CATEGORIES = {
    expense: [
      { id: 'food', name: 'Хоол хүнс', icon: '🍜', color: '#f97316' },
      { id: 'transport', name: 'Тээвэр', icon: '🚌', color: '#3b82f6' },
      { id: 'housing', name: 'Орон байр', icon: '🏠', color: '#8b5cf6' },
      { id: 'utilities', name: 'Төлбөр, ашиглалт', icon: '💡', color: '#eab308' },
      { id: 'shopping', name: 'Худалдан авалт', icon: '🛍️', color: '#ec4899' },
      { id: 'health', name: 'Эрүүл мэнд', icon: '💊', color: '#14b8a6' },
      { id: 'education', name: 'Боловсрол', icon: '📚', color: '#6366f1' },
      { id: 'fun', name: 'Зугаа цэнгэл', icon: '🎬', color: '#f43f5e' },
      { id: 'other_e', name: 'Бусад', icon: '📦', color: '#64748b' },
    ],
    income: [
      { id: 'salary', name: 'Цалин', icon: '💼', color: '#12a36b' },
      { id: 'business', name: 'Бизнес', icon: '📈', color: '#0ea5e9' },
      { id: 'gift', name: 'Бэлэг', icon: '🎁', color: '#a855f7' },
      { id: 'invest', name: 'Хөрөнгө оруулалт', icon: '💰', color: '#f59e0b' },
      { id: 'other_i', name: 'Бусад', icon: '➕', color: '#64748b' },
    ],
  };
  const CAT_MAP = Object.fromEntries(
    [...CATEGORIES.expense, ...CATEGORIES.income].map(c => [c.id, c])
  );

  // ---------- State ----------
  const today = new Date();
  let state = load();
  let view = { year: today.getFullYear(), month: today.getMonth() };
  let editingId = null;
  let activeChart = 'category';

  // ---------- Helpers ----------
  const $ = id => document.getElementById(id);
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
  const inMonth = (tx, y, m) => {
    const [ty, tm] = tx.date.split('-').map(Number);
    return ty === y && tm - 1 === m;
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        return { transactions: data.transactions || [], budget: data.budget || 0, theme: data.theme || null };
      }
    } catch (e) { /* storage unavailable */ }
    return { transactions: [], budget: 0, theme: null };
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- Theme ----------
  function applyTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = state.theme || (prefersDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  }

  // ---------- Form ----------
  function currentType() {
    return document.querySelector('input[name="type"]:checked').value;
  }

  function fillCategories(type, selected) {
    $('category').innerHTML = CATEGORIES[type]
      .map(c => `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${c.icon} ${c.name}</option>`)
      .join('');
  }

  function resetForm() {
    editingId = null;
    $('txForm').reset();
    $('typeExpense').checked = true;
    fillCategories('expense');
    const d = (view.year === today.getFullYear() && view.month === today.getMonth())
      ? today : new Date(view.year, view.month, 1);
    $('date').value = isoDate(d);
    $('formTitle').textContent = 'Гүйлгээ нэмэх';
    $('submitBtn').textContent = 'Нэмэх';
    $('cancelEdit').classList.add('hidden');
  }

  function startEdit(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
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
    $('amount').focus();
  }

  function onSubmit(e) {
    e.preventDefault();
    const amount = parseAmount($('amount').value);
    if (amount <= 0) { toast('Дүнгээ зөв оруулна уу'); $('amount').focus(); return; }
    const tx = {
      id: editingId || uid(),
      type: currentType(),
      amount,
      category: $('category').value,
      date: $('date').value,
      note: $('note').value.trim(),
    };
    if (editingId) {
      state.transactions = state.transactions.map(t => t.id === editingId ? tx : t);
      toast('Засвар хадгалагдлаа ✓');
    } else {
      state.transactions.push(tx);
      toast(tx.type === 'income' ? 'Орлого нэмэгдлээ ✓' : 'Зарлага нэмэгдлээ ✓');
    }
    // jump to the transaction's month
    const [y, m] = tx.date.split('-').map(Number);
    view = { year: y, month: m - 1 };
    save();
    resetForm();
    render();
  }

  function removeTx(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
    if (!confirm(`"${tx.note || CAT_MAP[tx.category]?.name}" — ${fmt(tx.amount)} устгах уу?`)) return;
    state.transactions = state.transactions.filter(t => t.id !== id);
    if (editingId === id) resetForm();
    save();
    render();
    toast('Устгагдлаа');
  }

  // ---------- Render ----------
  function render() {
    $('monthLabel').textContent = `${view.year} оны ${MONTHS[view.month]}`;
    const monthTx = state.transactions.filter(t => inMonth(t, view.year, view.month));
    renderSummary(monthTx);
    renderBudget(monthTx);
    renderList(monthTx);
    renderDonut(monthTx);
    renderBars();
  }

  function renderSummary(txs) {
    const inc = txs.filter(t => t.type === 'income');
    const exp = txs.filter(t => t.type === 'expense');
    const sumI = inc.reduce((s, t) => s + t.amount, 0);
    const sumE = exp.reduce((s, t) => s + t.amount, 0);
    const bal = sumI - sumE;
    $('sumIncome').textContent = fmt(sumI);
    $('sumExpense').textContent = fmt(sumE);
    $('sumBalance').textContent = (bal < 0 ? '−' : '') + fmt(Math.abs(bal));
    $('incomeCount').textContent = `${inc.length} гүйлгээ`;
    $('expenseCount').textContent = `${exp.length} гүйлгээ`;
    const rate = sumI > 0 ? Math.round((bal / sumI) * 100) : 0;
    $('savingRate').textContent = `Хэмнэлт: ${rate}%`;
  }

  function renderBudget(txs) {
    const spent = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const bar = $('budgetBar');
    bar.classList.remove('warn', 'over');
    if (!state.budget) {
      bar.style.width = '0';
      $('budgetText').textContent = 'Төсөв тохируулаагүй байна. Сарын зарлагын дээд хязгаараа тогтоогоорой.';
      return;
    }
    const pct = (spent / state.budget) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
    if (pct >= 100) bar.classList.add('over');
    else if (pct >= 80) bar.classList.add('warn');
    const left = state.budget - spent;
    $('budgetText').innerHTML = left >= 0
      ? `<strong>${fmt(spent)}</strong> / ${fmt(state.budget)} зарцуулсан · <strong>${fmt(left)}</strong> үлдсэн (${Math.round(pct)}%)`
      : `⚠️ Төсөв <strong>${fmt(-left)}</strong>-өөр хэтэрсэн (${Math.round(pct)}%)`;
  }

  function renderList(txs) {
    const q = $('search').value.trim().toLowerCase();
    const type = $('filterType').value;
    const list = txs
      .filter(t => type === 'all' || t.type === type)
      .filter(t => !q || (t.note || '').toLowerCase().includes(q) ||
        (CAT_MAP[t.category]?.name || '').toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    const empty = txs.length === 0;
    $('emptyState').classList.toggle('hidden', !empty);
    $('loadDemo').classList.toggle('hidden', state.transactions.length > 0);

    if (!empty && list.length === 0) {
      $('txList').innerHTML = '<li class="empty"><p>Хайлтад тохирох гүйлгээ олдсонгүй.</p></li>';
      return;
    }

    let html = '';
    let lastDate = '';
    for (const t of list) {
      if (t.date !== lastDate) {
        lastDate = t.date;
        const [y, m, d] = t.date.split('-').map(Number);
        const label = t.date === isoDate(today) ? 'Өнөөдөр' : `${m}-р сарын ${d}`;
        html += `<li class="tx-day">${label}</li>`;
      }
      const c = CAT_MAP[t.category] || { name: '—', icon: '•', color: '#888' };
      html += `
        <li class="tx">
          <div class="tx-icon" style="background:${c.color}22">${c.icon}</div>
          <div class="tx-main">
            <div class="tx-title">${escapeHtml(t.note || c.name)}</div>
            <div class="tx-sub">${c.name}</div>
          </div>
          <div class="tx-amt ${t.type}">${t.type === 'income' ? '+' : '−'}${fmt(t.amount)}</div>
          <div class="tx-actions">
            <button data-edit="${t.id}" aria-label="Засах" title="Засах">✏️</button>
            <button data-del="${t.id}" aria-label="Устгах" title="Устгах">🗑️</button>
          </div>
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
    if (!total) {
      svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none"
        style="stroke:var(--surface-2)" stroke-width="${R - r}"/>`;
      $('legend').innerHTML = '<li class="muted">Энэ сард зарлага бүртгэгдээгүй.</li>';
      return;
    }

    const mid = (R + r) / 2, w = R - r, C = 2 * Math.PI * mid;
    let offset = 0;
    const gap = entries.length > 1 ? 2 : 0;
    svg.innerHTML = entries.map(([id, v]) => {
      const len = (v / total) * C;
      const seg = `<circle cx="${cx}" cy="${cy}" r="${mid}" fill="none"
        stroke="${CAT_MAP[id]?.color || '#888'}" stroke-width="${w}"
        stroke-dasharray="${Math.max(len - gap, 0.5)} ${C}"
        stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})">
        <title>${CAT_MAP[id]?.name}: ${fmt(v)}</title></circle>`;
      offset += len;
      return seg;
    }).join('');

    $('legend').innerHTML = entries.map(([id, v]) => {
      const c = CAT_MAP[id] || { name: id, icon: '', color: '#888' };
      return `<li><span class="sw" style="background:${c.color}"></span>
        <span class="name">${c.icon} ${c.name}</span>
        <span class="pct">${Math.round((v / total) * 100)}%</span>
        <span class="amt">${fmt(v)}</span></li>`;
    }).join('');
  }

  function renderBars() {
    const svg = $('bars');
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(view.year, view.month - i, 1);
      const y = d.getFullYear(), m = d.getMonth();
      const txs = state.transactions.filter(t => inMonth(t, y, m));
      months.push({
        label: `${m + 1}-р сар`,
        inc: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        exp: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    const W = 420, H = 240, L = 48, B = 28, T = 12, Rp = 8;
    const max = Math.max(1, ...months.flatMap(m => [m.inc, m.exp]));
    const nice = niceMax(max);
    const plotH = H - T - B, plotW = W - L - Rp;
    const slot = plotW / months.length, bw = Math.min(18, slot / 3.2);
    const yPos = v => T + plotH - (v / nice) * plotH;

    let g = '<g class="axis">';
    for (let i = 0; i <= 4; i++) {
      const v = (nice / 4) * i, y = yPos(v);
      g += `<line x1="${L}" x2="${W - Rp}" y1="${y}" y2="${y}" ${i ? 'stroke-dasharray="3 4"' : ''}/>
            <text x="${L - 8}" y="${y + 4}" text-anchor="end">${fmtShort(v)}</text>`;
    }
    months.forEach((m, i) => {
      const x = L + slot * i + slot / 2;
      g += `<text x="${x}" y="${H - 8}" text-anchor="middle">${m.label}</text>`;
    });
    g += '</g>';

    months.forEach((m, i) => {
      const x = L + slot * i + slot / 2;
      const bar = (v, dx, cls) => {
        const y = yPos(v), h = T + plotH - y;
        return `<rect x="${x + dx}" y="${y}" width="${bw}" height="${Math.max(h, 0)}" rx="4"
          style="fill:var(--${cls})"><title>${m.label} ${cls === 'income' ? 'орлого' : 'зарлага'}: ${fmt(v)}</title></rect>`;
      };
      g += bar(m.inc, -bw - 2, 'income') + bar(m.exp, 2, 'expense');
    });
    svg.innerHTML = g;
  }

  function niceMax(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10;
    return step * p;
  }

  // ---------- Data tools ----------
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function exportCsv() {
    if (!state.transactions.length) return toast('Татах өгөгдөл алга');
    const rows = [['Огноо', 'Төрөл', 'Ангилал', 'Дүн', 'Тайлбар']];
    [...state.transactions].sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
      rows.push([t.date, t.type === 'income' ? 'Орлого' : 'Зарлага',
        CAT_MAP[t.category]?.name || t.category, t.amount, t.note || '']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    download(`sankhuu-${isoDate(today)}.csv`, '﻿' + csv, 'text/csv;charset=utf-8');
  }

  function exportJson() {
    download(`sankhuu-backup-${isoDate(today)}.json`, JSON.stringify(state, null, 2), 'application/json');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.transactions)) throw new Error('bad');
        const valid = data.transactions.filter(t =>
          t && (t.type === 'income' || t.type === 'expense') &&
          Number(t.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(t.date));
        state.transactions = valid.map(t => ({
          id: String(t.id || uid()), type: t.type, amount: Number(t.amount),
          category: CAT_MAP[t.category] ? t.category : (t.type === 'income' ? 'other_i' : 'other_e'),
          date: t.date, note: String(t.note || '').slice(0, 80),
        }));
        state.budget = Number(data.budget) || 0;
        save(); render();
        toast(`${valid.length} гүйлгээ сэргээгдлээ ✓`);
      } catch (e) {
        toast('Файл буруу байна');
      }
    };
    reader.readAsText(file);
  }

  function loadDemo() {
    const y = view.year, m = view.month;
    const isNow = y === today.getFullYear() && m === today.getMonth();
    // current month: keep demo dates on or before today
    const prev = (k, day) => isoDate(new Date(y, m - k, (k === 0 && isNow) ? Math.min(day, today.getDate()) : day));
    const demo = [];
    const add = (type, amount, category, date, note) =>
      demo.push({ id: uid(), type, amount, category, date, note });
    for (let k = 0; k < 6; k++) {
      add('income', 2400000 + k * 50000, 'salary', prev(k, 5), 'Сарын цалин');
      if (k % 2 === 0) add('income', 350000, 'business', prev(k, 18), 'Нэмэлт ажил');
      add('expense', 650000, 'housing', prev(k, 3), 'Байрны түрээс');
      add('expense', 120000 + k * 8000, 'utilities', prev(k, 10), 'Цахилгаан, интернэт');
      add('expense', 380000 + (k * 37000) % 120000, 'food', prev(k, 8), 'Дэлгүүр');
      add('expense', 95000, 'transport', prev(k, 12), 'Такси, автобус');
      add('expense', 150000 + (k * 53000) % 200000, 'shopping', prev(k, 15), 'Хувцас');
      add('expense', 60000, 'fun', prev(k, 20), 'Кино');
    }
    add('expense', 45000, 'health', prev(0, 2), 'Эм');
    add('expense', 18000, 'food', prev(0, 1), 'Өдрийн хоол');
    add('income', 200000, 'gift', prev(0, 1), 'Төрсөн өдрийн бэлэг');
    state.transactions = demo;
    if (!state.budget) state.budget = 1800000;
    save(); render();
    toast('Жишээ өгөгдөл ачааллаа');
  }

  // ---------- Events ----------
  function bind() {
    $('txForm').addEventListener('submit', onSubmit);
    $('cancelEdit').addEventListener('click', resetForm);
    document.querySelectorAll('input[name="type"]').forEach(r =>
      r.addEventListener('change', () => fillCategories(currentType())));

    $('amount').addEventListener('input', e => {
      const n = parseAmount(e.target.value);
      e.target.value = n ? Math.floor(n).toLocaleString('en-US') : '';
    });

    $('prevMonth').addEventListener('click', () => shiftMonth(-1));
    $('nextMonth').addEventListener('click', () => shiftMonth(1));

    $('themeToggle').addEventListener('click', () => {
      state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      save(); applyTheme();
    });

    $('search').addEventListener('input', render);
    $('filterType').addEventListener('change', render);

    $('txList').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.edit) startEdit(btn.dataset.edit);
      if (btn.dataset.del) removeTx(btn.dataset.del);
    });

    document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
      activeChart = tab.dataset.chart;
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      $('chartCategory').classList.toggle('hidden', activeChart !== 'category');
      $('chartTrend').classList.toggle('hidden', activeChart !== 'trend');
    }));

    $('editBudget').addEventListener('click', () => {
      const v = prompt('Сарын зарлагын төсөв (₮):', state.budget ? String(state.budget) : '');
      if (v === null) return;
      state.budget = parseAmount(v);
      save(); render();
      toast(state.budget ? 'Төсөв хадгалагдлаа ✓' : 'Төсөв цуцлагдлаа');
    });

    $('exportCsv').addEventListener('click', exportCsv);
    $('exportJson').addEventListener('click', exportJson);
    $('importJson').addEventListener('change', e => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = '';
    });
    $('clearAll').addEventListener('click', () => {
      if (!state.transactions.length) return toast('Устгах өгөгдөл алга');
      if (!confirm('Бүх гүйлгээг устгах уу? Энэ үйлдлийг буцаах боломжгүй.')) return;
      state.transactions = [];
      save(); resetForm(); render();
      toast('Бүх өгөгдөл устгагдлаа');
    });
    $('loadDemo').addEventListener('click', loadDemo);

    document.addEventListener('keydown', e => {
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
  applyTheme();
  bind();
  resetForm();
  render();
})();
