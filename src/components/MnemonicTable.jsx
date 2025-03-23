import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Pagination from "./Pagination";

const mnemonicsPerPage = 10;

const MnemonicTable = () => {
  const [mnemonics, setMnemonics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showChecked, setShowChecked] = useState(false);

  useEffect(() => {
    const fetchMnemonics = async () => {
      setLoading(true);

      let query = supabase
        .from("mnemonics")
        .select("*", { count: "exact" })
        .order("generated_index", { ascending: false })
        .range((currentPage - 1) * mnemonicsPerPage, currentPage * mnemonicsPerPage - 1);

      if (!showChecked) {
        query = query.eq("checked", false);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching:", error);
      } else {
        setMnemonics(data);
        setTotalPages(Math.ceil(count / mnemonicsPerPage));
      }

      setLoading(false);
    };

    fetchMnemonics();
  }, [currentPage, showChecked]);

  const handleCheckboxChange = async (id, isChecked) => {
    const { error } = await supabase.from("mnemonics").update({ checked: isChecked }).eq("id", id);
    if (error) {
      console.error("Error updating checkbox:", error);
    } else {
      setMnemonics((prev) =>
        prev.map((mnemonic) =>
          mnemonic.id === id ? { ...mnemonic, checked: isChecked } : mnemonic
        )
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Mnemonic List</h2>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showChecked}
            onChange={() => setShowChecked(!showChecked)}
            id="showCheckedSwitch"
          />
          <label className="form-check-label" htmlFor="showCheckedSwitch">
            Show Checked Mnemonics
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Mnemonic</th>
                <th>Checked</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {mnemonics.map((mnemonic, index) => (
                <tr key={mnemonic.id}>
                  <td>{((currentPage -1) * mnemonicsPerPage) + index + 1}</td>
                  <td>{mnemonic.mnemonic}</td>
                  <td className="text-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={mnemonic.checked}
                      onChange={(e) => handleCheckboxChange(mnemonic.id, e.target.checked)}
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => navigator.clipboard.writeText(mnemonic.mnemonic)}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
};

export default MnemonicTable;
