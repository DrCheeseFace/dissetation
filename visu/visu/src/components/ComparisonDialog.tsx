import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ParallelCoordinates } from './ParrallelCoordinatePlot';
import type { BasicInfo } from '@/model/BasicInfo';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type FC } from 'react';
import type { SampleData } from '@/model/Sample';

interface ComparisonDialogProps {
  node1: BasicInfo;
  node2: BasicInfo;
  fetchSample: (uuid: string, count: number) => Promise<SampleData>;
}

export const ComparisonDialog: FC<ComparisonDialogProps> = observer(
  ({ node1, node2, fetchSample }) => {
    const [data1, setData1] = useState<SampleData>();
    const [data2, setData2] = useState<SampleData>();
    const [hoveredDataset, setHoveredDataset] = useState<
      'data1' | 'data2' | null
    >();

    useEffect(() => {
      async function fetch() {
        setData1(await fetchSample(node1.uuid, 256));
        setData2(await fetchSample(node2.uuid, 256));
      }
      fetch();
    }, [node1, node2]);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>

        <DialogContent className="h-screen min-w-full max-w-none flex flex-col p-6 gap-0">
          <DialogHeader className="pb-4 border-b shrink-0">
            <DialogTitle>
              Comparing {node1.filename} to {node2.filename}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto flex flex-col gap-8 py-6">
            {/* parralel plot  */}
            {data1 && data2 && (
              <div className="h-112.5 w-full shrink-0 bg-slate-50 rounded-lg p-4 border">
                <ParallelCoordinates
                  data1={data1}
                  data2={data2}
                  basicInfo1={node1}
                  hoveredDataset={hoveredDataset} // TODO HOVERED THING
                />

                <div className="grid grid-cols-3 gap-4">
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

            {/* TODO CHANGE ME */}
            <div className="flex flex-col gap-4">
              <div className="p-4 border rounded-lg shadow-sm">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Metrics comparison
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-100 rounded">Metric A: 12%</div>
                  <div className="p-3 bg-slate-100 rounded">Metric B: 55%</div>
                  <div className="p-3 bg-slate-100 rounded">Metric C: 32%</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg shadow-sm">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Change Logs
                </h3>
                <p className="text-sm">
                  No significant anomalies detected between datasets.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
