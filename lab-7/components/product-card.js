const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host { display:block; }

    .card{
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      overflow: hidden;
      display: grid;
      grid-template-rows: 190px auto;
      min-height: 320px;
    }

    .media{ position:relative; background: rgba(255,255,255,0.04); }
    .media img{
      width: 100%;
      height: 100%;
      object-fit: contain;   /* pokazuje cały produkt */
      display: block;
      background: rgba(255,255,255,0.06); /* delikatne tło pod zdjęciem */
    }


    .promo{
      position: absolute;
      left: 10px;
      top: 10px;

      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.2px;

      padding: 6px 10px;
      border-radius: 999px;

      color: var(--text);
      background: rgba(15, 23, 42, 0.65);              /* ciemne tło */
      border: 1px solid rgba(255, 255, 255, 0.14);     /* delikatna ramka */
      box-shadow: 0 8px 18px rgba(0,0,0,0.35);

      display: none;
      backdrop-filter: blur(8px);
    }

    .promo.show{ display:inline-flex; }

    .content{ padding:12px; display:flex; flex-direction:column; gap:10px; }

    h3{ margin:0; font-size:15px; font-weight:900; letter-spacing:0.2px; line-height:1.2; }

    .row{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; }

    .price{ font-weight:900; color: var(--accent-2); font-size:14px; }

    .muted{ color: var(--muted); font-size:12px; font-weight:700; }

    .chips{ display:flex; flex-wrap:wrap; gap:8px; justify-content:flex-start; }

    ::slotted(ul){
      list-style:none; padding:0; margin:0;
      display:flex; flex-wrap:wrap; gap:8px;
    }

    ::slotted(ul li){
      font-size:12px;
      padding:6px 10px;
      border-radius:999px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }

    .actions{ display:flex; gap:10px; margin-top:auto; }

    button.primary{
      flex:1;
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.4);
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      color: white;
    }
    button.primary:hover{
      background: rgba(99, 102, 241, 0.22);
      border-color: rgba(99, 102, 241, 0.55);
    }
  </style>

  <article class="card">
    <div class="media">
      <img alt="" />
      <div class="promo"><slot name="promo"></slot></div>
    </div>

    <div class="content">
      <div class="row">
        <h3><slot name="name"></slot></h3>
        <div class="price"></div>
      </div>

      <div class="row">
        <div class="muted">Kolory</div>
        <div class="muted">Rozmiary</div>
      </div>

      <div class="row">
        <div class="chips"><slot name="colors"></slot></div>
        <div class="chips"><slot name="sizes"></slot></div>
      </div>

      <div class="actions">
        <button class="primary" id="addBtn" type="button">Do koszyka</button>
      </div>
    </div>
  </article>
`;

export class ProductCard extends HTMLElement {
    static observedAttributes = [
        'pid',
        'name',
        'price',
        'currency',
        'image',
        'promo',
    ];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(tpl.content.cloneNode(true));

        this._product = null;

        this.$img = this.shadowRoot.querySelector('img');
        this.$price = this.shadowRoot.querySelector('.price');
        this.$promo = this.shadowRoot.querySelector('.promo');
        this.$addBtn = this.shadowRoot.querySelector('#addBtn');

        this.$addBtn.addEventListener('click', () => this._emitAddToCart());
    }

    set product(value) {
        this._product = value;
        this._syncFromProduct();
    }
    get product() {
        return this._product ?? this._productFromAttrs();
    }

    connectedCallback() {
        this._updatePromoVisibility();
        this._syncFromAttrs();
    }

    attributeChangedCallback() {
        this._syncFromAttrs();
        this._updatePromoVisibility();
    }

    _syncFromProduct() {
        if (!this._product) return;
        this.setAttribute('pid', this._product.id ?? '');
        this.setAttribute('name', this._product.name ?? '');
        this.setAttribute('price', String(this._product.price ?? ''));
        this.setAttribute('currency', this._product.currency ?? 'PLN');
        this.setAttribute('image', this._product.image ?? '');
        if (this._product.promo)
            this.setAttribute('promo', this._product.promo);
        else this.removeAttribute('promo');

        this._renderBasics(this._product);
    }

    _syncFromAttrs() {
        const p = this._productFromAttrs();
        this._renderBasics(p);
    }

    _productFromAttrs() {
        const pid = this.getAttribute('pid') || '';
        const name = this.getAttribute('name') || '';
        const priceRaw = this.getAttribute('price') || '0';
        const currency = this.getAttribute('currency') || 'PLN';
        const image = this.getAttribute('image') || '';
        const promo = this.getAttribute('promo') || '';

        const price = Number(String(priceRaw).replace(',', '.'));
        return {
            id: pid,
            name,
            price: Number.isFinite(price) ? price : 0,
            currency,
            image,
            promo,
        };
    }

    _renderBasics(p) {
        // obraz
        this.$img.src = p.image || '';
        this.$img.alt = p.name ? `Zdjęcie: ${p.name}` : 'Zdjęcie produktu';

        // cena
        const formatted = this._formatPrice(p.price, p.currency);
        this.$price.textContent = formatted || '';
    }

    _updatePromoVisibility() {
        const hasPromoAttr = Boolean(this.getAttribute('promo'));
        const hasPromoSlot = Boolean(this.querySelector('[slot="promo"]'));
        this.$promo.classList.toggle('show', hasPromoAttr || hasPromoSlot);
    }

    _formatPrice(price, currency) {
        try {
            if (!Number.isFinite(price)) return '';
            const loc = 'pl-PL';
            if (currency === 'PLN') {
                return new Intl.NumberFormat(loc, {
                    style: 'currency',
                    currency: 'PLN',
                }).format(price);
            }
            return `${price.toFixed(2)} ${currency}`;
        } catch {
            return `${price} ${currency ?? ''}`.trim();
        }
    }

    _emitAddToCart() {
        const p = this.product;

        const payload = {
            id: p.id,
            name: p.name,
            price: p.price,
            currency: p.currency ?? 'PLN',
        };

        this.dispatchEvent(
            new CustomEvent('add-to-cart', {
                detail: payload,
                bubbles: true,
                composed: true,
            })
        );
    }
}

customElements.define('product-card', ProductCard);
