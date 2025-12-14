const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;

      /* fallbacki */
      --bg: #0f172a;
      --panel: #111827;
      --panel-2: #0b1022;
      --muted: #94a3b8;
      --text: #e5e7eb;
      --accent: #6366f1;
      --danger: #ef4444;
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .card {
      width: 320px;
      background: linear-gradient(180deg, var(--panel), var(--panel-2));
      border-radius: 20px;
      box-shadow: var(--shadow);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      color: var(--text);
      display: flex;
      flex-direction: column;
    }
    .media {
      height: 220px;          
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    ::slotted([slot="image"]) {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;        
      display: block;
    }

    .promo {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 2;
      background: #0b1022;
      border: 1px solid rgba(255,255,255,0.18);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.3px;
      display: none;
    }

    .content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
    }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
    }

    .name {
      font-size: 16px;
      font-weight: 800;
      line-height: 1.2;
    }

    .price {
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
    }

    details.dropdown {
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      border-radius: 12px;
      overflow: hidden;
    }

    summary {
      list-style: none;
      cursor: pointer;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::after {
      content: "▾";
      opacity: 0.7;
      transition: transform 0.15s ease;
    }

    details[open] summary::after {
      transform: rotate(-180deg);
    }

    .slotWrap {
      padding: 10px 12px 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: grid;
      gap: 8px;
    }

    .emptyChoice {
      border: 1px dashed rgba(255,255,255,0.22);
      background: rgba(255,255,255,0.04);
      color: var(--muted);
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
    }

    .footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    button {
      border: 1px solid rgba(99, 102, 241, 0.4);
      background: rgba(99, 102, 241, 0.15);
      color: var(--text);
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.06s ease;
    }

    button:hover {
      background: rgba(99, 102, 241, 0.25);
    }

    button:active {
      transform: translateY(1px);
    }

    .hint {
      font-size: 12px;
      color: var(--muted);
    }
  </style>

  <div class="card">
    <div class="media">
      <div class="promo"><slot name="promo"></slot></div>
      <slot name="image"></slot>
    </div>

    <div class="content">
      <div class="top">
        <div class="name"><slot name="name"></slot></div>
        <div class="price"><slot name="price"></slot></div>
      </div>

      <details class="dropdown">
        <summary>Kolory</summary>
        <div class="slotWrap">
          <slot name="colors">
            <div class="emptyChoice">Jeden kolor</div>
          </slot>
        </div>
      </details>

      <details class="dropdown">
        <summary>Rozmiary</summary>
        <div class="slotWrap">
          <slot name="sizes">
            <div class="emptyChoice">Jeden rozmiar</div>
          </slot>
        </div>
      </details>

      <div class="footer">
        <button type="button">Do koszyka</button>
      </div>
    </div>
  </div>
`;

class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.promoBox = this.shadowRoot.querySelector('.promo');
        this.promoSlot = this.shadowRoot.querySelector('slot[name="promo"]');
        this.button = this.shadowRoot.querySelector('button');
    }

    connectedCallback() {
        const updatePromo = () => {
            const hasPromo = this.promoSlot
                .assignedNodes({ flatten: true })
                .some((n) =>
                    n.nodeType === Node.TEXT_NODE ? n.textContent.trim() : true
                );

            this.promoBox.style.display = hasPromo ? 'inline-flex' : 'none';
        };

        this.promoSlot.addEventListener('slotchange', updatePromo);
        updatePromo();
    }
}

customElements.define('product-card', ProductCard);
export default ProductCard;
