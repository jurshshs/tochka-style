import { Catalog } from "../../../components/store";
import { getProducts, getCategories } from "../../../lib/catalog";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCategories().find((c) => c.id === slug);
  if (!c) notFound();
  return (
    <Catalog
      products={getProducts().filter((p) => p.category.id === slug)}
      title={c.label}
    />
  );
}
