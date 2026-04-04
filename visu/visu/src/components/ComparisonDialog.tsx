import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ParallelCoordinates } from './ParrallelCoordinatePlot';
import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type FC } from 'react';
import type { SampleData } from '@/model/Sample';
import type {
  ComparisonResponse,
  ComparisonInfo,
} from '@/model/ComparisonInfo';
import type MatrixInfo from '@/model/MissingMatrix';
import MissingMatrix from '@/components/MissingMatrix';
import type { MatrixInfoAPIResponse } from '@/model/MissingMatrix';

interface ComparisonDialogProps {
  node1: BasicInfo | null;
  node2: BasicInfo | null;
  fetchSample: (uuid: string, count: number) => Promise<SampleData>;
  fetchRows: (uuid: string, row_indexes: number[]) => Promise<SampleData>;
  fetchComparison: (
    baseuuid: UUID,
    childuuid: UUID,
  ) => Promise<ComparisonResponse>;
  fetchMissingMatrix: (uuid: UUID) => Promise<MatrixInfoAPIResponse>;
}

export const ComparisonDialog: FC<ComparisonDialogProps> = observer(
  ({
    node1,
    node2,
    fetchSample,
    fetchRows,
    fetchComparison,
    fetchMissingMatrix,
  }) => {
    const [data1, setData1] = useState<SampleData>();
    const [data2, setData2] = useState<SampleData>();
    const [matrix1, setMatrix1] = useState<MatrixInfo>();
    const [matrix2, setMatrix2] = useState<MatrixInfo>();
    const [comparisonData, setComparisonData] = useState<ComparisonResponse>();
    const [hoveredDataset, setHoveredDataset] = useState<
      'data1' | 'data2' | null
    >();

    useEffect(() => {
      async function asyncFetch() {
        if (node1 == null || node2 == null) return;

        // fetch samples adn rows
        const sample = await fetchSample(node1.uuid, 256);
        setData1(sample);

        const firstColumn = node1.columns[0].name;
        const indexes: number[] = Object.keys(sample[firstColumn]).map(Number);
        const matchingData = await fetchRows(node2.uuid, indexes);
        setData2(matchingData);

        // fetch missing matrix Data for both
        const m1 = await fetchMissingMatrix(node1.uuid);
        setMatrix1(m1.info);

        const m2 = await fetchMissingMatrix(node2.uuid);
        setMatrix2(m2.info);

        // fetch comparison metrics
        const comparison = await fetchComparison(node1.uuid, node2.uuid);
        setComparisonData(comparison);
      }

      asyncFetch();
    }, [
      node1,
      node2,
      fetchSample,
      fetchRows,
      fetchComparison,
      fetchMissingMatrix,
    ]);

    const MetricTable = (title: string, info: ComparisonInfo) => (
      <div className="flex flex-col gap-2 mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {title}
        </h4>
        <div className="grid grid-cols-3 gap-4 font-medium text-sm mb-2 border-b pb-2">
          <div>Column</div>
          <div>WD</div>
          <div>MAD</div>
        </div>
        {node1?.columns
          .filter((col) => {
            const colMetricObj = info.find((m) => col.name in m);
            const metrics = colMetricObj ? colMetricObj[col.name] : null;
            return (
              metrics &&
              (Math.abs(metrics.WD) > 1e-9 || Math.abs(metrics.MAD) > 1e-9)
            );
          })
          .map((col) => {
            const colMetricObj = info.find((m) => col.name in m);
            const metrics = colMetricObj ? colMetricObj[col.name] : null;

            return (
              <div
                key={col.name}
                className="grid grid-cols-3 gap-4 text-sm border-b border-slate-100 pb-2 last:border-0"
              >
                <div className="font-medium">{col.name}</div>
                <div>{metrics?.WD != null ? metrics.WD.toFixed(4) : '—'}</div>
                <div>{metrics?.MAD != null ? metrics.MAD.toFixed(4) : '—'}</div>
              </div>
            );
          })}
      </div>
    );

    const ImputationList = ({ node }: { node: BasicInfo }) => (
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {node.filename}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {node.imputations && node.imputations.length > 0 ? (
            node.imputations.map((imp, idx) => {
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="max-w-37.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Feature
                      </p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {imp.feature}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Method
                    </span>
                    <code className="text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-blue-700 font-semibold">
                      {imp.method}
                    </code>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No methods recorded for this state.
            </p>
          )}
        </div>
      </div>
    );

    return (
      <Dialog>
        <DialogTrigger asChild disabled={node1 == null || node2 == null}>
          <Button variant="outline">Compare selected files</Button>
        </DialogTrigger>

        {node1 != null && node2 != null && (
          <DialogContent className="h-screen min-w-full max-w-none flex flex-col p-6 gap-0">
            <DialogHeader className="pb-4 border-b shrink-0">
              <DialogTitle>
                Comparing {node1.filename} to {node2.filename}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto flex flex-col gap-8 py-6">
              {data1 && data2 && (
                <div className="h-112.5 w-full shrink-0 bg-slate-50 rounded-lg p-4 border">
                  <ParallelCoordinates
                    data1={data1}
                    data2={data2}
                    basicInfo1={node1}
                    hoveredDataset={hoveredDataset}
                  />
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Button
                      onClick={() => setHoveredDataset('data1')}
                      className="bg-gray-500 hover:bg-red-500 text-white"
                    >
                      {node1.filename}
                    </Button>
                    <Button
                      onClick={() => setHoveredDataset('data2')}
                      className="bg-gray-500 hover:bg-blue-500 text-white"
                    >
                      {node2.filename}
                    </Button>
                    <Button
                      onClick={() => setHoveredDataset(null)}
                      className="bg-gray-500 hover:bg-black text-white"
                    >
                      none
                    </Button>
                  </div>
                </div>
              )}

              {/* matrix comparison */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-6">
                  Matrix Comparison
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                      {node1.filename}
                    </h4>
                    <div className="p-2 border rounded bg-slate-50/50">
                      {matrix1 ? (
                        <MissingMatrix matrixInfo={matrix1} />
                      ) : (
                        <p className="text-xs text-slate-400 p-4">
                          Loading matrix...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                      {node2.filename}
                    </h4>
                    <div className="p-2 border rounded bg-slate-50/50">
                      {matrix2 ? (
                        <MissingMatrix matrixInfo={matrix2} />
                      ) : (
                        <p className="text-xs text-slate-400 p-4">
                          Loading matrix...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* imputations info */}
                <div className="p-6 border rounded-lg shadow-sm bg-slate-50/50">
                  <h3 className="font-semibold text-lg mb-6">Imputations</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ImputationList node={node1} />
                    <ImputationList node={node2} />
                  </div>
                </div>

                {/* comparison stats info */}
                <div className="p-6 border rounded-lg shadow-sm bg-white">
                  <h3 className="font-semibold text-lg mb-6">
                    Distribution Metrics
                  </h3>

                  {!comparisonData ? (
                    <p className="text-sm text-muted-foreground">
                      Loading metrics...
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div>
                        {Object.entries(comparisonData.root).map(
                          ([uuid, info]) => (
                            <div key={uuid}>
                              {MetricTable(
                                `Parent to ${uuid === node1.uuid ? node1.filename : node2.filename}`,
                                info,
                              )}
                            </div>
                          ),
                        )}
                      </div>
                      <div>
                        {comparisonData.childtochild &&
                          MetricTable(
                            'Child to Child',
                            comparisonData.childtochild,
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    );
  },
);

export default ComparisonDialog;
