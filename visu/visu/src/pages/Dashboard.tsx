import { observer } from 'mobx-react-lite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissiGVisualisationTab from '@/pages/MissiGVisualisationTab';
import FilesTab from '@/pages/FilesTab';
import ImputationTab from '@/pages/ImputationTab';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { useEffect } from 'react';

const Dashboard = observer(() => {
  const { globalStore, fileStore, comparisonStore } = useRootStore();

  // TODO better way to make sure the history tab is clean?
  useEffect(() => {
    fileStore.fetchHistory();
  }, [fileStore]);

  const DEBUG_logFetchComparison = async () => {
    if (!fileStore.childFiles[0] || !fileStore.parentFile) return;
    const out = await comparisonStore.fetchComparison(
      fileStore.childFiles[0].uuid,
      fileStore.childFiles[1]?.uuid,
    );

    console.log(out);
  };

  return (
    <div
      className="min-h-screen min-w-screen"
      style={{ backgroundColor: 'white' }}
    >
      {/* TODO REMOVE ME DEBUG BUTTONS */}
      <div className="mb-5 space-x-2">
        <Button onClick={globalStore.debugReset}>DEBUG RESET</Button>
        <Button onClick={fileStore.fetchHistory}>DEBUG fetch histiriy</Button>
        <Button onClick={DEBUG_logFetchComparison}>DEBUG compare</Button>
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
