import { useEffect, useRef, useState, type FC } from 'react';
import * as d3 from 'd3';
import type { BasicInfo } from '@/model/BasicInfo';
import { observer } from 'mobx-react-lite';
import type { SampleData } from '@/model/Sample';

interface ParallelCoordinatesProps {
  data1: SampleData;
  data2: SampleData;
  basicInfo1: BasicInfo;
  hoveredDataset?: 'data1' | 'data2' | null;
}

export const ParallelCoordinates: FC<ParallelCoordinatesProps> = observer(
  ({ data1, data2, basicInfo1, hoveredDataset = null }) => {
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
      if (
        !data1 ||
        !basicInfo1 ||
        !svgRef.current ||
        width === 0 ||
        height === 0
      )
        return;

      const columnNames = Object.keys(data1);
      if (columnNames.length === 0) return;

      // tag and combine datasets
      const parseData = (
        sourceData: typeof data1,
        sourceLabel: 'data1' | 'data2',
      ) => {
        if (!sourceData || Object.keys(sourceData).length === 0) return [];
        const rowIds = Object.keys(sourceData[columnNames[0]] || {});
        return rowIds.map((id) => {
          const row: Record<string, any> = { _id: id, _source: sourceLabel };
          columnNames.forEach((colName) => {
            row[colName] = sourceData[colName][id];
          });
          return row;
        });
      };
      const rowData1 = parseData(data1, 'data1');
      const rowData2 = parseData(data2, 'data2');
      const combinedData = [...rowData1, ...rowData2];

      // need this for label space
      const margin = { top: 30, right: 30, bottom: 10, left: 30 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const yScales: Record<string, any> = {};

      columnNames.forEach((dimName) => {
        const colInfo = basicInfo1.columns.find((c) => c.name === dimName);
        const isNumeric =
          colInfo?.dtype.includes('int') || colInfo?.dtype.includes('float');

        // handle catagorical and numeric
        if (isNumeric) {
          yScales[dimName] = d3
            .scaleLinear()
            .domain(
              d3.extent(combinedData, (d) => d[dimName] as number) as [
                number,
                number,
              ],
            )
            .range([innerHeight, 0])
            .nice();
        } else {
          // if catagorical, get unique values
          const uniqueValues = Array.from(
            new Set(combinedData.map((d) => String(d[dimName]))),
          );
          yScales[dimName] = d3
            .scalePoint()
            .domain(
              uniqueValues.filter((v) => v !== 'null' && v !== 'undefined'),
            )
            .range([innerHeight, 0])
            .padding(0.5);
        }
      });

      const xScale = d3
        .scalePoint()
        .range([0, innerWidth])
        .padding(1)
        .domain(columnNames);

      const pathGenerator = (d: any) => {
        const lineGen = d3
          .line<string>()
          .defined((p) => d[p] !== null && d[p] !== undefined)
          .x((p) => xScale(p)!)
          .y((p) => yScales[p](d[p]));
        return lineGen(columnNames);
      };

      const colorMap = {
        data1: '#a00000',
        data2: '#1a80bb',
      };

      // draw lines
      g.selectAll('.path')
        .data(combinedData)
        .enter()
        .append('path')
        .attr('class', 'path')
        .attr('d', pathGenerator)
        .style('fill', 'none')
        .style('stroke', (d) => colorMap[d._source as keyof typeof colorMap])
        .style('stroke-width', (d) => {
          if (hoveredDataset && d._source !== hoveredDataset) return 1;
          return 1.5;
        })
        .style('opacity', (d) => {
          // if nothing hovered, opacity = 0.4
          if (!hoveredDataset) return 0.4;
          // if something hovered, set opacity based on if this is selected
          return d._source === hoveredDataset ? 0.7 : 0.3;
        })
        .each(function (d) {
          // if this is selected, draw ontop of everything else
          if (hoveredDataset && d._source === hoveredDataset) {
            d3.select(this).raise();
          }
        });

      // draw axes
      const axes = g
        .selectAll('.axis')
        .data(columnNames)
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
        .attr('y', -15) // dont overlap graph
        .text((d) => d)
        .style('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size', '10px'); // TODO fix so that labels never overlap
    }, [data1, data2, basicInfo1, dimensions, hoveredDataset]);

    return (
      <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
        <svg
          ref={svgRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>
    );
  },
);
