import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';
import MissigGlyphCard from '@/components/missigGlyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/DashboardInfo';

const Dashboard = observer(() => {
  const { dashboardStore } = useRootStore();

  const OnClick = (name: string): void => {
    dashboardStore.setSelectedGlyph(name);
  };

  return (
    <>
      <TypographyH1>dis be dashboard af</TypographyH1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1 px-3">
        {dashboardStore.basicInfo &&
          dashboardStore.basicInfo.columns.map(
            (columnSummary: ColumnSummary, idx: number) => (
              <MissigGlyphCard
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
