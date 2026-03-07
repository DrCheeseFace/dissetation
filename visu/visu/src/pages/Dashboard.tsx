import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';
import GlyphCard from '@/components/glyphCard';
import { useRootStore } from '@/mobx/rootstore';
import type { ColumnSummary } from '@/model/DashboardInfo';
import { useEffect } from 'react';

const Dashboard = observer(() => {
  const { dashboardStore } = useRootStore();

  useEffect(() => {
    // TODO REMOVE ME
    console.log(dashboardStore.basicInfo);
  }, [dashboardStore.basicInfo]);

  return (
    <>
      <TypographyH1>dis be dashboard af</TypographyH1>

      {/* TODO ON CLICK IMPLEMENTEATIONS! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {dashboardStore.basicInfo &&
          dashboardStore.basicInfo.columns.map(
            (columnSummary: ColumnSummary) => (
              <GlyphCard
                key={columnSummary.column_name}
                columnSummary={columnSummary}
              />
            ),
          )}
      </div>
    </>
  );
});

export default Dashboard;
