"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Plus,
  Minus,
  ArrowUpRight,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import {
  Product,
  CartItem,
  getProducts,
  getCategories,
  money,
  photo,
  cardTitle,
} from "../lib/catalog";
const CART_STORAGE_KEY = "tochka-stilya-cart";
const LEGACY_CART_STORAGE_KEY = "offgrid-cart";
const C = createContext<{
  items: CartItem[];
  add: (p: Product, s: string, q?: number) => void;
  change: (i: number, q: number) => void;
  open: () => void;
}>({ items: [], add: () => {}, change: () => {}, open: () => {} });
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    D(false);
    M(false);
  }, [pathname]);
  const [items, set] = useState<CartItem[]>([]),
    [ready, R] = useState(false),
    [drawer, D] = useState(false),
    [menu, M] = useState(false),
    [toast, T] = useState("");
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(CART_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_CART_STORAGE_KEY) ||
        "[]";
      const v = JSON.parse(saved);
      if (Array.isArray(v))
        set(
          v.filter(
            (x) =>
              getProducts().some((p) => p.id === x.id) &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 99 &&
              typeof x.size === "string",
          ),
        );
    } catch {}
    R(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => T(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        D(false);
        M(false);
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const add = (p: Product, size: string, q = 1) => {
    set((old) => {
      const i = old.findIndex((x) => x.id === p.id && x.size === size);
      return i < 0
        ? [...old, { id: p.id, size, quantity: q }]
        : old.map((x, j) =>
            j === i ? { ...x, quantity: Math.min(99, x.quantity + q) } : x,
          );
    });
    T("Товар добавлен в корзину");
  };
  return (
    <MotionConfig reducedMotion="user">
      <C.Provider
        value={{
          items,
          add,
          change: (i, q) =>
            set((old) =>
              old
                .map((x, j) =>
                  j === i ? { ...x, quantity: Math.min(99, q) } : x,
                )
                .filter((x) => x.quantity > 0),
            ),
          open: () => D(true),
        }}
      >
        <header>
          <Link
            className="brand-logo"
            href="/"
            aria-label="ТОЧКА СТИЛЯ — главная"
          >
            <Image
              src="/brand-logo.png"
              alt="ТОЧКА СТИЛЯ"
              width={2172}
              height={724}
              priority
            />
          </Link>
          <nav className={menu ? "expanded" : ""} onClick={() => M(false)}>
            <Link href="/catalog">Каталог</Link>
            <Link href="/#new">Новое поступление</Link>
            <Link href="/#categories">Категории</Link>
            <Link href="/about">О нас</Link>
          </nav>
          <div className="tools">
            <Link href="/catalog" aria-label="Поиск">
              <Search size={22} />
            </Link>
            <button onClick={() => D(true)} aria-label="Открыть корзину">
              <ShoppingBag />
              <b>{items.reduce((s, x) => s + x.quantity, 0)}</b>
            </button>
            <button
              className="mobile"
              onClick={() => M(!menu)}
              aria-label="Меню"
              aria-expanded={menu}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <Link
            className="brand-logo footer-brand"
            href="/"
            aria-label="ТОЧКА СТИЛЯ — главная"
          >
            <Image
              src="/brand-logo.png"
              alt="ТОЧКА СТИЛЯ"
              width={2172}
              height={724}
            />
          </Link>
          <p>Твой стиль. Твои правила.</p>
          <Link className="arrow-link" href="/catalog">
            Каталог
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <small>Демонстрационная витрина · 2026</small>
        </footer>
        {toast && (
          <div role="status" className="toast">
            ✓ {toast}
          </div>
        )}
        {drawer && (
          <div className="overlay">
            <button
              className="shade"
              onClick={() => D(false)}
              aria-label="Закрыть корзину"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Корзина"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
            >
              <div className="heading">
                <h2>КОРЗИНА</h2>
                <button onClick={() => D(false)} aria-label="Закрыть">
                  <X />
                </button>
              </div>
              <Cart />
              <Link onClick={() => D(false)} href="/cart">
                Открыть страницу корзины →
              </Link>
            </motion.aside>
          </div>
        )}
      </C.Provider>
    </MotionConfig>
  );
}
function Picture({ p, index = 0 }: { p: Product; index?: number }) {
  const [bad, B] = useState(false);
  return bad ? (
    <div className="placeholder">
      ТОЧКА СТИЛЯ
      <br />
      <small>Фото недоступно</small>
    </div>
  ) : (
    <Image
      src={photo(p, index)}
      alt={p.title}
      fill
      sizes="(max-width:700px) 50vw,25vw"
      onError={() => B(true)}
    />
  );
}
export function Grid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <Card key={p.id} p={p} />
      ))}
    </div>
  );
}
function Card({ p }: { p: Product }) {
  const c = useContext(C);
  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <Link className="product-photo" href={"/product/" + p.slug}>
        <Picture p={p} />
        {p.images.length > 1 && (
          <div className="second">
            <Picture p={p} index={1} />
          </div>
        )}
        <span className="photo-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="card-info">
        <small>{p.category.label}</small>
        <Link
          className="product-title"
          href={"/product/" + p.slug}
          title={p.title}
        >
          {cardTitle(p)}
        </Link>
        <p className="price">{money(p.price.amount)}</p>
        {p.size.length ? (
          <Link className="outline arrow-link" href={"/product/" + p.slug}>
            Выбрать размер
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        ) : (
          <button className="outline" onClick={() => c.add(p, "")}>
            В корзину +
          </button>
        )}
      </div>
    </motion.article>
  );
}
export function Catalog({
  products,
  title = "КАТАЛОГ",
}: {
  products: Product[];
  title?: string;
}) {
  const [query, Q] = useState(""),
    [category, C] = useState(""),
    [size, S] = useState(""),
    [max, P] = useState(""),
    [sort, O] = useState("default");
  const shown = products
    .filter(
      (p) =>
        (!category || p.category.id === category) &&
        (!size || p.size.includes(size)) &&
        (!max || (p.price.amount !== null && p.price.amount <= Number(max))) &&
        p.title.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "asc"
        ? (a.price.amount ?? Infinity) - (b.price.amount ?? Infinity)
        : sort === "desc"
          ? (b.price.amount ?? 0) - (a.price.amount ?? 0)
          : sort === "name"
            ? a.title.localeCompare(b.title)
            : 0,
    );
  return (
    <section className="section">
      <p className="eyebrow">НАЙДИ СВОЙ РИТМ</p>
      <div className="heading">
        <h1>{title}</h1>
        <span>{shown.length} вещей</span>
      </div>
      <div className="filters">
        <input
          aria-label="Поиск товаров"
          placeholder="Поиск по названию"
          value={query}
          onChange={(e) => Q(e.target.value)}
        />
        <select
          aria-label="Категория"
          value={category}
          onChange={(e) => C(e.target.value)}
        >
          <option value="">Все категории</option>
          {getCategories().map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Размер"
          value={size}
          onChange={(e) => S(e.target.value)}
        >
          <option value="">Все размеры</option>
          {[...new Set(products.flatMap((p) => p.size))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          aria-label="Максимальная цена"
          placeholder="Цена до, BYN"
          value={max}
          onChange={(e) => P(e.target.value)}
        />
        <select
          aria-label="Сортировка"
          value={sort}
          onChange={(e) => O(e.target.value)}
        >
          <option value="default">Порядок каталога</option>
          <option value="asc">Цена ↑</option>
          <option value="desc">Цена ↓</option>
          <option value="name">По названию</option>
        </select>
      </div>
      {shown.length ? (
        <Grid products={shown} />
      ) : (
        <p className="empty">Ничего не найдено. Попробуйте изменить фильтры.</p>
      )}
    </section>
  );
}
export function Detail({ product: p }: { product: Product }) {
  const [index, I] = useState(0),
    [size, S] = useState(""),
    [qty, Q] = useState(1),
    [zoom, Z] = useState(false);
  const c = useContext(C);
  return (
    <section className="section">
      <Link href="/catalog">← В каталог</Link>
      <div className="detail">
        <div>
          <button
            className="gallery"
            onClick={() => Z(true)}
            aria-label="Увеличить фото"
          >
            <Picture p={p} index={index} />
          </button>
          <div className="thumbs">
            {p.images.map((im, i) => (
              <button
                key={im.localPath}
                aria-label={"Фотография " + (i + 1)}
                onClick={() => I(i)}
                className={index === i ? "active" : ""}
              >
                <Image src={"/" + im.localPath} alt="" width={72} height={82} />
              </button>
            ))}
          </div>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{p.category.label}</p>
          <h1>{p.title}</h1>
          <p className="price big">{money(p.price.amount)}</p>
          <hr />
          <p>Размер {size && " / " + size}</p>
          {p.size.length ? (
            <div className="sizes">
              {p.size.map((s) => (
                <button
                  className={size === s ? "active" : ""}
                  key={s}
                  onClick={() => S(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">Размер не указан продавцом.</p>
          )}
          <p className="muted">
            Размеры указаны в объявлении; наличие требует уточнения.
          </p>
          <div className="purchase">
            <input
              aria-label="Количество"
              type="number"
              min="1"
              max="99"
              value={qty}
              onChange={(e) =>
                Q(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
              }
            />
            <button
              className="button"
              disabled={!!p.size.length && !size}
              onClick={() => c.add(p, size, qty)}
            >
              Добавить в корзину +
            </button>
          </div>
          <h3>Детали</h3>
          <p className="description">
            {p.description || "Описание отсутствует."}
          </p>
          <a className="arrow-link" href={p.sourceUrl} target="_blank" rel="noreferrer">
            Исходное объявление
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
      </div>
      {zoom && (
        <div
          className="zoom"
          role="dialog"
          aria-modal="true"
          aria-label="Увеличенное фото"
          onClick={() => Z(false)}
        >
          <button aria-label="Закрыть фото" onClick={() => Z(false)}>
            <X />
          </button>
          <Image src={photo(p, index)} alt={p.title} fill sizes="100vw" />
        </div>
      )}
    </section>
  );
}
export function Cart() {
  const c = useContext(C);
  const total = c.items.reduce(
    (s, x) =>
      s +
      (getProducts().find((p) => p.id === x.id)?.price.amount || 0) *
        x.quantity,
    0,
  );
  return c.items.length ? (
    <>
      <div className="cart-lines">
        {c.items.map((x, i) => {
          const p = getProducts().find((p) => p.id === x.id)!;
          return (
            <div className="cart-line" key={x.id + x.size}>
              <Image src={photo(p)} alt={p.title} width={76} height={96} />
              <div>
                <Link href={"/product/" + p.slug}>{p.title}</Link>
                <small>{x.size || "Размер не указан"}</small>
                <div className="counter">
                  <button
                    aria-label="Уменьшить количество"
                    onClick={() => c.change(i, x.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  {x.quantity}
                  <button
                    aria-label="Увеличить количество"
                    onClick={() => c.change(i, x.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                  <button onClick={() => c.change(i, 0)}>Удалить</button>
                </div>
              </div>
              <span>{money((p.price.amount || 0) * x.quantity)}</span>
            </div>
          );
        })}
      </div>
      <div className="heading">
        <h3>Итого</h3>
        <strong className="price">{money(total)}</strong>
      </div>
      <p className="muted">
        Доставка и наличие будут уточняться после запуска.
      </p>
      <Link className="button" href="/checkout">
        К оформлению →
      </Link>
    </>
  ) : (
    <div className="empty">
      <ShoppingBag size={42} />
      <h3>Здесь пока пусто</h3>
      <Link href="/catalog">Найти свою вещь →</Link>
    </div>
  );
}
