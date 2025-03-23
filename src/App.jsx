import React, { useState } from "react";
import MnemonicList from "./components/MnemonicList";
import { generateBatchMnemonics } from "./utils/generateMnemonic";
import MnemonicTable from "./components/MnemonicTable";

const App = () => {
  const [batchSize, setBatchSize] = useState(10);
  const [pageSize, setPageSize] = useState(20);

  return (
    <div>
      <h1>BIP-39 Mnemonic Generator</h1>
      <button onClick={() => generateBatchMnemonics(100)}>Generate 100 Mnemonics</button>
      <MnemonicTable />
    </div>
  );
};

export default App;

