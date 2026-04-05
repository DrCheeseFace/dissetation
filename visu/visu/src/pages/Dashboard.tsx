import { observer } from 'mobx-react-lite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissiGVisualisationTab from '@/pages/MissiGVisualisationTab';
import FilesTab from '@/pages/FilesTab';
import ImputationTab from '@/pages/ImputationTab';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { useEffect, useState } from 'react';
import type MatrixInfo from '@/model/MissingMatrix';
import MissingMatrix from '@/components/MissingMatrix';

const Dashboard = observer(() => {
  const { globalStore, fileStore, comparisonStore } = useRootStore();
  const [DEBUG_matrixinfo, setDEBUG_matrixinfo] = useState<
    MatrixInfo | undefined
  >(undefined);

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

  const DEBUG_fetchMissingMatrixInfo = async () => {
    console.log('DEBUG_fetchMissingMatrixInfo: on click');
    if (!fileStore.parentFile) return;

    const out = await comparisonStore.fetchMissingMatrix(
      fileStore.parentFile?.uuid,
    );

    console.log(out);
    setDEBUG_matrixinfo(out.info);
  };

  return (
    <div
      className="min-h-screen min-w-screen"
      style={{ backgroundColor: 'white' }}
    >
      {/* TODO REMOVE ME DEBUG BUTTONS AND MISSING MATRIX*/}
      <div className="mb-5 space-x-2">
        <Button onClick={globalStore.debugReset}>DEBUG RESET</Button>
        <Button onClick={fileStore.fetchHistory}>DEBUG fetch histiriy</Button>
        <Button onClick={DEBUG_logFetchComparison}>DEBUG compare</Button>
        <Button onClick={DEBUG_fetchMissingMatrixInfo}>
          DEBUG missing matrix
        </Button>
      </div>
      {DEBUG_matrixinfo && <MissingMatrix matrixInfo={DEBUG_matrixinfo} />}

      {/* TODO add animtation to change to files tab and highlight row */}
      <Tabs defaultValue="MissiG">
        <TabsList
          className="sticky top-0 z-20 bg-slate-50 w-full"
          variant="line"
        >
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
