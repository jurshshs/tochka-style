import Link from "next/link";
export default function Page() {
  return (
    <section className="section narrow">
      <p className="eyebrow">СЛЕДУЮЩИЙ ШАГ</p>
      <h1>
        ОФОРМЛЕНИЕ
        <br />
        СКОРО.
      </h1>
      <p>
        Это демонстрационная витрина. Приём заказов и оплата будут доступны
        после запуска магазина. Персональные данные здесь не собираются.
      </p>
      <Link href="/cart" className="button">
        Вернуться в корзину →
      </Link>
    </section>
  );
}
