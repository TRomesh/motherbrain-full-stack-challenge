import { Mercator, Graticule } from "@visx/geo";
import { feature } from "topojson-client";
import topology from "../wordtop.json";

export const background = "#f9f7e8";

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
  options?: Organization[] | null;
};

interface FeatureShape {
  type: "Feature";
  id: string;
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: { name: string };
}

// @ts-expect-error
const world = feature(topology, topology.objects.units) as {
  type: "FeatureCollection";
  features: FeatureShape[];
};

function VixMap({ width, height, events = false, options }: GeoMercatorProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;

  const CountryCodes = options?.map(({ country_code }) => country_code);

  return width < 10 ? null : (
    <svg
      width={width}
      height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background}
        rx={14}
      />
      <Mercator<FeatureShape>
        data={world.features}
        scale={scale}
        translate={[centerX, centerY + 50]}>
        {(mercator) => (
          <g>
            <Graticule
              graticule={(g) => mercator.path(g) || ""}
              stroke="rgba(33,33,33,0.05)"
            />
            {mercator.features.map(({ feature, path }, i) => {
              return (
                <path
                  key={`map-feature-${i}`}
                  d={path || ""}
                  fill={
                    CountryCodes?.includes(feature.id) ? "#8BC34A" : "#9d9aa1"
                  }
                  stroke={background}
                  strokeWidth={0.5}
                  onClick={() => {
                    alert(
                      `Clicked: ${feature.properties.name} (${feature.id})`
                    );
                  }}
                />
              );
            })}
          </g>
        )}
      </Mercator>
    </svg>
  );
}

export default VixMap;
