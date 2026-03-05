import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { useState, type ChangeEvent } from 'react';
import { useRootStore } from '@/mobx/rootstore';
import { observer } from 'mobx-react-lite';
import { TypographyH1 } from '@/components/typography';

const LandingPage = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const { globalStore } = useRootStore();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <>
      <TypographyH1>landing page todo title</TypographyH1>
      <Button onClick={() => globalStore.healthCheck()}>health check</Button>

      <Field>
        <FieldLabel htmlFor="file-test">Large File Upload</FieldLabel>
        <Input id="file-test" type="file" onChange={handleFileChange} />
        <FieldDescription>Stream large files to local storage</FieldDescription>
      </Field>

      <Button
        onClick={() => globalStore.uploadParentFile(file)}
        disabled={!file || globalStore.uploading}
      >
        {globalStore.uploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </>
  );
});

export default LandingPage;
