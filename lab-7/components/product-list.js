import productsData from "../data.json" with { type: "json" };
import "./product-card.js";
import "./cart-box.js";

const tpl = document.createElement("template");
tpl.innerHTML = `
  <style>
    .shop {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .panel {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    }

    .panel-title {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
    }

    .panel-title h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.2px;
      color: var(--text);
    }

    .badge {
      font-size: 12px;
      color: var(--muted);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 4px 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.03);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    @media (max-width: 900px) {
      .products-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 600px) {
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>

  <section class="shop">
    <div class="panel">
      <div class="panel-title">
        <h2>Produkty</h2>
      </div>
      <div class="products-grid" id="grid"></div>
    </div>

    <div class="panel">
      <cart-box id="cart"></cart-box>
    </div>
  </section>
`;

class ProductList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$grid = this.shadowRoot.querySelector("#grid");
    this.$cart = this.shadowRoot.querySelector("#cart");

    this.addEventListener("add-to-cart", (e) => {
      this.$cart.addItem(e.detail);
    });
  }

  connectedCallback() {
    this._render(productsData);
  }

  _render(products) {
    this.$grid.innerHTML = "";

    for (const p of products) {
      const card = document.createElement("product-card");
      card.product = p;

      const name = document.createElement("span");
      name.slot = "name";
      name.textContent = p.name;
      card.appendChild(name);

      if (p.promo) {
        const promo = document.createElement("span");
        promo.slot = "promo";
        promo.textContent = p.promo;
        card.appendChild(promo);
      }

      if (Array.isArray(p.colors) && p.colors.length) {
        const ul = document.createElement("ul");
        ul.slot = "colors";
        p.colors.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = c;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      if (Array.isArray(p.sizes) && p.sizes.length) {
        const ul = document.createElement("ul");
        ul.slot = "sizes";
        p.sizes.forEach((s) => {
          const li = document.createElement("li");
          li.textContent = s;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      this.$grid.appendChild(card);
    }
  }
}

customElements.define("product-list", ProductList);
