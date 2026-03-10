import { observer } from 'mobx-react-lite';
import MissigGlyphCard from '@/components/missigGlyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/MissiG';
import { useState } from 'react';

const MissiGVisualisationTab = observer(() => {
  const { missigStore: dashboardStore } = useRootStore();
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number>();

  const setSelectedGlyphIdx = (index: number): void => {
    setSelectedGlyphIndex(index);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 px-3">
      {dashboardStore.ParentFileMissiGInfo &&
        dashboardStore.ParentFileMissiGInfo.columns.map(
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
  );
});

export default MissiGVisualisationTab;
