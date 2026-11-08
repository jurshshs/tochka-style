"use client";
import { useEffect } from "react";
export function DialogAccessibility() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    let previous: HTMLElement | null = null;
    let oldOverflow = "";
    const update = () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (dialog === active) return;
      if (active) {
        document.body.style.overflow = oldOverflow;
        previous?.focus();
      }
      active = dialog;
      if (dialog) {
        previous = document.activeElement as HTMLElement;
        oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.querySelector<HTMLElement>("button,a,input,select")?.focus();
      }
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    const key = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.key === "Escape") {
        active
          .querySelector<HTMLButtonElement>('button[aria-label^="Закрыть"]')
          ?.click();
        return;
      }
      if (e.key !== "Tab") return;
      const els = [
        ...active.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input,select,[tabindex="0"]',
        ),
      ].filter((x) => x.getClientRects().length);
      const first = els[0],
        last = els.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", key);
      if (active) document.body.style.overflow = oldOverflow;
    };
  }, []);
  return null;
}
