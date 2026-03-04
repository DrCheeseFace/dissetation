import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';

const Dashboard = observer(() => {
  // const { globalStore } = useRootStore();

  return (
    <>
      <TypographyH1>dis be dashboard af</TypographyH1>
    </>
  );
});

export default Dashboard;
