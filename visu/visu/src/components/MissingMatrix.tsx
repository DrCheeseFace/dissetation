import { useEffect, useRef, useState, type FC } from 'react';
import * as d3 from 'd3';
import type MatrixInfo from '@/model/MissingMatrix';

interface MissingMatrixProps {
  matrixInfo: MatrixInfo;
}

const MissingMatrix: FC<MissingMatrixProps> = ({ matrixInfo }) => {
  const d3Container = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 500 });

  // handle resizing
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        const calculatedHeight = Math.min(
          Math.max(matrixInfo.data.length * 2, 350),
          700,
        );
        setDimensions({ width, height: calculatedHeight });
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [matrixInfo.data.length]);

  useEffect(() => {
    if (
      !matrixInfo?.columns ||
      !matrixInfo?.data ||
      !matrixInfo?.metadata ||
      !d3Container.current ||
      dimensions.width === 0
    ) {
      return;
    }

    const { columns, data, metadata } = matrixInfo;
    const numRows = data.length;

    if (numRows === 0 || columns.length === 0) return;

    const rowStep = Math.max(
      1,
      Math.floor(metadata.original_rows / metadata.sampled_rows),
    );

    const columnScales = columns.map((_, colIndex) => {
      const colValues = data
        .map((row) => row[colIndex])
        .filter((v): v is number => v !== null && typeof v === 'number');

      const minVal = d3.min(colValues) ?? 0;
      const maxVal = d3.max(colValues) ?? 1;

      return d3
        .scaleLinear<string>()
        .domain([minVal, minVal === maxVal ? minVal + 1 : maxVal])
        .range(['#e0e0e0', '#202020']);
    });

    const innerWidth = dimensions.width;
    const innerHeight = dimensions.height;

    const container = d3.select(d3Container.current);
    container.selectAll('*').remove();

    const tooltip = d3
      .select(tooltipRef.current)
      .style('position', 'fixed')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '100')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');

    const svg = container
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const xScale = d3
      .scaleBand<string>()
      .domain(columns)
      .range([0, innerWidth])
      .paddingInner(0.01);

    const yScale = d3
      .scaleBand<number>()
      .domain(d3.range(numRows))
      .range([0, innerHeight])
      .paddingInner(0);

    const MISSING_COLOR = '#ff4d4d';

    const rowGroups = svg
      .selectAll<SVGGElement, (number | null)[]>('.matrix-row')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'matrix-row')
      .attr('transform', (_, i) => `translate(0, ${yScale(i) ?? 0})`);

    rowGroups
      .selectAll<SVGRectElement, number | null>('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (_, i) => xScale(columns[i]) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth() || 1)
      .attr('fill', (d, i) => (d === null ? MISSING_COLOR : columnScales[i](d)))
      .style('stroke', 'none')
      .on('mouseover', function () {
        d3.select(this).style('stroke', '#000').style('stroke-width', '1px');
        tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function (event) {
        const rectNode = event.currentTarget as SVGRectElement;
        const rowNode = rectNode.parentNode as SVGGElement;
        const rowData = d3.select(rowNode).datum() as (number | null)[];

        const rowIndex = data.indexOf(rowData);
        const colIndex = Array.from(rowNode.children).indexOf(rectNode);

        const actualRow = rowIndex * rowStep;
        const colName = columns[colIndex];

        tooltip
          .html(
            `<strong>Feature:</strong> ${colName}<br/><strong>Row:</strong> ${actualRow}`,
          )
          .style('top', `${event.clientY - 45}px`)
          .style('left', `${event.clientX + 15}px`);
      })
      .on('mouseleave', function () {
        d3.select(this).style('stroke', 'none');
        tooltip.style('visibility', 'hidden');
      });
  }, [matrixInfo, dimensions]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '350px',
        position: 'relative',
      }}
    >
      <div ref={d3Container} />
      <div ref={tooltipRef} />
    </div>
  );
};

export default MissingMatrix;
