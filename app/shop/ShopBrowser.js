"use client";
import { useEffect, useMemo, useState } from "react";
import ProductArt from "./ProductArt";
import QuickAdd from "./QuickAdd";
import { floorPrice } from "./config";

const DEPTS = ["Carry & Everyday", "Wear", "Play", "Read & Feed", "Sound & Drive", "Out", "Move & Fuel"];
const SORTS = [
  ["featured", "Featured"],
  ["price-asc", "Price (low)"],
  ["price-desc", "Price (high)"],
  ["az", "Name (A-Z)"],
];

export default function ShopBrowser({ products }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    try {
      const d = new URLSearchParams(window.location.search).get("dept");
      if (d) setDept(d);
    } catch {}
  }, []);

  const list = useMemo(() => {
    let l = products.filter((p) => !dept || p.dept === dept);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      l = l.filter((p) => `${p.name} ${p.dept} ${p.tagline}`.toLowerCase().includes(t));
    }
    const fl = (p) => floorPrice(p);
    if (sort === "price-asc") l = [...l].sort((a, b) => fl(a) - fl(b));
    else if (sort === "price-desc") l = [...l].sort((a, b) => fl(b) - fl(a));
    else if (sort === "az") l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [products, q, dept, sort]);

  return (
    <>
      <div className="shop-controls">
        <input className="shop-search" placeholder="Search the shop…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <select className="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="shop-filters">
        <button className={"fchip" + (dept === "" ? " on" : "")} onClick={() => setDept("")}>All</button>
        {DEPTS.map((d) => (
          <button key={d} className={"fchip" + (dept === d ? " on" : "")} onClick={() => setDept(d)}>{d}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="shop-empty">
          <h3>Nothing matches.</h3>
          <p>Try a different world or clear your search.</p>
          <button className="btn btn-ghost" onClick={() => { setQ(""); setDept(""); }}>Clear filters</button>
        </div>
      ) : (
        <div className="shop-grid">
          {list.map((p) => (
            <a className="pcard" key={p.slug} href={`/shop/${p.slug}`}>
              <div className="thumb"><ProductArt variant={p.art} /><QuickAdd product={p} /></div>
              <div className="pbody">
                <span className="dept">{p.deptTag}</span>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
                <div className="prow"><span className="pp">Physical + Digital</span><span className="price-sm">from ${floorPrice(p)}</span></div>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
