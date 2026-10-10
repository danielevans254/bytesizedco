"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { FREE_SHIP } from "../config";

const CartCtx = createContext(null);
const KEY = "bsc-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, loaded]);

  const add = useCallback((item) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === item.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + (item.qty || 1) };
        return next;
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback(
    (id, qty) => setItems((p) => (qty <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => (x.id === id ? { ...x, qty } : x)))),
    []
  );
  const remove = useCallback((id) => setItems((p) => p.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((n, x) => n + x.qty, 0);
  const subtotal = items.reduce((n, x) => n + x.price * x.qty, 0);

  return (
    <CartCtx.Provider value={{ items, add, setQty, remove, clear, count, subtotal, open, setOpen, FREE_SHIP }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx);
