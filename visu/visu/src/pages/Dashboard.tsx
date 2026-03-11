import { observer } from 'mobx-react-lite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissiGVisualisationTab from './MissiGVisualisationTab';
import FilesTab from './FilesTab';
import ImputationTab from './ImputationTab';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { SimpleImputationStrategy } from '@/model/SimpleImpute';

const Dashboard = observer(() => {
  const { globalStore, fileStore } = useRootStore();
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'white' }}>
      <div className="mb-5 space-x-2">
        <Button onClick={globalStore.debugReset}>DEBUG RESET</Button>
        <Button
          onClick={() =>
            fileStore.simpleImpute(
              'debug.csv',
              'Cholesterol',
              SimpleImputationStrategy.Mean,
            )
          }
        >
          DEBUG ADD CHILD
        </Button>
        <Button onClick={fileStore.testDeleteChildNode}>
          DEBUG DELETE CHILD
        </Button>
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
