import React, { useEffect, useRef } from "react";
import L from "leaflet";

// Custom SVG Bus Icon generator with dynamic pulsing aura
const createBusIcon = (label, color = "#2563eb") => {
  return L.divIcon({
    className: "custom-bus-marker",
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          opacity: 0.25;
          animation: pulse-beacon 2s infinite ease-in-out;
        "></div>
        <div style="
          width: 36px;
          height: 36px;
          background: ${color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px ${color}99;
          border: 2.5px solid #ffffff;
          position: relative;
          z-index: 2;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.958-.24 1.961 0 2.92L1 17h2"></path>
            <path d="M14 17H9"></path>
            <circle cx="6.5" cy="17.5" r="2.5"></circle>
            <circle cx="16.5" cy="17.5" r="2.5"></circle>
          </svg>
        </div>
        <span style="
          position: absolute;
          bottom: -16px;
          background: #0f172a;
          color: #f8fafc;
          padding: 1px 7px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          letter-spacing: 0.02em;
          z-index: 3;
        ">${label}</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

// Custom Stop Icon
const createStopIcon = (sequence) => {
  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #ffffff;
        border: 2.5px solid #0284c7;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #0369a1;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      ">${sequence !== undefined ? sequence + 1 : "•"}</div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

function TransitMap({
  stops = [],
  buses = [],
  routeLine = [],
  height = "520px",
  center = [17.42, 78.47],
  zoom = 12,
  onStopClick,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const busesLayerRef = useRef(null);
  const glowPolylineRef = useRef(null);
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

      // Standard OpenStreetMap tiles (100% free, no API key, zero watermarks)
      L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

  // Update Route Polyline with Dual-Layer Glow
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (glowPolylineRef.current) {
      map.removeLayer(glowPolylineRef.current);
      glowPolylineRef.current = null;
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeLine && routeLine.length > 1) {
      // Outer ambient glow line
      glowPolylineRef.current = L.polyline(routeLine, {
        color: "#3b82f6",
        weight: 10,
        opacity: 0.25,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Inner crisp solid line
      routePolylineRef.current = L.polyline(routeLine, {
        color: "#1d4ed8",
        weight: 4.5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [45, 45] });
    }

    // Add Stop markers
    stops.forEach((stop, index) => {
      if (stop.latitude && stop.longitude) {
        const marker = L.marker([stop.latitude, stop.longitude], {
          icon: createStopIcon(stop.sequence !== undefined ? stop.sequence : index),
        });

        marker.bindPopup(`
          <div style="font-family: inherit; padding: 6px;">
            <div style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.04em;">
              Station #${(stop.sequence !== undefined ? stop.sequence : index) + 1}
            </div>
            <strong style="color: #0f172a; font-size: 14px; display: block; margin-top: 2px;">${stop.name}</strong>
            <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Hyderabad Metropolitan Transit</div>
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
          <div style="font-family: inherit; padding: 8px; min-width: 170px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #0f172a; font-size: 14px;">${bus.license_plate || `Bus ${bus.bus_id}`}</strong>
              <span style="background: #ecfdf5; color: #047857; font-size: 10px; font-weight: 700; padding: 2px 6px; borderRadius: 6px; text-transform: uppercase;">
                ${bus.status || "Active"}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span>Telemetry Speed:</span>
              <strong style="color: #2563eb;">${bus.speed ? `${Math.round(bus.speed)} km/h` : "Stationary"}</strong>
            </div>
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
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
      }}
    />
  );
}

export default TransitMap;
