import Button from 'react-bootstrap/Button';

const Pagination = ({ items, pageSize, onPageChange, currentPage }) => {
  // Displays page navigation buttons
  if (items.length / pageSize <= 1) return null;
  let numOfPages = Math.ceil(items.length / pageSize);
  let pageNums = range(1, numOfPages);
  let list = pageNums.map((pageNum) => {
    return (
      <Button
        variant="outline-light"
        className="page-item m-1"
        key={pageNum}
        onClick={onPageChange}
      >
        {pageNum}
      </Button>
    );
  });
  return (
    <footer className="d-flex justify-content-center bg-primary text-white">
      <span className="page-legend">
        Page {currentPage} of {numOfPages}
      </span>
      <ul className="pagination">{list}</ul>
    </footer>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

export default Pagination;