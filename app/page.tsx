import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getProducts, getHotPicks, getCategories, photo } from "../lib/catalog";
import { Grid } from "../components/store";
export default function Home() {
  const all = getProducts();
  const categoryImages: Record<string, string> = {
    "t-shirts": "/categories/t-shirts.png",
    hoodies: "/categories/hoodies.png",
    "jeans-pants": "/categories/jeans-pants.png",
    jackets: "/categories/jackets.png",
    shoes: "/categories/shoes.png",
    accessories: "/categories/accessories.png",
  };
  const productCount = (count: number) =>
    `${count} ${count % 100 >= 11 && count % 100 <= 14 ? "товаров" : count % 10 === 1 ? "товар" : count % 10 >= 2 && count % 10 <= 4 ? "товара" : "товаров"}`;
  return (
    <>
      <section className="hero">
        <div className="hero-art">
          <Image
            src="/hero/wet-black-puffer.png"
            alt="Мокрый чёрный пуховик в студийном свете"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">ВНЕ РАМОК / STREETWEAR EDIT</p>
          <h1>
            STYLE
            <br />
            WITHOUT
            <br />
            <span>LIMITS.</span>
          </h1>
          <p>
            Твой стиль. Твои правила.
            <br />
            Вещи с характером для ритма города.
          </p>
          <Link className="button arrow-link" href="/catalog">
            СМОТРЕТЬ КАТАЛОГ
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="hero-bottom">
          ТОЧКА СТИЛЯ / EDIT 001 <span>ОДЕЖДА, КОТОРАЯ ГОВОРИТ ЗА ТЕБЯ</span>
        </div>
      </section>
      <section className="section">
        <div className="heading">
          <div>
            <p className="eyebrow">ВЫБОР РЕДАКЦИИ</p>
            <h2>
              HOT PICKS<span>↗</span>
            </h2>
          </div>
          <Link href="/catalog">Весь каталог →</Link>
        </div>
        <Grid products={getHotPicks()} />
      </section>
      <section className="statement">
        <p>НЕ СЛЕДУЙ ПРАВИЛАМ.</p>
        <h2>
          СОЗДАВАЙ
          <br />
          СВОЙ РИТМ.
        </h2>
        <Link className="button arrow-link" href="/about">
          О ПРОЕКТЕ
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </section>
      <section className="section" id="categories">
        <div className="category-heading">
          <div>
            <p className="category-eyebrow">КАТЕГОРИИ</p>
            <h2>ВЫБЕРИ СВОЁ</h2>
            <p className="category-subtitle">Основные категории нашего ассортимента</p>
          </div>
          <Link className="arrow-link" href="/catalog">
            Весь каталог
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="categories">
          {getCategories().map((c) => (
            <Link key={c.id} href={"/category/" + c.id}>
              <Image
                src={categoryImages[c.id]}
                alt=""
                fill
                sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 30vw"
              />
              <div className="category-caption">
                <h3>{c.label}</h3>
                <small>{productCount(all.filter((p) => p.category.id === c.id).length)}</small>
              </div>
              <span className="category-arrow" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section" id="new">
        <div className="heading">
          <div>
            <p className="eyebrow">
              ПОРЯДОК КАТАЛОГА · ДАТЫ ПОСТУПЛЕНИЯ НЕ ПОДТВЕРЖДЕНЫ
            </p>
            <h2>НОВОЕ ПОСТУПЛЕНИЕ</h2>
          </div>
        </div>
        <Grid products={all.slice(0, 4)} />
      </section>
      <section className="section">
        <div className="heading">
          <h2>ВЕСЬ АССОРТИМЕНТ</h2>
          <Link href="/catalog">Фильтры и поиск →</Link>
        </div>
        <Grid products={all} />
      </section>
    </>
  );
}
