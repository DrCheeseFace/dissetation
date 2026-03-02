import { Button } from './components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { useState, type ChangeEvent } from 'react';
import { useRootStore } from './mobx/rootstore';
import { observer } from 'mobx-react-lite';

const App = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { globalStore } = useRootStore();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch('http://localhost:5155/test/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Upload complete!');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button onClick={globalStore.IncrementTemp}>
        {globalStore.REMOVEME_TEMP}
      </Button>
      <Button onClick={globalStore.DecrementTemp}>DECREMENT</Button>
      <div style={{ marginTop: '20px' }}>
        <Field>
          <FieldLabel htmlFor="file-test">Large File Upload</FieldLabel>
          <Input id="file-test" type="file" onChange={handleFileChange} />
          <FieldDescription>
            Stream large files to local storage
          </FieldDescription>
        </Field>
        <Button
          onClick={uploadFile}
          disabled={!file || uploading}
          style={{ marginTop: '10px' }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>
    </>
  );
});

export default App;
