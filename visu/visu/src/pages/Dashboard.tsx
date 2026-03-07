import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';
import GlyphCard from '@/components/glyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/DashboardInfo';

const Dashboard = observer(() => {
  const { dashboardStore } = useRootStore();

  const OnClick = (name: string): void => {
    if (name != dashboardStore.selectedGlyphIdx) {
      dashboardStore.setSelectedGlyph(name);
    }
  };

  return (
    <>
      <TypographyH1>dis be dashboard af</TypographyH1>

      {/* TODO ON CLICK IMPLEMENTEATIONS! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 px-3">
        {dashboardStore.basicInfo &&
          dashboardStore.basicInfo.columns.map(
            (columnSummary: ColumnSummary, idx: number) => (
              <GlyphCard
                key={columnSummary.column_name}
                columnSummary={columnSummary}
                onClick={OnClick}
                isSelected={dashboardStore.selectedGlyphIdx == idx}
              />
            ),
          )}
      </div>
    </>
  );
});

export default Dashboard;
