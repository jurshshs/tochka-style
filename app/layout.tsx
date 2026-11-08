import "./globals.css";
import { DialogAccessibility } from "../components/dialog-accessibility";
import { Shell } from "../components/store";
export const metadata = {
  title: {
    default: "ТОЧКА СТИЛЯ — одежда и streetwear",
    template: "%s — ТОЧКА СТИЛЯ",
  },
  description:
    "ТОЧКА СТИЛЯ — магазин одежды, обуви и streetwear-аксессуаров. Каталог с размерами, ценами и фотографиями товаров.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <DialogAccessibility />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
