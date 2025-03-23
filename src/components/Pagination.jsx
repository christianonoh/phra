import { useState } from "react";

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
  const [pageInput, setPageInput] = useState(currentPage);

  const handlePageChange = (e) => {
    let page = Number(e.target.value);
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page);
    }
  };

  return (
    <nav className="d-flex justify-content-center mt-3">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </button>
        </li>

        <li className="page-item">
          <span className="page-link">Page {currentPage} of {totalPages}</span>
        </li>

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </button>
        </li>

        <li className="page-item">
          <input
            type="number"
            className="form-control"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePageChange(e)}
            min="1"
            max={totalPages}
            style={{ width: "80px", marginLeft: "10px" }}
          />
        </li>

        <li className="page-item">
          <button className="btn btn-secondary" onClick={() => handlePageChange({ target: { value: pageInput } })}>
            Go
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
