import type { ColumnSummary } from '@/model/DashboardInfo';
import { observer } from 'mobx-react-lite';
import { useState, type FC } from 'react';
import { TypographyP } from './typography';
import * as d3 from 'd3';

interface GlyphProps {
  columnSummary?: ColumnSummary;
  onClick?: () => void;
  selectedGlyphIdx?: number;
}

export const Glyph: FC<GlyphProps> = observer(({ columnSummary, onClick }) => {
  columnSummary; // TODO REMOVE ME
  onClick; // TODO REMOVE ME

  return (
    <>
      <svg width={'100%'} height={'100%'} style={{ overflow: 'visible' }}>
        <rect
          width={'100%'}
          height={'100%'}
          stroke="black"
          strokeWidth={'1px'}
          fillOpacity={'0%'}
        />
      </svg>
    </>
  );
});

export const Temp: FC<GlyphProps> = observer(({ columnSummary, onClick }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  columnSummary; // TODO REMOVE ME
  onClick; // TODO REMOVE ME

  const data = [30, 80, 45, 90, 55, 70, 40, 65, 50];

  const width = 400;
  const height = 200;
  const margin = 30;

  const x = d3
    .scaleBand()
    .domain(data.map((_, i) => i.toString()))
    .range([margin, width - margin])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data) || 100])
    .range([height - margin, margin]);

  const lineGenerator = d3
    .line<number>()
    .x((_, i) => (x(i.toString()) || 0) + x.bandwidth() / 2)
    .y((d) => y(d))
    .curve(d3.curveMonotoneX);

  return (
    <>
      <TypographyP>Combo Chart: Bar + Line Overlay</TypographyP>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <g fill="currentColor" opacity="0.2">
          {data.map((d, i) => (
            <rect
              key={`bar-${i}`}
              x={x(i.toString())}
              y={y(d)}
              width={x.bandwidth()}
              height={height - margin - y(d)}
              rx={4}
            />
          ))}
        </g>

        <path
          fill="none"
          stroke="#4e79a7"
          strokeWidth="2"
          d={lineGenerator(data) || ''}
        />

        <g>
          {data.map((d, i) => (
            <circle
              key={`dot-${i}`}
              cx={(x(i.toString()) || 0) + x.bandwidth() / 2}
              cy={y(d)}
              r={hoveredIndex === i ? 6 : 3}
              fill={hoveredIndex === i ? '#4e79a7' : 'white'}
              stroke="#4e79a7"
              strokeWidth="2"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            />
          ))}
        </g>
      </svg>
    </>
  );
});

export default Glyph;
