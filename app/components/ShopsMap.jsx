"use client";

/**
 * Shops map.
 *
 * Renders a single Google Map showing every shop as a numbered pin. The
 * map auto-fits its viewport to include all markers, so adding/removing a
 * shop in seed.js just works without retuning zoom or center.
 *
 * Env:
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  Required. Renders a text fallback
 *                                    when missing so preview/local builds
 *                                    stay green.
 *
 * The "Directions API" Cloud capability is referenced indirectly by the
 * `directionsUrl()` helper — it opens Google Maps' built-in routing UI,
 * no client-side Directions API call is made.
 */

import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";

// Optional vector-map style ID (Cloud Console → Maps Management → Map IDs).
// Falls back to Google's DEMO_MAP_ID for zero-config deploys.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

/** Fits the map viewport to include every shop pin with padding. */
function AutoFit({ shops }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !shops?.length || typeof google === "undefined") return;
    if (shops.length === 1) {
      map.setCenter({ lat: shops[0].lat, lng: shops[0].lng });
      map.setZoom(16);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    shops.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, shops]);
  return null;
}

export function MultiShopMap({ shops, height = 380 }) {
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
  // Initial center/zoom — overridden by AutoFit once the SDK is ready.
  const initial = shops?.[0]
    ? { lat: shops[0].lat, lng: shops[0].lng }
    : { lat: 34.15, lng: 132.20 };
  return (
    <div className="pub-shop-map" style={{ height }}>
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={MAP_ID}
          defaultCenter={initial}
          defaultZoom={13}
          gestureHandling="cooperative"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}>
          <AutoFit shops={shops} />
          {shops.map((s, i) => (
            <AdvancedMarker key={s.id} position={{ lat: s.lat, lng: s.lng }} title={s.name}>
              <Pin background="#d63a3a" borderColor="#a72929" glyphColor="#fff" glyph={String(i + 1)} />
            </AdvancedMarker>
          ))}
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
