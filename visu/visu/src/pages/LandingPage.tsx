import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { useState, type ChangeEvent } from 'react';
import { useRootStore } from '@/mobx/rootstore';
import { observer } from 'mobx-react-lite';
import { TypographyH1, TypographyP } from '@/components/typography';
import Glyph from '@/components/glyph';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

      {/* TODO iterate this */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>this is glpyh card title</CardTitle>
        </CardHeader>
        <CardContent>
          <Glyph /> {/* TODO remove  */}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <TypographyP>add buttons here in the future?</TypographyP>
        </CardFooter>
      </Card>
    </>
  );
});

export default LandingPage;
