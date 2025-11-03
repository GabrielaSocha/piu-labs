(function () {
    'use strict';

    const STORAGE_KEY = 'kanbanStateV1';
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const uid = () =>
        'c_' +
        Math.random().toString(36).slice(2, 9) +
        Date.now().toString(36).slice(-4);
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

    const palette = [
        '#503af5',
        '#64c4fa',
        '#0065ff',
        '#ffc53d',
        '#f54c56',
        '#0db4b1',
    ];
    const getColor = () => palette[Math.floor(Math.random() * palette.length)];

    const initialState = () => ({
        columns: { todo: [], doing: [], done: [] },
        sort: { todo: 'asc', doing: 'asc', done: 'asc' },
    });

    function load() {
        try {
            return (
                JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState()
            );
        } catch {
            return initialState();
        }
    }
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    let state = load();

    const columns = {
        todo: { list: $('#list-todo') },
        doing: { list: $('#list-doing') },
        done: { list: $('#list-done') },
    };

    // ===== Budowa karty =====
    function buildCard(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        cardEl.style.background = card.color;

        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.innerHTML = `
      <button class="icon-btn" data-action="move-left"  data-id="${card.id}">←</button>
      <button class="icon-btn" data-action="move-right" data-id="${card.id}">→</button>
      <button class="icon-btn" data-action="recolor"    data-id="${card.id}">🎨</button>
      <button class="icon-btn" data-action="delete"     data-id="${card.id}">×</button>
    `;

        const content = document.createElement('div');
        content.className = 'card-content';
        content.contentEditable = true;
        content.dataset.placeholder = 'Wpisz treść…';
        content.textContent = card.title || '';

        cardEl.append(actions, content);
        return cardEl;
    }

    // ===== Render =====
    function renderColumn(col) {
        const list = columns[col].list;
        list.innerHTML = '';

        const dir = state.sort[col] || 'asc';
        const cards = [...state.columns[col]].sort((a, b) => {
            const dirFactor = dir === 'asc' ? 1 : -1;
            const aEmpty = !a.title.trim();
            const bEmpty = !b.title.trim();

            if (aEmpty && !bEmpty) return 1;
            if (!aEmpty && bEmpty) return -1;
            if (aEmpty && bEmpty) return 0;

            return (
                a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' }) *
                dirFactor
            );
        });

        cards.forEach((card) => list.append(buildCard(card)));

        $(`#count-${col}`).textContent = cards.length;
        $(`[data-col="${col}"] [data-action="sort"]`).textContent =
            dir === 'asc' ? 'Sortuj Z→A' : 'Sortuj A→Z';

        $$('.card', list).forEach((cardEl) => {
            const id = cardEl.dataset.id;
            const found = findCard(id);
            if (!found) return;
            cardEl.querySelector('[data-action="move-left"]').disabled =
                found.col === 'todo';
            cardEl.querySelector('[data-action="move-right"]').disabled =
                found.col === 'done';
        });
    }

    function renderAll() {
        ['todo', 'doing', 'done'].forEach(renderColumn);
        save();
    }

    // ===== Logika =====
    function findCard(id) {
        for (const col of ['todo', 'doing', 'done']) {
            const idx = state.columns[col].findIndex((c) => c.id === id);
            if (idx !== -1) return { col, idx, card: state.columns[col][idx] };
        }
        return null;
    }

    function addCard(col) {
        const card = {
            id: uid(),
            title: '',
            color: getColor(),
            createdAt: Date.now(),
        };
        state.columns[col].push(card);
        renderColumn(col);
        save();
    }

    function deleteCard(id) {
        const f = findCard(id);
        if (!f) return;
        state.columns[f.col].splice(f.idx, 1);
        renderColumn(f.col);
        save();
    }

    function moveCard(id, dir) {
        const order = ['todo', 'doing', 'done'];
        const f = findCard(id);
        if (!f) return;
        const to = clamp(order.indexOf(f.col) + dir, 0, order.length - 1);
        const target = order[to];
        if (target === f.col) return;
        const [c] = state.columns[f.col].splice(f.idx, 1);
        state.columns[target].push(c);
        renderColumn(f.col);
        renderColumn(target);
        save();
    }

    function recolorCard(id) {
        const f = findCard(id);
        if (!f) return;
        f.card.color = getColor();
        const node = document.querySelector(`[data-id="${id}"]`);
        if (node) node.style.background = f.card.color;
        save();
    }

    function recolorColumn(col) {
        const color = getColor();
        state.columns[col] = state.columns[col].map((c) => ({ ...c, color }));
        renderColumn(col);
        save();
    }

    // ===== Zdarzenia =====
    document.querySelector('.board').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const { action, id, col } = btn.dataset;

        switch (action) {
            case 'add':
                addCard(col);
                break;
            case 'delete':
                deleteCard(id);
                break;
            case 'move-left':
                moveCard(id, -1);
                break;
            case 'move-right':
                moveCard(id, +1);
                break;
            case 'recolor':
                recolorCard(id);
                break;
            case 'color-column':
                recolorColumn(col);
                break;
            case 'sort':
                state.sort[col] = state.sort[col] === 'asc' ? 'desc' : 'asc';
                renderColumn(col);
                save();
                break;
        }
    });

    // Zapis treści (bez utraty focusa)
    let saveTimer = null;
    document.querySelector('.board').addEventListener('input', (e) => {
        const contentEl = e.target.closest('.card-content');
        if (!contentEl) return;
        const id = contentEl.closest('.card').dataset.id;
        const f = findCard(id);
        if (!f) return;
        f.card.title = contentEl.textContent.trim();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => save(), 300);
    });

    renderAll();
})();
