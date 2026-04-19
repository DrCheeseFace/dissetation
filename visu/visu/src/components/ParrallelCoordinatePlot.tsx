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
    const [columnOrder, setColumnOrder] = useState<string[]>([]);

    // initialize column order from data1
    useEffect(() => {
      if (data1) {
        setColumnOrder(Object.keys(data1));
      }
    }, [data1]);

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
        height === 0 ||
        columnOrder.length === 0
      )
        return;

      // tag and combine datasets
      const parseData = (
        sourceData: typeof data1,
        sourceLabel: 'data1' | 'data2',
      ) => {
        if (!sourceData || Object.keys(sourceData).length === 0) return [];
        const rowIds = Object.keys(sourceData[columnOrder[0]] || {});
        return rowIds.map((id) => {
          const row: Record<string, any> = { _id: id, _source: sourceLabel };
          columnOrder.forEach((colName) => {
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

      // Helper to identify any missing value representations
      const isMissing = (val: any) =>
        val === null ||
        val === undefined ||
        val === 'NaN' ||
        val === 'null' ||
        val === 'undefined' ||
        Number.isNaN(val);

      columnOrder.forEach((dimName) => {
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
          // if catagorical, get unique values and filter out missing texts
          const uniqueValues = Array.from(
            new Set(combinedData.map((d) => String(d[dimName]))),
          ).filter((v) => !isMissing(v));

          yScales[dimName] = d3
            .scalePoint()
            .domain(uniqueValues)
            .range([innerHeight, 0])
            .padding(0.5);
        }
      });

      const xScale = d3
        .scalePoint()
        .range([0, innerWidth])
        .padding(1)
        .domain(columnOrder);

      // track positions for dragging
      const position: Record<string, number> = {};
      columnOrder.forEach((d) => {
        position[d] = xScale(d)!;
      });
      const dragging: Record<string, number> = {};
      let activeOrder = [...columnOrder];

      // generator for non-missing data
      const pathGenerator = (d: any, currentOrder: string[] = columnOrder) => {
        const lineGen = d3
          .line<string>()
          .defined((p) => !isMissing(d[p]))
          .x((p) => (dragging[p] !== undefined ? dragging[p] : position[p]))
          .y((p) => yScales[p](d[p]));
        return lineGen(currentOrder);
      };

      // generator to route missing connections to the top
      const missingPathGenerator = (
        d: any,
        currentOrder: string[] = columnOrder,
      ) => {
        const path = d3.path();
        for (let i = 0; i < currentOrder.length - 1; i++) {
          const p1 = currentOrder[i];
          const p2 = currentOrder[i + 1];
          const v1 = d[p1];
          const v2 = d[p2];
          const m1 = isMissing(v1);
          const m2 = isMissing(v2);

          // If either point is missing, draw a line segment connecting to the top (y = 0)
          if (m1 || m2) {
            const x1 = dragging[p1] !== undefined ? dragging[p1] : position[p1];
            const y1 = m1 ? 0 : yScales[p1](v1);

            const x2 = dragging[p2] !== undefined ? dragging[p2] : position[p2];
            const y2 = m2 ? 0 : yScales[p2](v2);

            path.moveTo(x1, y1);
            path.lineTo(x2, y2);
          }
        }
        return path.toString();
      };

      const colorMap = {
        data1: '#a00000',
        data2: '#1a80bb',
      };

      // create groups for each row to hold both normal and missing lines together
      const rowGroups = g
        .selectAll('.row')
        .data(combinedData)
        .enter()
        .append('g')
        .attr('class', 'row')
        .style('opacity', (d) => {
          // if nothing hovered, opacity = 0.4
          if (!hoveredDataset) return 0.4;
          // if something hovered, set opacity based on if this is selected
          return d._source === hoveredDataset ? 0.7 : 0.1;
        })
        .each(function (d) {
          // if this is selected, draw on top of everything else
          if (hoveredDataset && d._source === hoveredDataset) {
            d3.select(this).raise();
          }
        });

      // draw standard lines
      rowGroups
        .append('path')
        .attr('class', 'path-normal')
        .attr('d', (d) => pathGenerator(d))
        .style('fill', 'none')
        .style('stroke', (d) => colorMap[d._source as keyof typeof colorMap])
        .style('stroke-width', (d) => {
          if (hoveredDataset && d._source !== hoveredDataset) return 1;
          return 1.5;
        });

      // draw purple missing data lines
      rowGroups
        .append('path')
        .attr('class', 'path-missing')
        .attr('d', (d) => missingPathGenerator(d))
        .style('fill', 'none')
        .style('stroke', 'purple')
        .style('stroke-width', (d) => {
          if (hoveredDataset && d._source !== hoveredDataset) return 1;
          return 1.5;
        });

      // draw axes
      const axes = g
        .selectAll('.axis')
        .data(columnOrder)
        .enter()
        .append('g')
        .attr('class', 'axis')
        .attr('transform', (d) => `translate(${position[d]},0)`)
        .call(
          d3
            .drag<SVGGElement, string>()
            .subject((d) => ({ x: position[d], y: 0 }))
            .on('start', function (_, d) {
              dragging[d] = position[d];
              d3.select(this).raise(); // Bring dragged axis to front
            })
            .on('drag', function (event, d) {
              // bound drag to SVG width
              dragging[d] = Math.min(innerWidth, Math.max(0, event.x));

              // dynamically reorder arrays based on current X positions
              activeOrder.sort((a, b) => {
                const posA =
                  dragging[a] !== undefined ? dragging[a] : position[a];
                const posB =
                  dragging[b] !== undefined ? dragging[b] : position[b];
                return posA - posB;
              });

              xScale.domain(activeOrder);

              // update axis positions
              g.selectAll<SVGGElement, string>('.axis').attr(
                'transform',
                function (col) {
                  if (col === d) return `translate(${dragging[col]},0)`; // dragged item follows cursor
                  position[col] = xScale(col)!;
                  return `translate(${position[col]},0)`; // others snap to grid
                },
              );

              // update path strings smoothly for both standard and missing lines
              g.selectAll<SVGPathElement, any>('.path-normal').attr('d', (pd) =>
                pathGenerator(pd, activeOrder),
              );
              g.selectAll<SVGPathElement, any>('.path-missing').attr(
                'd',
                (pd) => missingPathGenerator(pd, activeOrder),
              );
            })
            .on('end', function (_, d) {
              delete dragging[d];
              setColumnOrder([...activeOrder]);
            }),
        );

      axes.each(function (d) {
        d3.select(this).call(d3.axisLeft(yScales[d]));
      });

      axes
        .append('text')
        .style('cursor', 'grab')
        .style('text-anchor', 'middle')
        .attr('y', -15) // dont overlap graph
        .text((d) => d)
        .style('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size', '10px'); // TODO fix so that labels never overlap
    }, [data1, data2, basicInfo1, dimensions, hoveredDataset, columnOrder]);

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
