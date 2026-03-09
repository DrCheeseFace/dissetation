import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';
import MissigGlyphCard from '@/components/missigGlyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/MissiG';
import { useState } from 'react';

const Dashboard = observer(() => {
  const { dashboardStore } = useRootStore();
  const [selectedGlyphIndex, setSelectedGlyphIndex] = useState<number>();

  const setSelectedGlyphIdx = (index: number): void => {
    setSelectedGlyphIndex(index);
  };

  return (
    <>
      <TypographyH1>dis be dashboard af</TypographyH1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1 px-3">
        {dashboardStore.MissiGInfo &&
          dashboardStore.MissiGInfo.columns.map(
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
    </>
  );
});

export default Dashboard;
