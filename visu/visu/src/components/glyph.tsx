import type {
  CategoricalHistogram,
  ColumnSummary,
  NumericHistogram,
} from '@/model/DashboardInfo';
import { observer } from 'mobx-react-lite';
import { useMemo, type FC } from 'react';
import * as d3 from 'd3';
import { useRootStore } from '@/mobx/rootstore';

interface GlyphProps {
  columnSummary: ColumnSummary;
}

export const Glyph: FC<GlyphProps> = observer(({ columnSummary }) => {
  const { dashboardStore } = useRootStore();

  const total =
    (columnSummary.non_null_count || 0) + (columnSummary.null_count || 0);
  let missingPct = total > 0 ? (columnSummary.null_count / total) * 100 : 0;

  const leftHistogramData = useMemo(() => {
    if (!columnSummary.histogram) return null;

    if (columnSummary.histogram.data_type === 'numeric') {
      const { counts, bin_edges } = columnSummary.histogram as NumericHistogram;
      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(counts) || 0])
        .range([0, 45]);
      const yScale = d3
        .scaleLinear()
        .domain([d3.min(bin_edges) || 0, d3.max(bin_edges) || 0])
        .range([100, 0]);

      return counts.map((count, i) => {
        const yTop = yScale(bin_edges[i + 1]);
        const yBottom = yScale(bin_edges[i]);
        const barWidth = xScale(count);
        return {
          x: 50 - barWidth,
          y: yTop,
          width: barWidth,
          height: Math.abs(yBottom - yTop),
        };
      });
    }

    if (columnSummary.histogram.data_type === 'categorical') {
      const { counts } = columnSummary.histogram as CategoricalHistogram;
      const entries = Object.entries(counts);

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => d[1]) || 0])
        .range([0, 45]);

      const yScale = d3
        .scaleBand()
        .domain(entries.map((d) => d[0]))
        .range([0, 100]);

      return entries.map(([key, count]) => {
        const barWidth = xScale(count);
        return {
          x: 50 - barWidth,
          y: yScale(key) || 0,
          width: barWidth,
          height: yScale.bandwidth(),
        };
      });
    }

    return null;
  }, [columnSummary.histogram]);

  const rightHistogramData = useMemo(() => {
    if (dashboardStore.selectedGlyphIdx === -1) return null;
    if (!columnSummary.joint_missingness_histograms) return null;

    const histogram =
      columnSummary.joint_missingness_histograms[
        dashboardStore.selectedGlyphIdx
      ];
    if (!histogram) return null;

    if (histogram.data_type === 'numeric') {
      const { counts, bin_edges } = histogram as NumericHistogram;
      const maxVal = d3.max(counts) || 0; // handle counts of 0
      if (maxVal === 0) return [];

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(counts) || 0])
        .range([0, 45]);
      const yScale = d3
        .scaleLinear()
        .domain([d3.min(bin_edges) || 0, d3.max(bin_edges) || 0])
        .range([100, 0]);

      return counts.map((count, i) => {
        const yTop = yScale(bin_edges[i + 1]);
        const yBottom = yScale(bin_edges[i]);
        const barWidth = xScale(count);
        return {
          x: 50,
          y: yTop,
          width: barWidth,
          height: Math.abs(yBottom - yTop),
        };
      });
    }

    if (histogram.data_type === 'categorical') {
      const { counts } = histogram as CategoricalHistogram;
      const entries = Object.entries(counts);

      const maxVal = d3.max(entries, (d) => d[1]) || 0; // handle counts of 0
      if (maxVal === 0) return [];

      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(entries, (d) => d[1]) || 0])
        .range([0, 45]);

      const yScale = d3
        .scaleBand()
        .domain(entries.map((d) => d[0]))
        .range([0, 100]);

      return entries.map(([key, count]) => {
        const barWidth = xScale(count);
        return {
          x: 50,
          y: yScale(key) || 0,
          width: barWidth,
          height: yScale.bandwidth(),
        };
      });
    }

    return null;
  }, [dashboardStore.selectedGlyphIdx]);

  const jointBar = useMemo(() => {
    if (
      dashboardStore.selectedGlyphIdx === -1 ||
      dashboardStore.selectedGlyphIdx === undefined
    )
      return null;

    const jointPercentageOfMissing =
      columnSummary.joint_missingness[dashboardStore.selectedGlyphIdx] || 0;

    const actualHeight = (jointPercentageOfMissing / 100) * missingPct;

    return {
      height: actualHeight,
      y: 100 - actualHeight,
    };
  }, [
    columnSummary.joint_missingness,
    dashboardStore.selectedGlyphIdx,
    missingPct,
  ]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        {/* outline whole graph */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="none"
          stroke="black"
          strokeWidth="1px"
        />

        {/* left histogram */}
        {leftHistogramData?.map((bar, i) => (
          <rect
            key={i}
            x={`${bar.x}%`}
            y={`${bar.y}%`}
            width={`${bar.width}%`}
            height={`${bar.height}%`}
            fill="blue"
            fillOpacity="0.6"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}

        {/* right histogram */}
        {rightHistogramData?.map((bar, i) => (
          <rect
            key={i}
            x={`${bar.x}%`}
            y={`${bar.y}%`}
            width={`${bar.width}%`}
            height={`${bar.height}%`}
            fill="#AF302E"
            fillOpacity="0.6"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}

        {/* missing % bar  */}
        <rect
          x="50%"
          y={`${100 - missingPct}%`}
          width="50%"
          height={`${missingPct}%`}
          fill="blue"
          fillOpacity="0.4"
        />

        {/* selected missing % bar  */}
        {jointBar && (
          <rect
            x="50%"
            y={`${jointBar.y}%`}
            width="50%"
            height={`${jointBar.height}%`}
            fill="red"
            fillOpacity="0.6"
          />
        )}

        {/* middle dotted divider */}
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="black"
          strokeWidth="0.5px"
          strokeDasharray="4"
        />
      </svg>
    </div>
  );
});

export default Glyph;
