import { TypographyP } from '@/components/typography';
import { useRootStore } from '@/mobx/rootstore';
import { observer } from 'mobx-react-lite';

const ImputationTab = observer(() => {
  const { fileStore } = useRootStore();

  return (
    <div className="text-white">
      <TypographyP>{JSON.stringify(fileStore.parentFile)}</TypographyP>
      <TypographyP>{JSON.stringify(fileStore.childFiles)}</TypographyP>
    </div>
  );
});

export default ImputationTab;
