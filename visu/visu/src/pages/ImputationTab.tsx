import { TypographyP } from '@/components/typography';
import { Button } from '@/components/ui/button';
import { useRootStore } from '@/mobx/rootstore';
import { observer } from 'mobx-react-lite';

const ImputationTab = observer(() => {
  const { fileStore } = useRootStore();

  return (
    <div className="text-white">
      <Button onClick={fileStore.testimpute}>CLICK ME HOE</Button>
      <Button onClick={fileStore.testDeleteChildNode}>DELETE ME</Button>
      <TypographyP>{JSON.stringify(fileStore.parentFile)}</TypographyP>
      <TypographyP>{JSON.stringify(fileStore.childFiles)}</TypographyP>
    </div>
  );
});

export default ImputationTab;
