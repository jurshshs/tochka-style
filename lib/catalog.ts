import data from "../data/catalog.json";
import overrides from "../data/image-overrides.json";
import editorial from "../data/editorial.json";
export interface ProductVariant {
  size: string;
}
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: { amount: number | null; currency: string | null };
  size: string[];
  category: { id: string; label: string };
  images: { localPath: string; sourceUrl: string }[];
  sourceUrl: string;
}
export interface Category {
  id: string;
  label: string;
  count: number;
}
export interface CartItem {
  id: string;
  size: string;
  quantity: number;
}
const imageOverrides = overrides as Record<string, string[]>;
const cardTitles: Record<string, string> = {
  "product-001": "Пуховик Nike Storm-FIT",
  "product-002": "Пуховик Polo Ralph Lauren",
  "product-003": "Пуховик Nike ACG Therma-FIT",
  "product-004": "Пуховик Nike ACG Therma-FIT",
  "product-005": "Пуховик Nike ACG Lunar Lake",
  "product-006": "Пуховик Polo Ralph Lauren",
  "product-007": "Пуховик Air Jordan Therma-FIT",
  "product-008": "Пуховик Nike Storm-FIT",
  "product-009": "Пуховик Polo Ralph Lauren",
  "product-010": "Пуховик Air Jordan Therma-FIT",
  "product-011": "Сумка Coach Graham",
  "product-012": "Штаны Nike ACG Polartec",
  "product-013": "Зип-худи Nike Tech Fleece",
  "product-014": "Зип-худи Nike Tech Fleece",
  "product-015": "Сумка Coach Joyride",
  "product-016": "Сумка Coach Sullivan",
  "product-017": "Штаны Nike Solo Swoosh",
  "product-018": "Худи Nike Therma-FIT",
  "product-019": "Худи Nike Therma-FIT",
  "product-020": "Свитшот Nike Therma-FIT",
  "product-021": "Свитшот Nike Therma-FIT",
  "product-022": "Жилетка Nike Storm-FIT",
  "product-023": "Классическая жилетка",
  "product-024": "Жилетка Nike Windrunner",
  "product-025": "Балаклава Cortez",
  "product-026": "Шарф Nike Big Swoosh",
  "product-027": "Кроссовки New Balance 1000",
  "product-028": "Футболка Nike ACG LBR Lungs",
  "product-029": "Футболка Stussy",
  "product-030": "Футболка Stussy",
  "product-031": "Футболка Nike Sportswear Max90",
  "product-032": "Футболка Stussy Saw Recordings",
};
export const getProducts = (): Product[] =>
  data.products.map((p) => ({
    ...p,
    images: imageOverrides[p.id]?.length
      ? imageOverrides[p.id].map((localPath) => ({ localPath, sourceUrl: "" }))
      : p.images,
  }));
export const getCategories = (): Category[] =>
  data.categories.filter((c) => c.count > 0);
export const getProduct = (slug: string) =>
  getProducts().find((p) => p.slug === slug);
export const getHotPicks = () =>
  editorial.hotPicks
    .map((id) => getProducts().find((p) => p.id === id)!)
    .filter(Boolean);
export const cardTitle = (product: Product) =>
  cardTitles[product.id] || product.title;
export const money = (n: number | null) =>
  n === null
    ? "Цена уточняется"
    : new Intl.NumberFormat("ru-BY", { maximumFractionDigits: 2 }).format(n) +
      " BYN";
export const photo = (p: Product, index = 0) =>
  "/" +
  (p.images[index]?.localPath || p.images[0]?.localPath || "placeholder.svg");
