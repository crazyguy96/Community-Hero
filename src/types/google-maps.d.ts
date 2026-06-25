// Minimal hand-written declarations for the small slice of the Google Maps
// JavaScript API used in RealMap.tsx. Kept deliberately narrow instead of
// pulling in the full @types/google.maps package, so the project has no
// extra install-time dependency for this one integration.

declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts: MapOptions);
  }

  interface MapOptions {
    center: { lat: number; lng: number };
    zoom: number;
    mapId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
  }

  namespace marker {
    class AdvancedMarkerElement {
      constructor(opts: AdvancedMarkerElementOptions);
      map: Map | null;
      content: Element | null;
      addListener(eventName: string, handler: () => void): void;
    }

    interface AdvancedMarkerElementOptions {
      map?: Map | null;
      position: { lat: number; lng: number };
      content?: Element | null;
    }
  }
}
