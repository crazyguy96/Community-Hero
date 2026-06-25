import { useEffect, useRef, useState } from "react";
import type { CivicCase } from "@/lib/case-store";

declare global {
  interface Window {
    google?: typeof google;
    __gmapsLoadingPromise?: Promise<void>;
  }
}

// Read from Vite env. Set VITE_GOOGLE_MAPS_API_KEY in your .env file —
// a Maps Demo Key (https://mapsplatform.google.com/maps-demo-key/) works
// here with zero billing setup, good enough for a hackathon demo.
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const MAP_ID = "DEMO_MAP_ID";

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoadingPromise) return window.__gmapsLoadingPromise;

  window.__gmapsLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=marker&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    document.head.appendChild(script);
  });
  return window.__gmapsLoadingPromise;
}

const severityColor: Record<CivicCase["severity"], string> = {
  Low: "#506680",
  Medium: "#F59E0B",
  High: "#C65D3B",
  Critical: "#C0392B",
};
const resolvedColor = "#2E7D32";

export function RealMap({
  cases,
  onSelect,
  selectedId,
}: {
  cases: CivicCase[];
  onSelect: (c: CivicCase) => void;
  selectedId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [status, setStatus] = useState<"missing-key" | "loading" | "ready" | "error">(
    API_KEY ? "loading" : "missing-key",
  );

  useEffect(() => {
    if (!API_KEY || !containerRef.current) return;
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center: { lat: 28.5675, lng: 77.2434 },
          zoom: 11,
          mapId: MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;

    const seen = new Set<string>();
    for (const c of cases) {
      seen.add(c.id);
      const color = c.status === "Resolved" ? resolvedColor : severityColor[c.severity];
      let marker = markersRef.current.get(c.id);
      if (!marker) {
        const pin = document.createElement("div");
        pin.style.width = "14px";
        pin.style.height = "14px";
        pin.style.borderRadius = "50%";
        pin.style.border = "2px solid #FBF8F1";
        pin.style.cursor = "pointer";
        marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: c.lat, lng: c.lng },
          content: pin,
        });
        marker.addListener("click", () => onSelect(c));
        markersRef.current.set(c.id, marker);
      }
      const el = marker.content as HTMLDivElement;
      el.style.background = color;
      el.style.boxShadow = c.id === selectedId ? `0 0 0 4px ${color}33` : "none";
    }
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.map = null;
        markersRef.current.delete(id);
      }
    }
  }, [cases, status, selectedId, onSelect]);

  if (status === "missing-key") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
        <p className="font-mono uppercase tracking-widest">Google Maps not configured</p>
        <p className="max-w-xs">
          Add <code className="rounded bg-muted px-1.5 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> to
          your .env to render the live Google Map here. Falling back to the illustrated panel below.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Couldn't load Google Maps. Check the API key and that the Maps JavaScript API is enabled.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
