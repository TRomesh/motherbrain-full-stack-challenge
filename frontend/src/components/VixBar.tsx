import React from "react";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { CHART_COLORS } from "../util/common";

type BarChartProps = {
  data: Organization[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

// Define the BarChart component
const VixBar: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  margin = { top: 20, right: 30, bottom: 20, left: 40 },
}) => {
  // Bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: data?.map((d) => d.company_name),
    padding: 0.4,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map((d) => parseInt(d.funding_total_usd)))],
  });

  return width < 10 ? null : (
    <svg
      width={width}
      height={height}>
      <Group
        left={margin.left}
        top={margin.top}>
        {data.map((d, i) => (
          <Bar
            key={d.company_name}
            x={xScale(d.company_name)}
            y={yScale(parseInt(d.funding_total_usd))}
            width={xScale.bandwidth()}
            height={yMax - yScale(parseInt(d.funding_total_usd))}
            fill={CHART_COLORS[i]}
          />
        ))}
        <AxisLeft
          scale={yScale}
          stroke="#1b1a1e"
          tickStroke="#1b1a1e"
          tickLabelProps={() => ({
            fill: "#1b1a1e",
            fontSize: 11,
            textAnchor: "end",
            dy: "0.33em",
          })}
        />
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke="#1b1a1e"
          tickStroke="#1b1a1e"
          tickLabelProps={() => ({
            fill: "#1b1a1e",
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </Group>
    </svg>
  );
};

export default VixBar;
