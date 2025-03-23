import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { fetchMnemonics } from "../utils";

const MnemonicList = ({ pageSize }) => {
  const [mnemonics, setMnemonics] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadMnemonics = async () => {
      const { data } = await fetchMnemonics(page, pageSize);
      setMnemonics(data);
    };
    loadMnemonics();
  }, [page, pageSize]);

  const toggleCheck = async (id, checked) => {
    await supabase.from("mnemonics").update({ checked }).eq("id", id);
    setMnemonics(mnemonics.map(m => m.id === id ? { ...m, checked } : m));
  };

  return (
    <div>
      <h2>Stored Mnemonics</h2>
      <ul>
        {mnemonics.map((m) => (
          <li key={m.id}>
            <input type="checkbox" checked={m.checked} onChange={() => toggleCheck(m.id, !m.checked)} />
            <span>{m.mnemonic}</span>
            <button onClick={() => navigator.clipboard.writeText(m.mnemonic)}>Copy</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </div>
  );
};

export default MnemonicList;
