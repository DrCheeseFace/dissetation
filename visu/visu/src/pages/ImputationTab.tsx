import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
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

    resetSelection();
  };

  const resetSelection = () => {
    if (fileStore.loading) return;
    setSelectedColumn(null);
    setSelectedMethod(null);
    setNewFilename('');
  };

  const simpleImputationMethods = ['mean', 'median', 'mode'];

  return (
    <div className="text-black p-6 min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Imputation</h2>
          <p className="text-muted-foreground">
            Handle missing values in your dataset by applying simple imputation
            strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2 bg-white shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-lg leading-none">
                Dataset Features
              </CardTitle>
              <CardDescription className="mt-1">
                Select a column to apply imputation. Features from{' '}
                {fileStore.parentFile?.filename}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="w-[40%] pl-6 h-10">Name</TableHead>
                    <TableHead className="h-10">Type</TableHead>
                    <TableHead className="text-center h-10">
                      Null Count
                    </TableHead>
                    <TableHead className="text-right pr-6 h-10">
                      Non-Null Count
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileStore.parentFile?.columns.map((column: ColumnInfo) => {
                    const isSelected = selectedColumn?.index === column.index;

                    const totalCount =
                      column.null_count + column.non_null_count;
                    const missingPercentage =
                      totalCount > 0
                        ? (column.null_count / totalCount) * 100
                        : 0;

                    return (
                      <TableRow
                        key={column.index}
                        onClick={() => {
                          if (fileStore.loading) return;
                          setSelectedColumn(column);
                          setSelectedMethod(null);
                          setNewFilename('');
                        }}
                        style={{
                          backgroundImage: `linear-gradient(to right, rgba(34, 197, 94, 0.15) ${missingPercentage}%, transparent ${missingPercentage}%)`,
                        }}
                        className={`cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-blue-50 hover:bg-blue-50 border-l-blue-600'
                            : 'hover:bg-slate-50 border-l-transparent'
                        }`}
                      >
                        <TableCell className="font-medium whitespace-nowrap pl-6 py-3">
                          {column.name}
                        </TableCell>
                        <TableCell className="text-slate-600 py-3">
                          {column.dtype}
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${column.null_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {column.null_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-slate-600 pr-6 py-3">
                          {column.non_null_count}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!fileStore.parentFile?.columns.length && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-slate-500"
                      >
                        No columns found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200 sticky top-6">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {!selectedColumn ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="justify-center">
                    <p className="text-sm text-slate-500">
                      Select a column from the table to configure imputation
                      settings.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Target Column
                    </label>
                    <div className="p-3 bg-slate-50 border rounded-md text-sm font-medium text-slate-800 break-all">
                      {selectedColumn.name}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Imputation Strategy
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {simpleImputationMethods.map((method) => (
                        <Button
                          key={method}
                          variant={
                            selectedMethod === method ? 'default' : 'outline'
                          }
                          disabled={fileStore.loading}
                          className={`justify-start capitalize ${selectedMethod === method ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => {
                            setSelectedMethod(method);
                            setNewFilename(
                              `${fileStore.parentFile?.filename?.split('.')[0]}_${selectedColumn.name.replace(/\s+/g, '')}_${method}`,
                            );
                          }}
                        >
                          {method}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Save As (New Filename)
                    </label>
                    <Input
                      value={newFilename}
                      disabled={fileStore.loading || !selectedMethod}
                      onChange={(e) => setNewFilename(e.target.value)}
                      placeholder={
                        selectedMethod
                          ? 'Enter filename...'
                          : 'Select a strategy first'
                      }
                      className="bg-white"
                    />
                  </div>

                  <div className="pt-4 border-t">
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
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default ImputationTab;
