import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Custom SVG Bus Icon generator
const createBusIcon = (label, color = "#2563eb") => {
  return L.divIcon({
    className: "custom-bus-marker",
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px ${color}88;
        border: 2px solid white;
        transition: all 0.3s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.958-.24 1.961 0 2.92L1 17h2"></path>
          <path d="M14 17H9"></path>
          <circle cx="6.5" cy="17.5" r="2.5"></circle>
          <circle cx="16.5" cy="17.5" r="2.5"></circle>
        </svg>
        <span style="
          position: absolute;
          bottom: -18px;
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.2);
        ">${label}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

// Custom Stop Icon
const createStopIcon = (sequence) => {
  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #0f172a;
        border: 2px solid #38bdf8;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #38bdf8;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
      ">${sequence !== undefined ? sequence + 1 : "•"}</div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function TransitMap({
  stops = [],
  buses = [],
  routeLine = [],
  height = "480px",
  center = [17.42, 78.47],
  zoom = 12,
  onStopClick,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const busesLayerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          maxZoom: 19,
        }
      ).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      busesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline and Stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeLine && routeLine.length > 1) {
      routePolylineRef.current = L.polyline(routeLine, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
    }

    stops.forEach((stop, index) => {
      if (stop.latitude && stop.longitude) {
        const marker = L.marker([stop.latitude, stop.longitude], {
          icon: createStopIcon(stop.sequence !== undefined ? stop.sequence : index),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${stop.name}</strong>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Station #${(stop.sequence !== undefined ? stop.sequence : index) + 1}</div>
          </div>
        `);

        if (onStopClick) marker.on("click", () => onStopClick(stop));
        marker.addTo(markersLayerRef.current);
      }
    });
  }, [stops, routeLine]);

  // Update Bus markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !busesLayerRef.current) return;

    busesLayerRef.current.clearLayers();

    buses.forEach((bus) => {
      if (bus.latitude && bus.longitude) {
        const color = bus.status === "active" ? "#10b981" : "#f59e0b";
        const marker = L.marker([bus.latitude, bus.longitude], {
          icon: createBusIcon(bus.license_plate || `Bus ${bus.bus_id}`, color),
          zIndexOffset: 1000,
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #0f172a; font-size: 13px;">${bus.license_plate || `Bus ${bus.bus_id}`}</strong>
            <div style="color: #059669; font-weight: 600; font-size: 11px; margin-top: 2px;">Status: ${bus.status || "Active"}</div>
            <div style="color: #64748b; font-size: 11px;">Speed: ${bus.speed ? `${Math.round(bus.speed)} km/h` : "Stationary"}</div>
          </div>
        `);

        marker.addTo(busesLayerRef.current);
      }
    });
  }, [buses]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        height,
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
      }}
    />
  );
}

export default TransitMap;
