import { Catalog } from "../../components/store";
import { getProducts } from "../../lib/catalog";
export const metadata = { title: "Каталог" };
export default function Page() {
  return <Catalog products={getProducts()} />;
}
