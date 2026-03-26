import { observer } from 'mobx-react-lite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissiGVisualisationTab from '@/pages/MissiGVisualisationTab';
import FilesTab from '@/pages/FilesTab';
import ImputationTab from '@/pages/ImputationTab';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { useEffect } from 'react';

const Dashboard = observer(() => {
  const { globalStore, fileStore } = useRootStore();

        useEffect(() => {
fileStore.fetchHistory()
        }, [])

  return (
    <div
      className="min-h-screen min-w-screen"
      style={{ backgroundColor: 'white' }}
    >
      {/* TODO REMOVE ME DEBUG BUTTONS */}
      <div className="mb-5 space-x-2">
        <Button onClick={globalStore.debugReset}>DEBUG RESET</Button>
        <Button onClick={fileStore.fetchHistory}>DEBUG fetch histiriy</Button>
      </div>

      {/* TODO add animtation to change to files tab and highlight row */}
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
