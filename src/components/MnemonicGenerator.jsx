import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { saveMnemonics, wordarr } from "../utils";

const MnemonicGenerator = () => {
  const [batchSize, setBatchSize] = useState(10);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [mnemonics, setMnemonics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    fetchMnemonics();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const newWorker = new Worker(new URL("../utils/mnemonicWorker.js", import.meta.url));
    newWorker.onmessage = async (e) => {
      if (e.data.error) {
        console.error(e.data.error);
      } else if (Array.isArray(e.data)) {  
        saveMnemonics(e.data); // ✅ Pass valid array
      } else {
        console.error("Unexpected data format from worker:", e.data);
      }
    };    
    
    setWorker(newWorker);
    return () => newWorker.terminate();
  }, []);

  const fetchMnemonics = async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("mnemonics")
      .select("*")
      .order("generated_index", { ascending: false })
      .range(from, to);

    if (error) console.error("Error fetching mnemonics:", error);
    else setMnemonics(data);

    setLoading(false);
  };

  const handleGenerate = () => {
    console.log('here ow')
    if (worker) worker.postMessage({ batchSize });
  };

  const toggleCheck = async (id, checked) => {
    await supabase.from("mnemonics").update({ checked }).match({ id });
    fetchMnemonics();
  };

  return (
    <div>
      <h1>Mnemonic Generator</h1>
      <div>
        <label>Batch Size:</label>
        <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} />
        <button onClick={handleGenerate}>Generate</button>
      </div>
      <div>
        <label>Page Size:</label>
        <input type="number" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
      </div>

      {loading ? <p>Loading...</p> : (
        <div>
          {mnemonics.map(({ id, mnemonic, checked }) => (
            <div key={id}>
              <input type="checkbox" checked={checked} onChange={() => toggleCheck(id, !checked)} />
              <span>{mnemonic}</span>
              <button onClick={() => navigator.clipboard.writeText(mnemonic)}>Copy</button>
            </div>
          ))}
        </div>
      )}

      <div>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default MnemonicGenerator;