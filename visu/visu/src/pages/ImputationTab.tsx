import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnInfo } from '@/model/BasicInfo';
import { observer } from 'mobx-react-lite';
import type { SimpleImputationStrategy } from '@/model/SimpleImpute';
import { Loader2 } from 'lucide-react';

const ImputationTab = observer(() => {
  const { fileStore } = useRootStore();

  const [selectedColumn, setSelectedColumn] = useState<ColumnInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [newFilename, setNewFilename] = useState('');

  const handleApplyImputation = async () => {
    if (!selectedColumn || !selectedMethod || !newFilename || fileStore.loading)
      return;

    await fileStore.simpleImpute(
      newFilename,
      selectedColumn.name,
      selectedMethod as SimpleImputationStrategy,
    );

    closeAll();
  };

  const closeAll = () => {
    if (fileStore.loading) return;
    setSelectedColumn(null);
    setSelectedMethod(null);
    setNewFilename('');
  };

  const simpleImputationMethods = ['mean', 'median', 'mode'];

  return (
    <div className="relative text-black p-5 min-h-screen">
      {(selectedColumn || selectedMethod) && (
        <div className="fixed inset-0 z-0" onClick={closeAll} />
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-6">
          <Card className="w-fit py-1 bg-white shadow-sm">
            <Table>
              <TableCaption>
                Features found in {fileStore.parentFile?.filename}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-37.5">Name</TableHead>
                  <TableHead className="w-fit">Type</TableHead>
                  <TableHead className="w-fit text-center">
                    Null Count
                  </TableHead>
                  <TableHead className="w-fit text-right">
                    Non Null Count
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileStore.parentFile?.columns.map((column: ColumnInfo) => (
                  <TableRow
                    key={column.index}
                    onClick={(e) => {
                      if (fileStore.loading) return;
                      e.stopPropagation();
                      setSelectedColumn(column);
                      setSelectedMethod(null);
                    }}
                    className={`cursor-pointer transition-colors ${
                      selectedColumn?.index === column.index
                        ? 'bg-slate-200 hover:bg-slate-200'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      {column.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {column.dtype}
                    </TableCell>
                    <TableCell className="text-center">
                      {column.null_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {column.non_null_count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div
            onClick={(e) => e.stopPropagation()}
            className={`transition-all duration-300 ease-out shrink-0 ${
              selectedColumn
                ? 'opacity-100 translate-x-0 w-64'
                : 'opacity-0 -translate-x-4 w-0 overflow-hidden pointer-events-none'
            }`}
          >
            <Card className="w-64 border-slate-300 shadow-xl bg-white">
              <CardHeader className="pb-3 border-b mb-2">
                <CardTitle className="text-lg">
                  Method:{' '}
                  <span className="text-blue-600 truncate block text-sm">
                    {selectedColumn?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-2">
                {simpleImputationMethods.map((method) => (
                  <Button
                    key={method}
                    variant={selectedMethod === method ? 'default' : 'outline'}
                    disabled={fileStore.loading}
                    className="w-full justify-start capitalize"
                    onClick={() => {
                      setSelectedMethod(method);
                      setNewFilename(
                        `${fileStore.parentFile?.filename?.split('.')[0]}_${method}`,
                      );
                    }}
                  >
                    {method}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className={`transition-all duration-300 ease-out shrink-0 ${
              selectedMethod
                ? 'opacity-100 translate-x-0 w-72'
                : 'opacity-0 -translate-x-4 w-0 overflow-hidden pointer-events-none'
            }`}
          >
            <Card className="w-72 border-slate-300 shadow-xl bg-white">
              <CardHeader className="pb-3 border-b mb-2">
                <CardTitle className="text-lg">Save As</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    New Filename
                  </label>
                  <Input
                    value={newFilename}
                    disabled={fileStore.loading}
                    onChange={(e) => setNewFilename(e.target.value)}
                    placeholder="Enter filename..."
                    className="bg-slate-50 text-black"
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newFilename || fileStore.loading}
                  onClick={handleApplyImputation}
                >
                  {fileStore.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Imputing...
                    </>
                  ) : (
                    'Apply Imputation'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImputationTab;
