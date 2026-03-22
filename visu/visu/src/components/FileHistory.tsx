import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { observer } from 'mobx-react-lite';
import { useState, type FC } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Info,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BasicTimelineProps {
  files: BasicInfo[];
  onClickRevertTo: (uuid: UUID) => void;
}

export const FileHistoryTimeline: FC<BasicTimelineProps> = observer(
  ({ files, onClickRevertTo }) => {
    return (
      <div className="space-y-6">
        <h2 className="text-foreground text-xl font-semibold">Basic</h2>
        <div className="relative">
          <div className="bg-border absolute top-0 bottom-0 left-3 w-px" />

          <div className="space-y-2">
            {files.map((file, index) => (
              <TimelineNode
                key={file.uuid}
                file={file}
                onClickRevertTo={onClickRevertTo}
                parentFile={index > 0 ? files[index - 1] : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);

interface TimelineNodeProps {
  file: BasicInfo;
  parentFile?: BasicInfo;
  onClickRevertTo: (uuid: UUID) => void;
}

const TimelineNode: FC<TimelineNodeProps> = ({
  file,
  parentFile,
  onClickRevertTo,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasImputations = file.imputations && file.imputations.length > 0;

  return (
    <div className="relative pb-8">
      <div
        className={`relative flex items-start gap-4 ${
          hasImputations
            ? 'cursor-pointer hover:bg-slate-50/50 rounded-lg p-2 -ml-2 transition-colors'
            : 'p-2 -ml-2'
        }`}
        onClick={() => hasImputations && setIsExpanded(!isExpanded)}
      >
        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center bg-background mt-0.5">
          <div className="bg-muted-foreground h-3 w-3 rounded-full" />
        </div>

        <div className="min-w-0 flex-1 flex items-center justify-between pr-2">
          <div className="truncate pr-4">
            <div className="text-foreground text-sm font-medium truncate">
              {file.filename}
            </div>

            {hasImputations && (
              <div className="text-muted-foreground mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 px-1.5 border-slate-200 text-slate-500 font-medium"
                >
                  {file.imputations.length}{' '}
                  {file.imputations.length === 1 ? 'Method' : 'Methods'} Applied
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClickRevertTo(file.uuid);
              }}
              className="h-7 text-xs px-3 rounded-full text-slate-600 border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" />
              Revert
            </Button>

            {hasImputations && (
              <div className="text-slate-400 w-4 flex justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasImputations && isExpanded && (
        <div className="mt-2 ml-10 p-5 bg-slate-50/50 border border-slate-100 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Imputation
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {file.imputations.map((imp, idx) => {
              const srcCol = parentFile?.columns?.find(
                (c) => c.name === imp.feature,
              );
              const currentCol = file.columns?.find(
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
                    <div className="max-w-[80%]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        Feature
                      </p>
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {imp.feature}
                      </p>
                    </div>
                  </div>
                  {diff > 0 && (
                    <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50 text-[10px] h-5 px-1.5 flex gap-0.5 items-center font-bold">
                      <ArrowDown className="w-2.5 h-2.5" />
                      {diff.toLocaleString()}
                    </Badge>
                  )}
                  <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                    <code className="text-[11px] px-1.5 py-0.5 bg-slate-100 rounded text-blue-700 font-semibold">
                      {imp.method}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
