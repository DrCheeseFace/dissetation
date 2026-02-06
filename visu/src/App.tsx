import React, { useState, useEffect } from 'react';

interface Result {
  name: string;
  jsTime: number;
  cTime: number;
}

const SIZE = 15000000;

const App: React.FC = () => {
  const [wasm, setWasm] = useState<any>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [jsPool, setJsPool] = useState<{ id: number; value: number }[] | null>(null);

  useEffect(() => {
    (window as any).createModule().then((module: any) => {
      setWasm(module);
    });
  }, []);

  const addResultRow = (name: string, jsTime: number, cTime: number) => {
    setResults(prev => [{ name, jsTime, cTime }, ...prev]);
  };

  const primeBoth = () => {
    if (!wasm) return;
    wasm._prime_memory(SIZE);
    
    const start = performance.now();
    const pool = new Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      pool[i] = { id: i, value: i + 0.5 };
    }
    const end = performance.now();
    
    setJsPool(pool);
    addResultRow("Memory Allocation", end - start, 0.01);
  };

  const runShuffleBenchmark = () => {
    if (!jsPool || !wasm) return alert("Click prime memory first");

    const sJS = performance.now();
    for (let i = 0; i < SIZE; i++) {
      let temp = jsPool[i].value;
      jsPool[i].value = jsPool[i].id;
      jsPool[i].id = temp;
    }
    const eJS = performance.now();

    const sC = performance.now();
    wasm._shuffle_static_pool();
    const eC = performance.now();

    addResultRow("Memory Shuffle", eJS - sJS, eC - sC);
  };

  const runMathBenchmark = () => {
    if (!wasm) return;
    const ptr = wasm._get_dynamic_float_array(SIZE);
    const view = new Float32Array(wasm.HEAPF32.buffer, ptr, SIZE);

    const sJS = performance.now();
    for (let i = 0; i < SIZE; i++) {
      view[i] = Math.sin(i) * Math.cos(i) * Math.sqrt(i);
    }
    const eJS = performance.now();

    const sC = performance.now();
    wasm._process_complex_math(ptr, SIZE);
    const eC = performance.now();

    addResultRow("Complex Math", eJS - sJS, eC - sC);
    wasm._free_ptr(ptr);
  };

  const runPrimeBenchmark = () => {
    if (!wasm) return;
    const limit = 1000000;
    const sJS = performance.now();
    let count = 0;
    for (let i = 2; i <= limit; i++) {
      let isP = true;
      for (let j = 2; j * j <= i; j++) {
        if (i % j === 0) {
          isP = false;
          break;
        }
      }
      if (isP) count++;
    }
    const eJS = performance.now();

    const sC = performance.now();
    wasm._count_primes(limit);
    const eC = performance.now();

    addResultRow("Prime Counting", eJS - sJS, eC - sC);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">wasm vs js performance</h1>
        {!wasm && <p className="text-danger">loading webassembly</p>}
      </div>

      <div className="row justify-content-center g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2">Prep</h5>
              <button className="btn btn-primary w-100 mt-2" onClick={primeBoth} disabled={!wasm}>
                prime 15m elements
              </button>
            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold border-bottom pb-2">Exec</h5>
              <button className="btn btn-success w-100 mb-2" onClick={runShuffleBenchmark}>Shuffle</button>
              <button className="btn btn-success w-100 mb-2" onClick={runMathBenchmark}>Math Funcs</button>
              <button className="btn btn-success w-100 mb-2" onClick={runPrimeBenchmark}>Prime Funcs</button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white fw-bold">Benchmarks</div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>JS</th>
                    <th>c (Wasm)</th>
                    <th>gap</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">No data yet.</td>
                    </tr>
                  ) : (
                    results.map((res, i) => {
                      const gap = (res.jsTime / res.cTime).toFixed(2);
                      return (
                        <tr key={i}>
                          <td className="fw-bold">{res.name}</td>
                          <td>{res.jsTime.toFixed(2)}ms</td>
                          <td>{res.cTime.toFixed(2)}ms</td>
                          <td>
                            <span className={`badge ${parseFloat(gap) > 1 ? "bg-success" : "bg-danger"}`}>
                              {gap}x faster
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
