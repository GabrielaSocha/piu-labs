import { randomColor, createId } from './helpers.js';

export function initUI(store) {
    const btnAddSquare = document.getElementById('btn-add-square');
    const btnAddCircle = document.getElementById('btn-add-circle');
    const btnRecolorSquares = document.getElementById('btn-recolor-squares');
    const btnRecolorCircles = document.getElementById('btn-recolor-circles');

    const listEl = document.getElementById('shapes-list');

    const countSquaresEl = document.getElementById('count-squares');
    const countCirclesEl = document.getElementById('count-circles');
    const countTotalEl = document.getElementById('count-total');

    btnAddSquare.addEventListener('click', () => {
        store.addShape({
            id: createId(),
            type: 'square',
            color: randomColor(),
        });
    });

    btnAddCircle.addEventListener('click', () => {
        store.addShape({
            id: createId(),
            type: 'circle',
            color: randomColor(),
        });
    });

    btnRecolorSquares.addEventListener('click', () => {
        store.recolorShapesByType('square', randomColor);
    });

    btnRecolorCircles.addEventListener('click', () => {
        store.recolorShapesByType('circle', randomColor);
    });

    listEl.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const shapeEl = target.closest('.shape');
        if (!shapeEl) return;

        const id = shapeEl.dataset.id;
        if (!id) return;

        store.removeShape(id);
    });

    store.subscribe((state, change) => {
        updateCounters(state, { countSquaresEl, countCirclesEl, countTotalEl });

        switch (change.type) {
            case 'init':
                // początkowe renderowanie wszystkich kształtów
                renderAllShapes(state.shapes, listEl);
                break;
            case 'add':
                renderShape(change.shape, listEl);
                break;
            case 'remove':
                removeShapeElement(change.id, listEl);
                break;
            case 'recolor':
                updateColorsFromState(state.shapes, listEl, change.shapeType);
                break;
            default:
                break;
        }
    });
}

function renderAllShapes(shapes, container) {
    container.innerHTML = '';
    shapes.forEach((shape) => renderShape(shape, container));
}

function renderShape(shape, container) {
    const el = document.createElement('div');
    el.classList.add('shape', shape.type);
    el.dataset.id = shape.id;
    el.dataset.type = shape.type;
    el.style.backgroundColor = shape.color;
    container.appendChild(el);
}

function removeShapeElement(id, container) {
    const el = container.querySelector(`.shape[data-id="${id}"]`);
    if (el && el.parentElement === container) {
        container.removeChild(el);
    }
}

function updateColorsFromState(shapes, container, type) {
    const mapById = new Map();
    shapes.forEach((s) => {
        if (s.type === type) {
            mapById.set(s.id, s.color);
        }
    });

    const elements = container.querySelectorAll(`.shape[data-type="${type}"]`);
    elements.forEach((el) => {
        const id = el.dataset.id;
        if (!id) return;
        const color = mapById.get(id);
        if (color) {
            el.style.backgroundColor = color;
        }
    });
}

function updateCounters(
    state,
    { countSquaresEl, countCirclesEl, countTotalEl }
) {
    const shapes = state.shapes;

    const squares = shapes.filter((s) => s.type === 'square').length;
    const circles = shapes.filter((s) => s.type === 'circle').length;
    const total = shapes.length;

    countSquaresEl.textContent = String(squares);
    countCirclesEl.textContent = String(circles);
    countTotalEl.textContent = String(total);
}
