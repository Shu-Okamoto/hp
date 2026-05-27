/* global React, ReactDOM, PublicSite, AdminApp */

const { useState, useEffect } = React;

/**
 * Implementation host — frames the public site and admin console
 * with a top-level segment switcher. Public site renders inside an
 * iPhone-shaped device on mobile widths; full-bleed at desktop.
 */

function ImplHost() {
  const [view, setView] = useState(() => {
    const h = location.hash.replace("#", "");
    return h === "admin" || h === "site" ? h : "site";
  });
  useEffect(() => { location.hash = view; }, [view]);

  return (
    <div className="impl-shell">
      <header className="impl-bar">
        <div className="impl-bar-brand">
          <span className="mark">里</span>
          <span className="name">さとの味みかわ <small>IMPLEMENTATION PROTOTYPE</small></span>
        </div>
        <div className="impl-bar-segs" role="tablist">
          <button role="tab" aria-selected={view === "site"}
            className={`impl-seg ${view === "site" ? "is-active" : ""}`}
            onClick={() => setView("site")}>公開サイト</button>
          <button role="tab" aria-selected={view === "admin"}
            className={`impl-seg ${view === "admin" ? "is-active" : ""}`}
            onClick={() => setView("admin")}>管理画面</button>
        </div>
        <div className="impl-bar-meta">
          <span className="impl-pill">localStorage 連動</span>
        </div>
      </header>
      <div className="impl-stage">
        {view === "site"  ? <PublicSite /> : <AdminApp />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ImplHost />);
