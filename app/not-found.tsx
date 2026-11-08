import Link from "next/link";
export default function Missing() {
  return (
    <section className="section narrow">
      <h1>
        404
        <br />
        ВНЕ МАРШРУТА.
      </h1>
      <Link className="button" href="/catalog">
        Вернуться в каталог →
      </Link>
    </section>
  );
}
