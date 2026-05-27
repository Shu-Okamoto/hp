import { PublicChrome } from "../components/PublicSite";

/**
 * Layout for all public-site routes. Wraps each page in the chrome
 * (AppBar + scroll + Footer + PriceCTA + BottomNav).
 *
 * The `(public)` segment is a route group — it doesn't appear in the URL
 * but lets us share this layout across `/`, `/products`, `/news`, etc.
 * without polluting them.
 */
export default function PublicLayout({ children }) {
  return <PublicChrome>{children}</PublicChrome>;
}
