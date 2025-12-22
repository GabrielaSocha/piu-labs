const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host { display:block; }

    .wrap{
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      padding: 12px 14px;
    }

    .title{
      display:flex;
      align-items:baseline;
      justify-content:space-between;
      gap:10px;
      margin-bottom: 10px;
    }

    .title h2{
      margin:0;
      font-size: 16px;
      font-weight: 900;
    }

    .badge{
      font-size:12px;
      color: var(--muted);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.03);
    }

    ul{
      list-style:none;
      padding:0;
      margin:0;
      display:flex;
      flex-direction:column;
      gap:10px;
      max-height: 320px;
      overflow-y:auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.4) rgba(255,255,255,0.1);
    }

    ul::-webkit-scrollbar{ width:10px; }
    ul::-webkit-scrollbar-track{
      background: rgba(255,255,255,0.08);
      border-radius: 8px;
    }
    ul::-webkit-scrollbar-thumb{
      background: rgba(255,255,255,0.38);
      border-radius: 8px;
    }

    li{
      background: rgba(255,255,255,0.04);
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }

    .left{
      display:flex;
      flex-direction:column;
      gap:3px;
      min-width: 0;
    }

    .name{
      font-weight: 900;
      font-size: 13px;
      line-height: 1.2;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      max-width: 220px;
    }

    .price{
      font-size: 12px;
      font-weight: 800;
      color: var(--accent-2);
    }

    button.remove{
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      color: white;
    }
    button.remove:hover{
      background: rgba(239, 68, 68, 0.22);
      border-color: rgba(239, 68, 68, 0.55);
    }

    .footer{
      margin-top: 12px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .sum{
      font-weight: 900;
    }

    .muted{
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .empty{
      color: var(--muted);
      font-size: 13px;
      padding: 10px 0;
      text-align: center;
    }

    #clearBtn{
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      color: white;
    }
    }
  </style>

  <div class="wrap">
    <div class="title">
      <h2>Koszyk</h2>
      <span class="badge" id="count">0 produktów</span>
    </div>

    <div id="empty" class="empty">Koszyk jest pusty.</div>
    <ul id="list"></ul>

    <div class="footer">
      <div>
        <div class="muted">Suma</div>
        <div class="sum" id="sum">0,00 zł</div>
      </div>
      <button id="clearBtn" type="button">Wyczyść</button>
    </div>
  </div>
`;

export class CartBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(tpl.content.cloneNode(true));

        this.items = []; // bez ilości sztuk – zgodnie z wymaganiem

        this.$list = this.shadowRoot.querySelector('#list');
        this.$sum = this.shadowRoot.querySelector('#sum');
        this.$count = this.shadowRoot.querySelector('#count');
        this.$empty = this.shadowRoot.querySelector('#empty');
        this.$clearBtn = this.shadowRoot.querySelector('#clearBtn');

        this.$clearBtn.addEventListener('click', () => {
            this.items = [];
            this._render();
        });
    }

    addItem(item) {
        this.items = [...this.items, item];
        this._render();
    }

    removeItemByIndex(index) {
        this.items = this.items.filter((_, i) => i !== index);
        this._render();
    }

    _render() {
        const count = this.items.length;
        this.$count.textContent = `${count} ${
            count === 1 ? 'produkt' : count < 5 ? 'produkty' : 'produktów'
        }`;

        this.$list.innerHTML = '';
        this.$empty.style.display = count === 0 ? 'block' : 'none';

        this.items.forEach((it, idx) => {
            const li = document.createElement('li');

            const left = document.createElement('div');
            left.className = 'left';

            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = it.name ?? 'Produkt';

            const price = document.createElement('div');
            price.className = 'price';
            price.textContent = this._formatPrice(
                it.price ?? 0,
                it.currency ?? 'PLN'
            );

            left.appendChild(name);
            left.appendChild(price);

            const btn = document.createElement('button');
            btn.className = 'remove';
            btn.type = 'button';
            btn.textContent = 'Usuń';
            btn.addEventListener('click', () => this.removeItemByIndex(idx));

            li.appendChild(left);
            li.appendChild(btn);
            this.$list.appendChild(li);
        });

        const sum = this.items.reduce(
            (acc, it) => acc + (Number(it.price) || 0),
            0
        );
        this.$sum.textContent = this._formatPrice(sum, 'PLN');
    }

    _formatPrice(price, currency) {
        try {
            const loc = 'pl-PL';
            if (currency === 'PLN') {
                return new Intl.NumberFormat(loc, {
                    style: 'currency',
                    currency: 'PLN',
                }).format(price);
            }
            return `${price.toFixed(2)} ${currency}`;
        } catch {
            return `${price} ${currency}`.trim();
        }
    }
}

customElements.define('cart-box', CartBox);
