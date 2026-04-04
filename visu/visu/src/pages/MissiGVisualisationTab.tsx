import { observer } from 'mobx-react-lite';
import MissigGlyphCard from '@/components/MissigGlyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/MissiG';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BasicInfo, UUID } from '@/model/BasicInfo';
import { Loader2 } from 'lucide-react';

const MissiGVisualisationTab = observer(() => {
  const { missigStore, fileStore } = useRootStore();
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number>();
  const [files, setFiles] = useState<BasicInfo[]>([]);

  const setSelectedGlyphIdx = (index: number): void => {
    setSelectedGlyphIndex(index);
  };

  useEffect(() => {
    const files: BasicInfo[] = [];
    if (fileStore.parentFile) {
      files.push(fileStore.parentFile);
    }

    if (fileStore.childFiles) {
      files.push(...fileStore.childFiles);
    }
    setFiles(files);
  }, [fileStore.parentFile, fileStore.childFiles]);

  const onSelect = (uuid: UUID): void => {
    missigStore.fetchMissiGInfo(uuid);
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-3 bg-slate-50/50">
      <div className="w-full md:w-72">
        <Select onValueChange={onSelect} value={missigStore.currentMissiGUuid}>
          <SelectTrigger>
            <SelectValue placeholder="SELECT FILE" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {files.map((file: BasicInfo) => (
                <SelectItem key={file.uuid} value={file.uuid}>
                  {file.filename}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {missigStore.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {missigStore.currentMissiGInfo &&
            missigStore.currentMissiGInfo.columns.map((columnSummary: ColumnSummary) => (
              <MissigGlyphCard
                key={columnSummary.index}
                columnSummary={columnSummary}
                setSelectedGlyphIdxOnClick={setSelectedGlyphIdx}
                selectedGlyphIdx={selectedGlyphIndex}
              />
            ))}
        </div>
      )}
    </div>
  );
});

export default MissiGVisualisationTab;
