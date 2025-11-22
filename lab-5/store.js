const STORAGE_KEY = 'lab5-shapes-state-v1';

class Store {
    constructor() {
        this.subscribers = [];
        this.state = {
            shapes: [],
        };

        this._loadFromLocalStorage();
    }

    // ---- Publiczne API ----

    getState() {
        return {
            shapes: [...this.state.shapes],
        };
    }

    subscribe(fn) {
        this.subscribers.push(fn);
        fn(this.getState(), { type: 'init' });
        return () => {
            this.subscribers = this.subscribers.filter((s) => s !== fn);
        };
    }

    addShape(shape) {
        this.state = {
            ...this.state,
            shapes: [...this.state.shapes, shape],
        };
        this._commit({ type: 'add', shape });
    }

    removeShape(id) {
        const shape = this.state.shapes.find((s) => s.id === id);
        if (!shape) return;

        this.state = {
            ...this.state,
            shapes: this.state.shapes.filter((s) => s.id !== id),
        };
        this._commit({ type: 'remove', id });
    }

    recolorShapesByType(type, getColorFn) {
        const updatedShapes = this.state.shapes.map((s) =>
            s.type === type ? { ...s, color: getColorFn() } : s
        );
        this.state = {
            ...this.state,
            shapes: updatedShapes,
        };
        this._commit({ type: 'recolor', shapeType: type });
    }

    _commit(change) {
        this._saveToLocalStorage();
        this._notify(change);
    }

    _notify(change) {
        const snapshot = this.getState();
        this.subscribers.forEach((fn) => fn(snapshot, change));
    }

    _loadFromLocalStorage() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.shapes)) {
                this.state = {
                    shapes: parsed.shapes,
                };
            }
        } catch (err) {
            console.warn('Nie udało się odczytać stanu z localStorage:', err);
        }
    }

    _saveToLocalStorage() {
        try {
            const toSave = JSON.stringify(this.state);
            window.localStorage.setItem(STORAGE_KEY, toSave);
        } catch (err) {
            console.warn('Nie udało się zapisać stanu do localStorage:', err);
        }
    }
}

export const store = new Store();
