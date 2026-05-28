"use client";

/**
 * Per-shop mini Google Map.
 *
 * Loads the Maps JavaScript SDK once via APIProvider (shared across all
 * ShopMiniMap instances on the page). Each map shows a single marker
 * centered on the shop coordinates.
 *
 * Env:
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  Required. When missing, we render a
 *                                    text fallback instead of crashing —
 *                                    safe for preview deploys.
 *
 * The "Directions API" Cloud project capability is referenced by Google
 * Maps' built-in routing URL we link to (`google.com/maps/dir/`); no
 * client-side Directions API call is made here.
 */

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// Single shared map ID — used by AdvancedMarker / vector maps. A real
// project can create a map ID in Cloud Console for custom styling; for
// now `DEMO_MAP_ID` works without setup.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

export function ShopMiniMap({ shop, height = 220 }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="pub-shop-map pub-shop-map-fallback" style={{ height }}>
        <div className="pub-shop-map-fallback-inner">
          <span aria-hidden>🗺️</span>
          <p>地図を表示するには<br/><code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code><br/>を設定してください</p>
        </div>
      </div>
    );
  }
  const center = { lat: shop.lat, lng: shop.lng };
  return (
    <div className="pub-shop-map" style={{ height }}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={MAP_ID}
          defaultCenter={center}
          defaultZoom={16}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}>
          <AdvancedMarker position={center} title={shop.name}>
            <Pin background="#d63a3a" borderColor="#a72929" glyphColor="#fff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}

/** Google Maps directions URL — opens the user's Maps app/site. */
export function directionsUrl(shop) {
  const dest = encodeURIComponent(`${shop.name} ${shop.addr}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}
