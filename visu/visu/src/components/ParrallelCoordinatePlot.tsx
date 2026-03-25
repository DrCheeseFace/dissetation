import { useEffect, useRef, useState, type FC } from 'react';
import * as d3 from 'd3';
import type { BasicInfo } from '@/model/BasicInfo';

export type UUID = string;

interface ParallelCoordinatesProps {
  data: Record<string, Record<string, number | string>>;
  basicInfo: BasicInfo;
}

export const ParallelCoordinates: FC<ParallelCoordinatesProps> = ({
  data,
  basicInfo,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // resize observer setup
  useEffect(() => {
    if (!wrapperRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions((prev) => {
        if (prev.width !== width || prev.height !== height) {
          return { width, height };
        }
        return prev;
      });
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // parse and draw
  useEffect(() => {
    const { width, height } = dimensions;
    if (!data || !basicInfo || !svgRef.current || width === 0 || height === 0)
      return;

    const columnNames = Object.keys(data);
    if (columnNames.length === 0) return;

    const rowIds = Object.keys(data[columnNames[0]]);
    const rowData = rowIds.map((id) => {
      const row: Record<string, any> = { _id: id };
      columnNames.forEach((colName) => {
        row[colName] = data[colName][id];
      });
      return row;
    });

    // need this for label space
    const margin = { top: 30, right: 0, bottom: 10, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const chartDimensions = basicInfo.columns
      .map((col) => col.name)
      .filter((name) => columnNames.includes(name));

    const yScales: Record<string, any> = {};

    chartDimensions.forEach((dimName) => {
      const colInfo = basicInfo.columns.find((c) => c.name === dimName);
      const isNumeric =
        colInfo?.dtype.includes('int') || colInfo?.dtype.includes('float');

      // handle catagorical string and numeric values
      if (isNumeric) {
        yScales[dimName] = d3
          .scaleLinear()
          .domain(
            d3.extent(rowData, (d) => d[dimName] as number) as [number, number],
          )
          .range([innerHeight, 0])
          .nice();
      } else {
        // finds unique strings and treated as catagorical
        const uniqueValues = Array.from(
          new Set(rowData.map((d) => String(d[dimName]))),
        );
        yScales[dimName] = d3
          .scalePoint()
          .domain(uniqueValues.filter((v) => v !== 'null' && v !== 'undefined'))
          .range([innerHeight, 0])
          .padding(0.5);
      }
    });

    const xScale = d3
      .scalePoint()
      .range([0, innerWidth])
      .padding(1)
      .domain(chartDimensions);

    const pathGenerator = (d: any) => {
      const lineGen = d3
        .line<string>()
        .defined((p) => d[p] !== null && d[p] !== undefined)
        .x((p) => xScale(p)!)
        .y((p) => yScales[p](d[p]));
      return lineGen(chartDimensions);
    };

    g.selectAll('.path')
      .data(rowData)
      .enter()
      .append('path')
      .attr('class', 'path')
      .attr('d', pathGenerator)
      .style('fill', 'none')
      .style('stroke', 'steelblue')
      .style('stroke-width', 1.5)
      .style('opacity', 0.4);

    const axes = g
      .selectAll('.axis')
      .data(chartDimensions)
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('transform', (d) => `translate(${xScale(d)},0)`);

    axes.each(function (d) {
      d3.select(this).call(d3.axisLeft(yScales[d]));
    });

    axes
      .append('text')
      .style('text-anchor', 'middle')
      .attr('y', -15)
      .text((d) => d)
      .style('fill', 'black')
      .style('font-weight', 'bold')
      .style('font-size', '12px');
  }, [data, basicInfo, dimensions]);

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', height: '100%', minHeight: '300px' }}
    >
      <svg
        ref={svgRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};
