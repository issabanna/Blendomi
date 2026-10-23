import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpLeft,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Search,
  ShoppingBag,
  Package,
  Store,
  MapPin,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Truck,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  Wheat,
  Milk,
  CupSoda,
  Sparkles,
  Cookie,
  Grid2X2,
  Sun,
  Menu,
  ClipboardList,
  CheckCircle2,
  Globe,
  Box,
  Trash2,
  Leaf,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  suppliers,
  initialProducts,
  categories,
  cities,
  statusKeys,
} from "./data";
import { copy } from "./i18n";
import { ProductArt, MarketArt } from "./Art";
import "./style.css";
const icons = {
  grid: Grid2X2,
  wheat: Wheat,
  milk: Milk,
  cup: CupSoda,
  sparkles: Sparkles,
  cookie: Cookie,
  sun: Sun,
};
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem("wholesale-v1-" + key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function useSaved(key, fallback) {
  const [value, setValue] = useState(() => read(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem("wholesale-v1-" + key, JSON.stringify(value));
    } catch {
      /* Browser storage may be unavailable. */
    }
  }, [key, value]);
  return [value, setValue];
}
const defaultProfile = {
  shop: "",
  name: "",
  phone: "",
  city: "amman",
  address: "",
};
function App() {
  const [lang, setLang] = useSaved("language", "ar"),
    [page, setPage] = useState("discover"),
    [selected, setSelected] = useState(null),
    [category, setCategory] = useState("all"),
    [query, setQuery] = useState(""),
    [city, setCity] = useSaved("city", "amman"),
    [products, setProducts] = useSaved("products", initialProducts),
    [cart, setCart] = useSaved("cart", { supplier: null, items: [] }),
    [orders, setOrders] = useSaved("orders", []),
    [profile, setProfile] = useSaved("profile", defaultProfile),
    [sort, setSort] = useState("recommended"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [portalSupplier, setPortalSupplier] = useState("nour"),
    [portalTab, setPortalTab] = useState("orders");
  const toastTimer = useRef();
  const ar = lang === "ar",
    t = copy[lang],
    name = (o) => o?.[ar ? "ar" : "en"] || "",
    Arrow = ar ? ArrowLeft : ArrowRight,
    Diagonal = ar ? ArrowUpLeft : ArrowUpRight;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? "rtl" : "ltr";
    document.title = ar
      ? "مهند | الجملة، بكل بساطة"
      : "Mohannad | Wholesale, made simple";
  }, [lang, ar]);
  const money = (n) =>
    new Intl.NumberFormat(ar ? "ar-JO" : "en-JO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) +
    " " +
    t.currency;
  const num = (n) => new Intl.NumberFormat(ar ? "ar-JO" : "en-JO").format(n);
  const date = (d) =>
    new Intl.DateTimeFormat(ar ? "ar-JO" : "en-JO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Amman",
    }).format(new Date(d));
  function notify(text) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3600);
  }
  function go(p) {
    setPage(p);
    setSelected(null);
    setCategory("all");
    setQuery("");
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function catalog(s) {
    setSelected(s.id);
    setPage("catalog");
    setQuery("");
    setCategory("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const cartSupplier = suppliers.find((s) => s.id === cart.supplier),
    cartLines = cart.items
      .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
      .filter((i) => i.product),
    subtotal =
      Math.round(
        cartLines.reduce((n, i) => n + i.qty * i.product.price, 0) * 100,
      ) / 100,
    deliveryFee = cartSupplier
      ? subtotal >= cartSupplier.freeAt
        ? 0
        : cartSupplier.fee
      : 0,
    total = subtotal + deliveryFee,
    cartCount = cart.items.reduce((n, i) => n + i.qty, 0);
  const validCart =
    cartLines.length > 0 &&
    cartLines.length === cart.items.length &&
    cartLines.every(
      (i) =>
        Number.isInteger(i.qty) &&
        i.qty >= i.product.min &&
        i.qty <= i.product.stock,
    ) &&
    cartSupplier &&
    subtotal >= cartSupplier.min;
  function add(p, replace = false) {
    if (p.stock < p.min) {
      notify(t.outOfStock);
      return;
    }
    if (
      cart.supplier &&
      cart.supplier !== p.supplier &&
      cart.items.length &&
      !replace
    ) {
      setModal({ type: "switch", product: p });
      return;
    }
    if (replace || cart.supplier !== p.supplier) {
      setCart({ supplier: p.supplier, items: [{ id: p.id, qty: p.min }] });
    } else {
      const old = cart.items.find((i) => i.id === p.id);
      if (old && old.qty + 1 > p.stock) {
        notify(t.stockLimit);
        return;
      }
      setCart({
        ...cart,
        items: old
          ? cart.items.map((i) =>
              i.id === p.id ? { ...i, qty: i.qty + 1 } : i,
            )
          : [...cart.items, { id: p.id, qty: p.min }],
      });
    }
    notify(t.added);
  }
  function changeQty(id, delta) {
    const p = products.find((p) => p.id === id),
      line = cart.items.find((i) => i.id === id);
    const qty = line.qty + delta;
    if (qty < p.min) return;
    if (qty > p.stock) {
      notify(t.stockLimit);
      return;
    }
    setCart({
      ...cart,
      items: cart.items.map((i) => (i.id === id ? { ...i, qty } : i)),
    });
  }
  function remove(id) {
    const items = cart.items.filter((i) => i.id !== id);
    setCart({ supplier: items.length ? cart.supplier : null, items });
  }
  function checkout() {
    if (!validCart) {
      notify(subtotal < (cartSupplier?.min || 0) ? t.minNotMet : t.cartChanged);
      return;
    }
    if (!cartSupplier.cities.includes(city)) {
      notify(t.deliveryError);
      return;
    }
    setModal(null);
    setPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function submitOrder(form) {
    if (!validCart) {
      notify(t.cartChanged);
      return false;
    }
    if (!cartSupplier.cities.includes(form.city)) {
      notify(t.deliveryError);
      return false;
    }
    const normalized = form.phone.replace(/[\s()-]/g, "");
    if (!/^(?:\+962|00962|0)7[789]\d{7}$/.test(normalized)) {
      notify(t.phoneError);
      return false;
    }
    const order = {
      id: "BL-" + Date.now().toString(36).toUpperCase(),
      created: new Date().toISOString(),
      supplier: cartSupplier.id,
      status: "submitted",
      items: cartLines.map((i) => ({
        id: i.id,
        qty: i.qty,
        price: i.product.price,
        ar: i.product.ar,
        en: i.product.en,
        packAr: i.product.packAr,
        packEn: i.product.packEn,
      })),
      subtotal,
      deliveryFee,
      total,
      customer: { ...form, phone: normalized },
      history: [{ status: "submitted", at: new Date().toISOString() }],
    };
    setOrders([order, ...orders]);
    setProducts(
      products.map((p) => {
        const line = cart.items.find((i) => i.id === p.id);
        return line ? { ...p, stock: p.stock - line.qty } : p;
      }),
    );
    setProfile({ ...form, notes: undefined });
    setCart({ supplier: null, items: [] });
    setPage("orders");
    setModal({ type: "success", order });
    return true;
  }
  function updateStatus(id, status) {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === "cancelled" || order.status === "delivered")
      return;
    if (status === "cancelled") {
      setProducts(
        products.map((p) => {
          const item = order.items.find((i) => i.id === p.id);
          return item ? { ...p, stock: p.stock + item.qty } : p;
        }),
      );
    }
    setOrders(
      orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              history: [...o.history, { status, at: new Date().toISOString() }],
            }
          : o,
      ),
    );
    notify(status === "cancelled" ? t.orderCancelled : t.confirmStatus);
    if (status === "cancelled") setModal(null);
  }
  function reorder(order, force = false) {
    if (cart.items.length && !force) {
      setModal({ type: "reorder", order });
      return;
    }
    const items = order.items
      .map((i) => {
        const p = products.find((p) => p.id === i.id);
        return p && p.stock >= p.min
          ? { id: i.id, qty: Math.max(p.min, Math.min(i.qty, p.stock)) }
          : null;
      })
      .filter(Boolean);
    if (!items.length) {
      notify(t.outOfStock);
      return;
    }
    setCart({ supplier: order.supplier, items });
    setModal({ type: "cart" });
    notify(t.cartChanged);
  }
  let filtered = products.filter(
    (p) =>
      (!selected || p.supplier === selected) &&
      (category === "all" || p.category === category) &&
      `${p.ar} ${p.en} ${p.brandAr} ${p.brandEn} ${name(suppliers.find((s) => s.id === p.supplier))}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort !== "recommended")
    filtered = [...filtered].sort((a, b) =>
      sort === "priceLow" ? a.price - b.price : b.price - a.price,
    );
  const visibleSuppliers = suppliers.filter(
    (s) =>
      (category === "all" || s.category.includes(category)) &&
      (s.ar + " " + s.en + " " + s.descriptionAr + " " + s.descriptionEn)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selectedSupplier = suppliers.find((s) => s.id === selected);
  const categoryPicker = (compact) => (
    <div className={compact ? "category-pills" : "category-grid"}>
      {categories.map((c) => {
        const Icon = icons[c.icon];
        return (
          <button
            key={c.id}
            className={category === c.id ? "active" : ""}
            onClick={() => setCategory(c.id)}
          >
            <span>
              <Icon size={compact ? 16 : 23} />
            </span>
            <b>{name(c)}</b>
            {!compact && (
              <small>
                {num(
                  c.id === "all"
                    ? products.length
                    : products.filter((p) => p.category === c.id).length,
                )}{" "}
                {ar ? "منتجات" : "products"}
              </small>
            )}
          </button>
        );
      })}
    </div>
  );
  function SupplierCard({ s }) {
    const Icon = icons[s.symbol],
      available = s.cities.includes(city);
    return (
      <article className="supplier-card">
        <div className="supplier-card-top">
          <div
            className="supplier-logo"
            style={{ background: s.color, color: s.ink }}
          >
            <Icon size={30} strokeWidth={1.5} />
            <span>{ar ? s.shortAr : s.shortEn}</span>
          </div>
          <span className={available ? "coverage" : "coverage no-coverage"}>
            <span />
            {available ? t.available : t.unavailable}
          </span>
          <button
            className="round-arrow"
            aria-label={t.viewCatalog + " " + name(s)}
            onClick={() => catalog(s)}
          >
            <Diagonal size={20} />
          </button>
        </div>
        <span className="supplier-category">
          {s.category
            .map((id) => name(categories.find((c) => c.id === id)))
            .join(" · ")}
        </span>
        <h3>{name(s)}</h3>
        <p>{s[ar ? "descriptionAr" : "descriptionEn"]}</p>
        <div className="supplier-facts">
          <span>
            <Package size={14} />
            {t.minOrder}
            <b>{money(s.min)}</b>
          </span>
          <span>
            <Truck size={14} />
            {t.delivery}
            <b>{s[ar ? "deliveryAr" : "deliveryEn"]}</b>
          </span>
        </div>
        <button className="catalog-link" onClick={() => catalog(s)}>
          {t.viewCatalog}
          <Arrow size={16} />
        </button>
      </article>
    );
  }
  function ProductCard({ p }) {
    const s = suppliers.find((s) => s.id === p.supplier),
      line = cart.items.find((i) => i.id === p.id);
    return (
      <article className="product-card">
        <div className={"product-visual visual-" + p.art}>
          {p.tagAr && (
            <span className="product-tag">{p[ar ? "tagAr" : "tagEn"]}</span>
          )}
          <ProductArt product={p} />
          <button
            className="product-quick"
            aria-label={t.add + " " + name(p)}
            disabled={p.stock < p.min}
            onClick={() => add(p)}
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="product-info">
          <button className="product-supplier" onClick={() => catalog(s)}>
            {name(s)}
            <Diagonal size={10} />
          </button>
          <h3>{name(p)}</h3>
          <p>{p[ar ? "packAr" : "packEn"]}</p>
          <div className="product-price">
            <strong>{money(p.price)}</strong>
            <small>{t.perCase}</small>
          </div>
          <div className="product-bottom">
            <span>
              {p.stock < p.min ? t.outOfStock : t.minQty + ": " + num(p.min)}
            </span>
            <button
              className={line ? "in-cart" : ""}
              disabled={p.stock < p.min}
              aria-label={t.add + " " + name(p)}
              onClick={() => add(p)}
            >
              {line ? (
                <>
                  <Check size={13} />
                  {num(line.qty)}
                </>
              ) : (
                <>
                  <Plus size={13} />
                  {t.add}
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  }
  function CartSummary({ button = true }) {
    return (
      <div className="cart-summary">
        <div>
          <span>{t.subtotal}</span>
          <b>{money(subtotal)}</b>
        </div>
        <div>
          <span>{t.deliveryFee}</span>
          <b>{deliveryFee ? money(deliveryFee) : t.free}</b>
        </div>
        <div className="summary-total">
          <span>{t.total}</span>
          <strong>{money(total)}</strong>
        </div>
        {cartSupplier && subtotal < cartSupplier.min && (
          <p className="cart-warning">
            {money(cartSupplier.min - subtotal)} {t.remaining}
          </p>
        )}
        {cartSupplier && !cartSupplier.cities.includes(city) && (
          <p className="cart-warning">{t.deliveryError}</p>
        )}
        {button && (
          <button
            className="primary full"
            disabled={!validCart || !cartSupplier?.cities.includes(city)}
            onClick={checkout}
          >
            {t.checkout}
            <Arrow size={17} />
          </button>
        )}
        <small className="estimate-note">{t.deliveryNote}</small>
      </div>
    );
  }
  function OrderCard({ order, portal = false }) {
    const s = suppliers.find((s) => s.id === order.supplier);
    const next = statusKeys[statusKeys.indexOf(order.status) + 1],
      action = {
        confirmed: t.confirm,
        preparing: t.prepare,
        out: t.dispatch,
        delivered: t.complete,
      };
    return (
      <article className="order-card">
        <div className="order-top">
          <div>
            <span className="overline" dir="ltr">
              {order.id}
            </span>
            <h3>{portal ? order.customer.shop : name(s)}</h3>
            <small>
              {date(order.created)} · {num(order.items.length)} {t.items}
            </small>
          </div>
          <span className={"status status-" + order.status}>
            {t[order.status]}
          </span>
        </div>
        <div className="order-preview">
          {order.items.map((i) => (
            <span key={i.id}>
              {name(i)} <b>×{num(i.qty)}</b>
            </span>
          ))}
        </div>
        <div className="order-bottom">
          <strong>{money(order.total)}</strong>
          <button
            className="text-button"
            onClick={() => setModal({ type: "order", id: order.id, portal })}
          >
            {t.details}
            <Arrow size={14} />
          </button>
          {portal ? (
            next &&
            order.status !== "cancelled" && (
              <button
                className="primary small"
                onClick={() => updateStatus(order.id, next)}
              >
                {action[next]}
                <Check size={14} />
              </button>
            )
          ) : (
            <button className="secondary small" onClick={() => reorder(order)}>
              {t.reorder}
              <Plus size={14} />
            </button>
          )}
        </div>
      </article>
    );
  }
  return (
    <>
      <div className="demo-strip">
        <span>{t.demo}</span>
        <p>{t.demoText}</p>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => go("discover")}
            aria-label="Mohannad home"
          >
            <span className="brand-symbol">
              <Box size={25} strokeWidth={1.7} />
            </span>
            <span>
              {t.brand}
              <i>.</i>
              <small>{t.tagline}</small>
            </span>
          </button>
          <nav className={menu ? "main-nav open" : "main-nav"}>
            {[
              ["discover", t.discover],
              ["products", t.products],
              ["orders", t.orders],
            ].map(([id, label]) => (
              <button
                className={
                  page === id || (id === "discover" && page === "catalog")
                    ? "active"
                    : ""
                }
                key={id}
                onClick={() => go(id)}
              >
                {label}
                {id === "orders" && orders.length > 0 && (
                  <span className="nav-count">{num(orders.length)}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="language"
              onClick={() => setLang(ar ? "en" : "ar")}
            >
              <Globe size={15} />
              {t.language}
            </button>
            <button
              className="cart-button"
              onClick={() => setModal({ type: "cart" })}
            >
              <ShoppingBag size={19} />
              <span>{t.cart}</span>
              {cartCount > 0 && <b>{num(cartCount)}</b>}
            </button>
            <button
              className="menu-button"
              aria-label="Menu"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      <div className="utility-bar">
        <div className="utility-inner">
          <button
            className="location-select"
            onClick={() => setModal({ type: "city" })}
          >
            <MapPin size={15} />
            <span>
              {t.location}
              <b>{name(cities.find((c) => c.id === city))}</b>
            </span>
            <ChevronDown size={13} />
          </button>
          <span className="utility-note">
            <span className="online-dot" />
            {t.approval}
          </span>
          <div className="shop-actions">
            <button onClick={() => setModal({ type: "profile" })}>
              <Store size={15} />
              {profile.shop || t.shop}
              <ChevronDown size={12} />
            </button>
            <span className="utility-divider" />
            <button onClick={() => go("portal")}>
              {t.supplierPortal}
              <Diagonal size={13} />
            </button>
          </div>
        </div>
      </div>
      <main className="container">
        {page === "discover" && (
          <>
            {!query && category === "all" && (
              <>
                <section className="hero">
                  <div className="hero-copy">
                    <span className="hero-label">
                      <span />
                      {t.heroLabel}
                    </span>
                    <h1>
                      {t.heroTitle.split("\n").map((line, i) => (
                        <React.Fragment key={line}>
                          {i > 0 && <br />}
                          {i === 1 ? <em>{line}</em> : line}
                        </React.Fragment>
                      ))}
                    </h1>
                    <p>{t.heroText}</p>
                    <div className="hero-buttons">
                      <button
                        className="primary"
                        onClick={() =>
                          document
                            .getElementById("suppliers")
                            .scrollIntoView({ behavior: "smooth" })
                        }
                      >
                        {t.browse}
                        <Arrow size={17} />
                      </button>
                      <button
                        className="hero-how"
                        onClick={() => setModal({ type: "how" })}
                      >
                        {t.how}
                        <span>
                          <Diagonal size={12} />
                        </span>
                      </button>
                    </div>
                    <div className="hero-local">
                      <span className="jordan-flag">🇯🇴</span>
                      {t.local}
                    </div>
                  </div>
                  <MarketArt products={initialProducts} ar={ar} />
                  <span className="hero-index">01 / WHOLESALE, REIMAGINED</span>
                </section>
                <section className="benefits">
                  {[
                    [ShieldCheck, t.benefit1, t.benefit1sub],
                    [Clock, t.benefit2, t.benefit2sub],
                    [Truck, t.benefit3, t.benefit3sub],
                  ].map(([Icon, title, sub]) => (
                    <div key={title}>
                      <span>
                        <Icon size={23} strokeWidth={1.5} />
                      </span>
                      <div>
                        <h3>{title}</h3>
                        <p>{sub}</p>
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
            <section className="category-section">
              <div className="section-heading">
                <div>
                  <span className="overline">{t.welcome}</span>
                  <h2>{t.categories}</h2>
                  <p>{t.categoriesSub}</p>
                </div>
                <span className="heading-decoration">✳</span>
              </div>
              {categoryPicker(false)}
            </section>
            <section id="suppliers" className="supplier-section">
              <div className="section-heading">
                <div>
                  <h2>{t.suppliersTitle}</h2>
                  <p>{t.suppliersSub}</p>
                </div>
                <span className="count-label">
                  {num(visibleSuppliers.length)} {ar ? "موردين" : "SUPPLIERS"}
                </span>
              </div>
              <div className="filter-bar">
                <label className="search-field">
                  <Search size={18} />
                  <input
                    placeholder={t.search}
                    aria-label={t.search}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      aria-label={t.clearFilters}
                      onClick={() => setQuery("")}
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>
                <button
                  className="filter-location"
                  onClick={() => setModal({ type: "city" })}
                >
                  <SlidersHorizontal size={16} />
                  {name(cities.find((c) => c.id === city))}
                  <ChevronDown size={13} />
                </button>
              </div>
              <div className="supplier-grid">
                {visibleSuppliers.map((s) => (
                  <SupplierCard key={s.id} s={s} />
                ))}
              </div>
              {!visibleSuppliers.length && (
                <Empty
                  icon={Search}
                  title={t.emptyResults}
                  action={t.clearFilters}
                  onAction={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                />
              )}
            </section>
            <section className="featured-section">
              <div className="section-heading">
                <div>
                  <h2>{t.featured}</h2>
                  <p>{t.featuredSub}</p>
                </div>
                <button className="text-button" onClick={() => go("products")}>
                  {t.showAllProducts}
                  <Arrow size={16} />
                </button>
              </div>
              <div className="product-grid">
                {filtered.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </section>
            <section className="supplier-cta">
              <div className="cta-icon">
                <Store size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h2>{t.joinSupply}</h2>
                <p>{t.joinSupplySub}</p>
              </div>
              <button className="secondary" onClick={() => go("portal")}>
                {t.openPortal}
                <Diagonal size={17} />
              </button>
            </section>
          </>
        )}
        {(page === "products" || page === "catalog") && (
          <>
            <div className="page-intro">
              {selectedSupplier ? (
                <>
                  <button className="back-link" onClick={() => go("discover")}>
                    <Arrow size={15} />
                    {t.back}
                  </button>
                  <div className="catalog-hero">
                    <div
                      className="supplier-logo"
                      style={{
                        background: selectedSupplier.color,
                        color: selectedSupplier.ink,
                      }}
                    >
                      {React.createElement(icons[selectedSupplier.symbol], {
                        size: 35,
                      })}
                      <span>
                        {ar
                          ? selectedSupplier.shortAr
                          : selectedSupplier.shortEn}
                      </span>
                    </div>
                    <div>
                      <span className="overline">
                        {t.since} {selectedSupplier.since} · {t.demo}
                      </span>
                      <h1>{name(selectedSupplier)}</h1>
                      <p>
                        {
                          selectedSupplier[
                            ar ? "descriptionAr" : "descriptionEn"
                          ]
                        }
                      </p>
                      <div className="catalog-facts">
                        <span>
                          <Package size={14} />
                          {t.minOrder}: {money(selectedSupplier.min)}
                        </span>
                        <span>
                          <Truck size={14} />
                          {selectedSupplier[ar ? "deliveryAr" : "deliveryEn"]}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {selectedSupplier.cities
                            .map((id) => name(cities.find((c) => c.id === id)))
                            .join("، ")}
                        </span>
                      </div>
                      <p className="free-delivery">
                        {t.freeDelivery} {money(selectedSupplier.freeAt)} ·{" "}
                        {t.deliveryFee}: {money(selectedSupplier.fee)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="overline">{t.tagline}</span>
                  <h1>{t.products}</h1>
                  <p>{t.featuredSub}</p>
                </>
              )}
            </div>
            {categoryPicker(true)}
            <div className="filter-bar">
              <label className="search-field">
                <Search size={18} />
                <input
                  aria-label={t.search}
                  placeholder={t.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="sort-select">
                <SlidersHorizontal size={15} />
                <select
                  aria-label={t.sort}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="recommended">{t.recommended}</option>
                  <option value="priceLow">{t.priceLow}</option>
                  <option value="priceHigh">{t.priceHigh}</option>
                </select>
              </label>
            </div>
            <p className="results-count">
              {num(filtered.length)} {t.results}
            </p>
            <div className="product-grid catalog-products">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            {!filtered.length && (
              <Empty
                icon={Search}
                title={t.emptyResults}
                action={t.clearFilters}
                onAction={() => {
                  setQuery("");
                  setCategory("all");
                }}
              />
            )}
          </>
        )}
        {page === "orders" && (
          <>
            <div className="page-intro">
              <span className="overline">{t.shop}</span>
              <h1>{t.myOrders}</h1>
              <p>{t.ordersSub}</p>
            </div>
            {orders.length ? (
              <div className="orders-list">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            ) : (
              <Empty
                icon={ClipboardList}
                title={t.noOrders}
                text={t.noOrdersSub}
                action={t.browse}
                onAction={() => go("discover")}
              />
            )}
          </>
        )}
        {page === "checkout" && (
          <>
            <div className="page-intro">
              <button
                className="back-link"
                onClick={() => setModal({ type: "cart" })}
              >
                <Arrow size={15} />
                {t.cart}
              </button>
              <h1>{t.checkoutTitle}</h1>
              <p>{t.checkoutSub}</p>
            </div>
            {cartLines.length ? (
              <div className="checkout-grid">
                <ShopForm
                  key="checkout"
                  t={t}
                  lang={lang}
                  cities={cities}
                  name={name}
                  initial={{ ...profile, city }}
                  checkout
                  onSubmit={submitOrder}
                />
                <aside className="checkout-summary panel">
                  <span className="overline">{t.orderSummary}</span>
                  <h3>{name(cartSupplier)}</h3>
                  {cartLines.map((i) => (
                    <div className="checkout-line" key={i.id}>
                      <ProductArt product={i.product} />
                      <div>
                        <strong>{name(i.product)}</strong>
                        <small>
                          {num(i.qty)} × {money(i.product.price)}
                        </small>
                      </div>
                      <b>{money(i.qty * i.product.price)}</b>
                    </div>
                  ))}
                  <CartSummary button={false} />
                </aside>
              </div>
            ) : (
              <Empty
                icon={ShoppingBag}
                title={t.cartEmpty}
                action={t.browse}
                onAction={() => go("discover")}
              />
            )}
          </>
        )}
        {page === "portal" && (
          <>
            <div className="page-intro">
              <span className="overline">{t.supplierPortal}</span>
              <h1>{t.portalTitle}</h1>
              <p>{t.portalSub}</p>
            </div>
            <div className="portal-notice">
              <ShieldCheck size={19} />
              {t.demoPortal}
            </div>
            <div className="portal-toolbar">
              <label>
                {t.supplier}
                <select
                  value={portalSupplier}
                  onChange={(e) => setPortalSupplier(e.target.value)}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {name(s)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="portal-tabs">
                <button
                  className={portalTab === "orders" ? "active" : ""}
                  onClick={() => setPortalTab("orders")}
                >
                  {t.incoming}
                </button>
                <button
                  className={portalTab === "products" ? "active" : ""}
                  onClick={() => setPortalTab("products")}
                >
                  {t.manageProducts}
                </button>
              </div>
            </div>
            <div className="stats-grid">
              {[
                [
                  t.newOrders,
                  orders.filter(
                    (o) =>
                      o.supplier === portalSupplier && o.status === "submitted",
                  ).length,
                ],
                [
                  t.activeOrders,
                  orders.filter(
                    (o) =>
                      o.supplier === portalSupplier &&
                      !["cancelled", "delivered"].includes(o.status),
                  ).length,
                ],
                [
                  t.orderValue,
                  money(
                    orders
                      .filter(
                        (o) =>
                          o.supplier === portalSupplier &&
                          o.status !== "cancelled",
                      )
                      .reduce((n, o) => n + o.total, 0),
                  ),
                ],
              ].map(([label, value]) => (
                <div className="panel stat" key={label}>
                  <span>{label}</span>
                  <strong>
                    {typeof value === "number" ? num(value) : value}
                  </strong>
                </div>
              ))}
            </div>
            {portalTab === "orders" ? (
              orders.some((o) => o.supplier === portalSupplier) ? (
                <div className="orders-list">
                  {orders
                    .filter((o) => o.supplier === portalSupplier)
                    .map((o) => (
                      <OrderCard key={o.id} order={o} portal />
                    ))}
                </div>
              ) : (
                <Empty icon={ClipboardList} title={t.noIncoming} />
              )
            ) : (
              <div className="inventory-list">
                {products
                  .filter((p) => p.supplier === portalSupplier)
                  .map((p) => (
                    <InventoryRow
                      key={p.id + "-" + p.price + "-" + p.stock}
                      p={p}
                      t={t}
                      name={name}
                      onSave={(price, stock) => {
                        if (
                          !Number.isFinite(price) ||
                          price <= 0 ||
                          !Number.isInteger(stock) ||
                          stock < 0
                        ) {
                          notify(t.productInvalid);
                          return;
                        }
                        setProducts(
                          products.map((item) =>
                            item.id === p.id
                              ? {
                                  ...item,
                                  price: Math.round(price * 100) / 100,
                                  stock,
                                }
                              : item,
                          ),
                        );
                        notify(t.saved);
                      }}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="footer-brand">
                <Box size={25} />
                {t.brand}
                <span>.</span>
              </div>
              <h3>{t.footer}</h3>
              <p>{t.footerSub}</p>
            </div>
            <div className="footer-links">
              <button onClick={() => setModal({ type: "how" })}>
                {t.help}
              </button>
              <button onClick={() => setModal({ type: "privacy" })}>
                {t.privacy}
              </button>
              <button onClick={() => go("portal")}>
                {t.supplierPortal}
                <Diagonal size={13} />
              </button>
            </div>
            <div className="footer-jordan">
              🇯🇴
              <span>
                {ar ? "من الأردن، لتجارتك." : "FROM JORDAN, FOR YOUR BUSINESS."}
              </span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Mohannad</span>
            <span>
              {t.demo} · {t.noPayment}
            </span>
          </div>
        </div>
      </footer>
      {cartCount > 0 && page !== "checkout" && (
        <button
          className="mobile-cart"
          onClick={() => setModal({ type: "cart" })}
        >
          <ShoppingBag size={18} />
          <span>
            {t.cart} ({num(cartCount)})
          </span>
          <strong>{money(total)}</strong>
          <Arrow size={17} />
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          key={modal.type}
          closeLabel={t.close}
          title={modal.type === "cart" ? t.cart : t.brand}
          drawer={modal.type === "cart"}
          onClose={() => setModal(null)}
        >
          {modal.type === "cart" && (
            <>
              <div className="modal-heading">
                <span className="overline">{t.oneSupplier}</span>
                <h2>{t.cart}</h2>
                {cartSupplier && (
                  <p>
                    {t.yourOrder} <strong>{name(cartSupplier)}</strong>
                  </p>
                )}
              </div>
              {cartLines.length ? (
                <>
                  <div className="cart-lines">
                    {cartLines.map((i) => (
                      <div className="cart-line" key={i.id}>
                        <div className="cart-art">
                          <ProductArt product={i.product} />
                        </div>
                        <div className="cart-line-info">
                          <h3>{name(i.product)}</h3>
                          <small>{i.product[ar ? "packAr" : "packEn"]}</small>
                          <b>{money(i.product.price)}</b>
                          <div className="qty-controls">
                            <button
                              aria-label={t.qty + " - " + name(i.product)}
                              disabled={i.qty <= i.product.min}
                              onClick={() => changeQty(i.id, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span>{num(i.qty)}</span>
                            <button
                              aria-label={t.qty + " + " + name(i.product)}
                              disabled={i.qty >= i.product.stock}
                              onClick={() => changeQty(i.id, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          {i.qty > i.product.stock && (
                            <span className="field-error">{t.stockLimit}</span>
                          )}
                        </div>
                        <button
                          className="remove-button"
                          aria-label={t.remove + " " + name(i.product)}
                          onClick={() => remove(i.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <CartSummary />
                </>
              ) : (
                <Empty
                  icon={ShoppingBag}
                  title={t.cartEmpty}
                  text={t.cartEmptySub}
                  action={t.continueShopping}
                  onAction={() => {
                    setModal(null);
                    go("discover");
                  }}
                />
              )}
            </>
          )}
          {modal.type === "switch" && (
            <>
              <div className="modal-icon">
                <ShoppingBag size={28} />
              </div>
              <h2>{t.switchTitle}</h2>
              <p>{t.switchText}</p>
              <div className="modal-actions">
                <button
                  className="primary"
                  onClick={() => {
                    add(modal.product, true);
                    setModal(null);
                  }}
                >
                  {t.switchConfirm}
                </button>
                <button className="secondary" onClick={() => setModal(null)}>
                  {t.cancel}
                </button>
              </div>
            </>
          )}
          {modal.type === "reorder" && (
            <>
              <h2>{t.switchTitle}</h2>
              <p>{t.switchText}</p>
              <div className="modal-actions">
                <button
                  className="primary"
                  onClick={() => reorder(modal.order, true)}
                >
                  {t.switchConfirm}
                </button>
                <button className="secondary" onClick={() => setModal(null)}>
                  {t.cancel}
                </button>
              </div>
            </>
          )}
          {modal.type === "city" && (
            <>
              <span className="overline">{t.location}</span>
              <h2>{t.selectCity}</h2>
              <p>{t.cartCityWarning}</p>
              <div className="city-options">
                {cities.map((c) => (
                  <button
                    className={city === c.id ? "selected" : ""}
                    key={c.id}
                    onClick={() => {
                      setCity(c.id);
                      setModal(null);
                      notify(t.cityUpdated);
                    }}
                  >
                    <MapPin size={18} />
                    {name(c)}
                    {city === c.id && <Check size={18} />}
                  </button>
                ))}
              </div>
            </>
          )}
          {modal.type === "profile" && (
            <>
              <h2>{t.shopProfile}</h2>
              <p>{t.profileSub}</p>
              <ShopForm
                t={t}
                lang={lang}
                cities={cities}
                name={name}
                initial={profile}
                onSubmit={(form) => {
                  const phone = form.phone.replace(/[\s()-]/g, "");
                  if (!/^(?:\+962|00962|0)7[789]\d{7}$/.test(phone)) {
                    notify(t.phoneError);
                    return false;
                  }
                  setProfile(form);
                  setModal(null);
                  notify(t.profileSaved);
                  return true;
                }}
              />
            </>
          )}
          {modal.type === "success" && (
            <div className="success-content">
              <div className="success-icon">
                <Check size={34} />
              </div>
              <span className="overline">{t.demo}</span>
              <h2>{t.success}</h2>
              <p>{t.successText}</p>
              <div className="success-number">
                <small>{t.orderNumber}</small>
                <strong dir="ltr">{modal.order.id}</strong>
              </div>
              <button
                className="primary full"
                onClick={() => setModal({ type: "order", id: modal.order.id })}
              >
                {t.track}
                <Arrow size={17} />
              </button>
            </div>
          )}
          {modal.type === "order" &&
            (() => {
              const o = orders.find((o) => o.id === modal.id);
              if (!o) return null;
              const s = suppliers.find((s) => s.id === o.supplier);
              return (
                <>
                  <span className="overline" dir="ltr">
                    {o.id}
                  </span>
                  <h2>{name(s)}</h2>
                  <span className={"status status-" + o.status}>
                    {t[o.status]}
                  </span>
                  <div className="timeline">
                    {o.status === "cancelled" ? (
                      <div className="cancelled-line">{t.cancelled}</div>
                    ) : (
                      statusKeys.map((key, i) => (
                        <div
                          className={
                            i <= statusKeys.indexOf(o.status) ? "done" : ""
                          }
                          key={key}
                        >
                          <span>
                            {i <= statusKeys.indexOf(o.status) ? (
                              <Check size={12} />
                            ) : (
                              i + 1
                            )}
                          </span>
                          <p>
                            {t[key]}
                            {o.history.find((h) => h.status === key) && (
                              <small>
                                {date(
                                  o.history.find((h) => h.status === key).at,
                                )}
                              </small>
                            )}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="order-detail-items">
                    {o.items.map((i) => (
                      <div key={i.id}>
                        <span>
                          {name(i)}
                          <small>
                            {num(i.qty)} × {money(i.price)}
                          </small>
                        </span>
                        <b>{money(i.qty * i.price)}</b>
                      </div>
                    ))}
                    <div>
                      <span>{t.deliveryFee}</span>
                      <b>{o.deliveryFee ? money(o.deliveryFee) : t.free}</b>
                    </div>
                    <div className="detail-total">
                      <strong>{t.total}</strong>
                      <strong>{money(o.total)}</strong>
                    </div>
                  </div>
                  <div className="delivery-details">
                    <h3>{t.delivery}</h3>
                    <p>
                      {o.customer.shop} · {o.customer.name}
                    </p>
                    <p dir="auto">{o.customer.phone}</p>
                    <p>
                      {name(cities.find((c) => c.id === o.customer.city))} ·{" "}
                      {o.customer.address}
                    </p>
                    {o.customer.notes && <p>{o.customer.notes}</p>}
                    <small>{t.paymentText}</small>
                  </div>
                  <div className="modal-actions">
                    {o.status === "submitted" && (
                      <button
                        className="danger-button"
                        onClick={() => setModal({ type: "cancel", id: o.id })}
                      >
                        {t.cancelOrder}
                      </button>
                    )}
                    <button className="secondary" onClick={() => reorder(o)}>
                      {t.reorder}
                    </button>
                  </div>
                </>
              );
            })()}
          {modal.type === "cancel" && (
            <>
              <h2>{t.cancelDialog}</h2>
              <p>{t.cancelDialogSub}</p>
              <div className="modal-actions">
                <button
                  className="primary danger"
                  onClick={() => updateStatus(modal.id, "cancelled")}
                >
                  {t.cancelOrder}
                </button>
                <button
                  className="secondary"
                  onClick={() => setModal({ type: "order", id: modal.id })}
                >
                  {t.back}
                </button>
              </div>
            </>
          )}
          {modal.type === "how" && (
            <>
              <span className="overline">{t.tagline}</span>
              <h2>{t.helpTitle}</h2>
              <div className="how-steps">
                {[
                  [Store, t.step1, t.step1sub],
                  [ShoppingBag, t.step2, t.step2sub],
                  [Truck, t.step3, t.step3sub],
                ].map(([Icon, title, sub], i) => (
                  <div key={title}>
                    <span>
                      <Icon size={23} />
                    </span>
                    <section>
                      <small>0{i + 1}</small>
                      <h3>{title}</h3>
                      <p>{sub}</p>
                    </section>
                  </div>
                ))}
              </div>
              <p className="notice-text">{t.demoText}</p>
            </>
          )}
          {modal.type === "privacy" && (
            <>
              <h2>{t.privacy}</h2>
              <p>{t.privacyText}</p>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
function Empty({ icon: Icon, title, text, action, onAction }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={34} strokeWidth={1.3} />
      </span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && (
        <button className="primary" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
function Modal({ children, onClose, drawer, title, closeLabel }) {
  const ref = useRef();
  useEffect(() => {
    const before = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handle = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = ref.current.querySelectorAll(
          'button:not(:disabled),input,select,textarea,[tabindex="0"]',
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handle);
      before?.focus();
    };
  }, []);
  return (
    <div
      className={"modal-backdrop " + (drawer ? "drawer-backdrop" : "")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={"modal " + (drawer ? "drawer" : "")}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X size={21} />
        </button>
        {children}
      </section>
    </div>
  );
}
function ShopForm({
  t,
  lang,
  cities,
  name,
  initial,
  onSubmit,
  checkout = false,
}) {
  const [form, setForm] = useState({
      ...defaultProfile,
      ...initial,
      notes: "",
    }),
    [error, setError] = useState("");
  function field(id) {
    return {
      value: form[id],
      onChange: (e) => {
        setForm({ ...form, [id]: e.target.value });
        setError("");
      },
    };
  }
  return (
    <form
      className={"shop-form " + (checkout ? "panel" : "")}
      onSubmit={(e) => {
        e.preventDefault();
        const normalized = form.phone.replace(/[\s()-]/g, "");
        if (!/^(?:\+962|00962|0)7[789]\d{7}$/.test(normalized)) {
          setError(t.phoneError);
          return;
        }
        onSubmit({
          ...form,
          shop: form.shop.trim(),
          name: form.name.trim(),
          address: form.address.trim(),
        });
      }}
    >
      <div className="form-grid">
        <label>
          {t.shopName}
          <input
            required
            minLength={2}
            maxLength={100}
            {...field("shop")}
            autoComplete="organization"
          />
        </label>
        <label>
          {t.contactName}
          <input
            required
            minLength={2}
            maxLength={100}
            {...field("name")}
            autoComplete="name"
          />
        </label>
        <label>
          {t.phone}
          <input
            required
            type="tel"
            dir="ltr"
            placeholder="0791234567"
            {...field("phone")}
            autoComplete="tel"
          />
        </label>
        <label>
          {t.city}
          <select aria-label={t.city} {...field("city")}>
            {cities.map((c) => (
              <option value={c.id} key={c.id}>
                {name(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="form-wide">
          {t.address}
          <textarea
            required
            minLength={8}
            maxLength={400}
            rows={3}
            {...field("address")}
            autoComplete="street-address"
          />
        </label>
        {checkout && (
          <label className="form-wide">
            {t.notes}
            <textarea maxLength={500} rows={2} {...field("notes")} />
          </label>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {checkout && (
        <div className="payment-box">
          <ShieldCheck size={23} />
          <div>
            <h3>{t.payment}</h3>
            <p>{t.paymentText}</p>
          </div>
        </div>
      )}
      <button className="primary full" type="submit">
        {checkout ? t.submit : t.save}
        <Check size={17} />
      </button>
    </form>
  );
}
function InventoryRow({ p, t, name, onSave }) {
  const [price, setPrice] = useState(p.price),
    [stock, setStock] = useState(p.stock);
  return (
    <form
      className="inventory-row panel"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(Number(price), Number(stock));
      }}
    >
      <ProductArt product={p} />
      <div className="inventory-name">
        <h3>{name(p)}</h3>
        <small>{p.packEn}</small>
      </div>
      <label>
        {t.price}
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <label>
        {t.stock}
        <input
          required
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </label>
      <button className="secondary small">
        {t.save}
        <Check size={14} />
      </button>
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
