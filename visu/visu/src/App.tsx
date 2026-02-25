import { Button } from './components/ui/button';
import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const incrementCount = (): void => {
    setCount(count + 1);
  };

  return (
    <>
      <div>
        <Button onClick={incrementCount}>{count}</Button>
      </div>
    </>
  );
}

export default App;
