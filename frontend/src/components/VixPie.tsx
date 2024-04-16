import { useState } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { CHART_COLORS } from "../util/common";

function VixPie({
  label,
  entity,
  data,
}: {
  label?: string;
  entity?: string;
  data?: Funding[] | null;
}) {
  const [active, setActive] = useState<any>(null);
  const width = 400;
  const half = width / 2;
  return (
    <main>
      {data?.length ? (
        <svg
          width={width}
          height={width}>
          <Group
            top={half}
            left={half}>
            <Pie
              data={data}
              pieValue={(data) => parseInt(data.raised_amount_usd) * data.ratio}
              outerRadius={half}
              innerRadius={({ data }) => {
                const size =
                  active && active.company_name === data.company_name ? 40 : 30;
                return half - size;
              }}
              padAngle={0.01}>
              {(pie) => {
                return pie?.arcs.map((arc, i) => {
                  return (
                    <g
                      key={arc.data.company_name}
                      onMouseEnter={() => setActive(arc.data)}
                      onMouseLeave={() => setActive(null)}>
                      <path
                        d={pie.path(arc) ?? undefined}
                        fill={CHART_COLORS[i]}></path>
                    </g>
                  );
                });
              }}
            </Pie>

            {active ? (
              <>
                <Text
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={20}
                  dy={-20}>
                  {`$${Math.floor(active.raised_amount_usd * active.ratio)}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill={active.color}
                  fontSize={20}
                  dy={20}>
                  {`$${active.raised_amount_usd} ${active.company_name}`}
                </Text>
              </>
            ) : (
              <>
                <Text
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={40}
                  dy={-20}>
                  {`$${Math.floor(
                    data.reduce(
                      (acc, item) =>
                        acc + parseInt(item.raised_amount_usd) * item.ratio,
                      0
                    )
                  )}`}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize={18}
                  dy={0}>
                  {entity ? entity : ""}
                </Text>

                <Text
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize={15}
                  dy={20}>
                  {data?.length
                    ? `${data?.length} ${label}`
                    : "Select Investor"}
                </Text>
              </>
            )}
          </Group>
        </svg>
      ) : null}
    </main>
  );
}

export default VixPie;
