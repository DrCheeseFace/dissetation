import { useRootStore } from './mobx/rootstore';
import { observer } from 'mobx-react-lite';
import { Page } from '@/model/Page';
import { TypographyP } from '@/components/typography';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';

const App = observer(() => {
  // todo handle which page gets shown

  const { globalStore } = useRootStore();

  switch (globalStore.currentPage) {
    case Page.LandingPage:
      return <LandingPage />;
    case Page.Dashboard:
      return <Dashboard />;
    default:
      return <TypographyP> TODO 404 no page here. App.tsx </TypographyP>;
  }
});

export default App;
