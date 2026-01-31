import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const CompactAttribution = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const control = new L.Control({ position: "bottomleft" });

    control.onAdd = function () {
      const container = L.DomUtil.create("div", "compact-attribution");

      // prevent map interactions when tapping the control
      L.DomEvent.disableClickPropagation(container);

      container.innerHTML = `
        <button class="attrib-toggle" aria-label="Attribution">ⓘ</button>
        <div class="attrib-full" aria-hidden="true">&copy; OpenStreetMap contributors &copy; CARTO</div>
      `;

      // toggle handler
      const btn = container.querySelector(
        ".attrib-toggle",
      ) as HTMLElement | null;
      const full = container.querySelector(
        ".attrib-full",
      ) as HTMLElement | null;
      if (btn && full) {
        btn.addEventListener("click", () => {
          const shown = full.getAttribute("aria-hidden") === "false";
          full.setAttribute("aria-hidden", String(!shown));
          if (!shown) {
            full.classList.add("visible");
          } else {
            full.classList.remove("visible");
          }
        });
      }

      return container;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map]);

  return null;
};

export default CompactAttribution;
