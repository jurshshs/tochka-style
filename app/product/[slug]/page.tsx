import { Detail, Grid } from "../../../components/store";
import { getProduct, getProducts } from "../../../lib/catalog";
import { notFound } from "next/navigation";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getProduct(decodeURIComponent((await params).slug));
  return { title: p?.title || "Товар не найден" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = getProduct(decodeURIComponent((await params).slug));
  if (!p) notFound();
  return (
    <>
      <Detail product={p} />
      <section className="section">
        <h2>В ТОМ ЖЕ РИТМЕ</h2>
        <Grid
          products={getProducts()
            .filter((x) => x.category.id === p.category.id && x.id !== p.id)
            .slice(0, 4)}
        />
      </section>
    </>
  );
}
