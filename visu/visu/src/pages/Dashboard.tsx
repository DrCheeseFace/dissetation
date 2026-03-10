import { observer } from 'mobx-react-lite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissiGVisualisationTab from './MissiGVisualisationTab';
import FilesTab from './FilesTab';
import ImputationTab from './ImputationTab';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';

const Dashboard = observer(() => {
  const { globalStore } = useRootStore();
  return (
    <div style={{ backgroundColor: '#454445' }}>
      <Button onClick={globalStore.debugReset}>debug reset</Button>
      <Tabs defaultValue="MissiG">
        <TabsList>
          <TabsTrigger value="MissiG">MissiG</TabsTrigger>
          <TabsTrigger value="Imputation">Imputation</TabsTrigger>
          <TabsTrigger value="Files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="MissiG">
          <MissiGVisualisationTab />
        </TabsContent>
        <TabsContent value="Imputation">
          <ImputationTab />
        </TabsContent>
        <TabsContent value="Files">
          <FilesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default Dashboard;
