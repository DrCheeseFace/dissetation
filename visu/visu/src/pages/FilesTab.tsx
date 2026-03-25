import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from '@/components/Typography';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { observer } from 'mobx-react-lite';
import { useState, Fragment } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Info,
  Database,
  ArrowDown,
  Download,
  Trash2,
  Play,
  FileText,
  Loader2,
  History,
} from 'lucide-react';
import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { FileHistoryTimeline } from '@/components/FileHistory';
import { ComparisonDialog } from '@/components/ComparisonDialog';

const FilesTab = observer(() => {
  const { fileStore, comparisonStore } = useRootStore();
  const [expandedUuids, setExpandedUuids] = useState<Set<string>>(new Set());
  const [isParentExpanded, setIsParentExpanded] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const startLoading = (key: string) => {
    setLoadingActions((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const stopLoading = (key: string) => {
    setLoadingActions((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleApply = async (uuid: string) => {
    const actionKey = `apply-${uuid}`;
    startLoading(actionKey);
    try {
      await fileStore.commitChildNode(uuid);
      setExpandedUuids((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    } finally {
      stopLoading(actionKey);
    }
  };

  const handleDownload = async (filename: string) => {
    const actionKey = `download-${filename}`;
    startLoading(actionKey);
    try {
      // Logic for download
    } finally {
      stopLoading(actionKey);
    }
  };

  const handleRemove = async (uuid: string) => {
    const actionKey = `remove-${uuid}`;
    startLoading(actionKey);
    try {
      await fileStore.deleteChildNode(uuid);
      setExpandedUuids((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    } catch (error) {
      console.error('failed to delete node:', error);
    } finally {
      stopLoading(actionKey);
    }
  };

  const toggleRow = (uuid: string) => {
    setExpandedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  return (
    <div className="text-black p-6 min-h-screen bg-slate-50/50">
      {fileStore.parentFile && fileStore.childFiles[0] && (
        <ComparisonDialog
          node1={fileStore.parentFile}
          node2={fileStore.childFiles[0]}
          fetchSample={comparisonStore.fetchSample}
        />
      )}

      <div className="max-w-400 mx-auto">
        <div className="mb-8">
          <TypographyH2 className="text-2xl font-bold tracking-tight">
            Data Inventory
          </TypographyH2>
          <TypographyP className="text-muted-foreground">
            Reviewing structural metadata and imputation history for current
            datasets.
          </TypographyP>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
          <div className="xl:col-span-3 space-y-6">
            {fileStore.parentFile && (
              <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
                <CardHeader
                  className="flex flex-row items-center space-y-0 gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setIsParentExpanded(!isParentExpanded)}
                >
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Source Metadata
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1 bg-blue-100 text-blue-700 border-none"
                      >
                        Root
                      </Badge>
                      {fileStore.parentFile.imputations &&
                        fileStore.parentFile.imputations.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1 border-slate-200 text-slate-500"
                          >
                            {fileStore.parentFile.imputations.length} Methods
                            Applied
                          </Badge>
                        )}
                    </div>
                    <CardDescription className="text-xs">
                      {fileStore.parentFile.filename}
                    </CardDescription>
                  </div>

                  <div className="flex gap-8 text-sm mr-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">
                        Dimensions
                      </span>
                      <span className="font-medium text-slate-700">
                        {fileStore.parentFile.shape?.[0]?.toLocaleString() ?? 0}{' '}
                        × {fileStore.parentFile.shape?.[1] ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">
                        Total Nulls
                      </span>
                      <span className="font-medium text-red-500 font-mono">
                        {fileStore.parentFile.columns
                          ?.reduce((acc, col) => acc + (col.null_count || 0), 0)
                          .toLocaleString() ?? 0}
                      </span>
                    </div>
                  </div>
                  {isParentExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </CardHeader>

                {isParentExpanded && (
                  <CardContent className="p-0 border-t border-slate-100 bg-slate-50/30">
                    {fileStore.parentFile.imputations &&
                      fileStore.parentFile.imputations.length > 0 && (
                        <div className="p-5 border-b border-slate-100 bg-white/50">
                          <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-blue-500" />
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                              Applied Imputation Logic
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {fileStore.parentFile.imputations.map(
                              (imp, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-1"
                                >
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    {imp.feature}
                                  </p>
                                  <code className="text-[11px] text-blue-700 font-semibold bg-blue-50 self-start px-1 rounded">
                                    {imp.method}
                                  </code>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Column Health
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {fileStore.parentFile.columns?.map((col, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                          >
                            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                              {col.name}
                            </p>
                            <div className="flex justify-between items-end mt-1">
                              <span className="text-xs font-mono text-slate-500">
                                {col.dtype}
                              </span>
                              <span
                                className={`text-xs font-bold ${col.null_count > 0 ? 'text-red-500' : 'text-slate-400'}`}
                              >
                                {(col.null_count || 0).toLocaleString()} nulls
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg leading-none">
                  Imputation Records
                </CardTitle>
                <CardDescription className="mt-1">
                  Metadata snapshots of processed data states.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Reference Name</TableHead>
                      <TableHead>Applied Imputations</TableHead>
                      <TableHead className="text-left">
                        Null Value Diff
                      </TableHead>
                      <TableHead className="text-center w-40">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fileStore.childFiles && fileStore.childFiles.length > 0 ? (
                      fileStore.childFiles.map((info: BasicInfo) => (
                        <MetadataRow
                          key={info.uuid}
                          parentInfo={fileStore.parentFile || undefined}
                          info={info}
                          isExpanded={expandedUuids.has(info.uuid)}
                          onToggle={() => toggleRow(info.uuid)}
                          handleApply={handleApply}
                          handleRemove={handleRemove}
                          handleDownload={handleDownload}
                          isApplying={loadingActions.has(`apply-${info.uuid}`)}
                          isDownloading={loadingActions.has(
                            `download-${info.filename}`,
                          )}
                          isRemoving={loadingActions.has(`remove-${info.uuid}`)}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <aside className="xl:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <History className="w-4 h-4 text-slate-500" />
                <TypographyH3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                  commited nodes
                </TypographyH3>
              </div>
              <Card className="bg-white shadow-sm border-slate-200">
                <CardContent className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <FileHistoryTimeline
                    files={fileStore.history || []}
                    onClickRevertTo={fileStore.revertToParentNode}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
});

interface MetadataRowProps {
  parentInfo?: BasicInfo;
  info: BasicInfo;
  isExpanded: boolean;
  onToggle: () => void;
  handleRemove: (uuid: UUID) => void;
  handleDownload: (filename: string) => void;
  handleApply: (uuid: UUID) => void;
  isApplying: boolean;
  isDownloading: boolean;
  isRemoving: boolean;
}

const MetadataRow = ({
  parentInfo,
  info,
  isExpanded,
  onToggle,
  handleRemove,
  handleDownload,
  handleApply,
  isApplying,
  isDownloading,
  isRemoving,
}: MetadataRowProps) => {
  const impCount = info.imputations?.length || 0;

  return (
    <Fragment>
      <TableRow
        className="cursor-pointer hover:bg-slate-50 transition-colors group"
        onClick={onToggle}
      >
        <TableCell>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </TableCell>
        <TableCell className="font-medium text-slate-900">
          {info.filename}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className="font-medium bg-slate-50/50 text-slate-600 border-slate-200"
          >
            {impCount} {impCount === 1 ? 'Method' : 'Methods'}
          </Badge>
        </TableCell>
        <TableCell className="text-left font-semibold text-green-600">
          {(() => {
            const totalNullsParent =
              parentInfo?.columns?.reduce(
                (acc, col) => acc + (col.null_count || 0),
                0,
              ) || 0;
            const totalNullsCurrent =
              info.columns?.reduce(
                (acc, col) => acc + (col.null_count || 0),
                0,
              ) || 0;
            const totalFixed = Math.max(
              0,
              totalNullsParent - totalNullsCurrent,
            );
            return totalFixed > 0 ? `+${totalFixed.toLocaleString()}` : '0';
          })()}
        </TableCell>
        <TableCell className="text-center">
          <div
            className="flex justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              disabled={isApplying || isRemoving}
              className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
              onClick={() => handleApply(info.uuid)}
              title="Apply This State"
            >
              {isApplying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isDownloading || isRemoving}
              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              onClick={() => handleDownload(info.filename)}
              title="Download Snapshot"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={isRemoving}
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
              onClick={() => handleRemove(info.uuid)}
              title="Remove Record"
            >
              {isRemoving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
          <TableCell colSpan={5} className="p-0">
            <div className="p-5 pl-14 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Imputation
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {info.imputations && info.imputations.length > 0 ? (
                  info.imputations.map((imp, idx) => {
                    const srcCol = parentInfo?.columns?.find(
                      (c) => c.name === imp.feature,
                    );
                    const currentCol = info.columns?.find(
                      (c) => c.name === imp.feature,
                    );
                    const diff =
                      (srcCol?.null_count ?? 0) - (currentCol?.null_count ?? 0);

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
                          {diff > 0 && (
                            <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50 text-[10px] h-5 px-1.5 flex gap-0.5 items-center font-bold">
                              <ArrowDown className="w-2.5 h-2.5" />
                              {diff.toLocaleString()}
                            </Badge>
                          )}
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
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default FilesTab;
