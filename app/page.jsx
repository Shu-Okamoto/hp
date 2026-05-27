"use client";

import { useState, useEffect } from "react";
import PublicSite from "./components/PublicSite";
import AdminApp from "./components/AdminApp";

/**
 * Implementation host — frames the public site and admin console
 * with a top-level segment switcher. The selected view is reflected
 * to `location.hash` so refreshing keeps the user in place.
 */
export default function Page() {
  const [view, setView] = useState("site");

  // Restore from hash on mount (client only).
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h === "admin" || h === "site") setView(h);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.location.hash = view;
  }, [view]);

  return (
    <div className="impl-shell">
      <header className="impl-bar">
        <div className="impl-bar-brand">
          <span className="mark">里</span>
          <span className="name">
            さとの味みかわ <small>IMPLEMENTATION PROTOTYPE</small>
          </span>
        </div>
        <div className="impl-bar-segs" role="tablist">
          <button
            role="tab"
            aria-selected={view === "site"}
            className={`impl-seg ${view === "site" ? "is-active" : ""}`}
            onClick={() => setView("site")}
          >
            公開サイト
          </button>
          <button
            role="tab"
            aria-selected={view === "admin"}
            className={`impl-seg ${view === "admin" ? "is-active" : ""}`}
            onClick={() => setView("admin")}
          >
            管理画面
          </button>
        </div>
        <div className="impl-bar-meta">
          {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && (
            <a className="impl-bar-link" href="/wireframes">ワイヤーフレーム</a>
          )}
          <span className="impl-pill">localStorage 連動</span>
        </div>
      </header>
      <div className="impl-stage">
        {view === "site" ? <PublicSite /> : <AdminApp />}
      </div>
    </div>
  );
}
