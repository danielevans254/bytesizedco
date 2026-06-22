"use client";
import { useEffect, useState } from "react";

const KEY = "bsc-recent";

export function recordRecent(slug) {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || "[]").filter((s) => s !== slug);
    arr.unshift(slug);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 6)));
  } catch {}
}

export function useRecentlyViewed(excludeSlug) {
  const [slugs, setSlugs] = useState([]);
  useEffect(() => {
    try {
      setSlugs(JSON.parse(localStorage.getItem(KEY) || "[]").filter((s) => s !== excludeSlug));
    } catch {}
  }, [excludeSlug]);
  return slugs;
}
