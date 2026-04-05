import { observer } from 'mobx-react-lite';
import MissigGlyphCard from '@/components/MissigGlyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/MissiG';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const MissiGVisualisationTab = observer(() => {
  const { missigStore, fileStore } = useRootStore();
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number>();
  const [files, setFiles] = useState<BasicInfo[]>([]);

  const setSelectedGlyphIdx = (index: number): void => {
    setSelectedGlyphIndex(index);
  };

  useEffect(() => {
    const files: BasicInfo[] = [];
    if (fileStore.history) {
      files.push(...fileStore.history);
    }

    if (fileStore.childFiles) {
      files.push(...fileStore.childFiles);
    }

    setFiles(files);
  }, [fileStore.parentFile, fileStore.childFiles, fileStore.history]);

  const onSelect = (uuid: UUID): void => {
    missigStore.fetchMissiGInfo(uuid);
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-3 bg-slate-50/50">
      <div className="sticky top-10 z-10 flex flex-wrap gap-2">
        {files.map((file: BasicInfo) => (
          <Button
            key={file.uuid}
            variant={
              missigStore.currentMissiGUuid === file.uuid
                ? 'default'
                : 'outline'
            }
            size="sm"
            onClick={() => onSelect(file.uuid)}
            className={cn(
              'flex items-center gap-2 transition-all',
              missigStore.currentMissiGUuid === file.uuid &&
                'ring-2 ring-primary ring-offset-1',
            )}
          >
            <FileText className="h-4 w-4" />
            {file.filename}
          </Button>
        ))}
      </div>

      {missigStore.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {missigStore.currentMissiGInfo &&
            missigStore.currentMissiGInfo.columns.map(
              (columnSummary: ColumnSummary) => (
                <MissigGlyphCard
                  key={columnSummary.index}
                  columnSummary={columnSummary}
                  setSelectedGlyphIdxOnClick={setSelectedGlyphIdx}
                  selectedGlyphIdx={selectedGlyphIndex}
                />
              ),
            )}
        </div>
      )}
    </div>
  );
});

export default MissiGVisualisationTab;
