import Offcanvas from 'react-bootstrap/Offcanvas';

const OffcanvasMenu = ({
  showOffcanvas,
  setShowOffcanvas,
  showBookmarkedArticles,
  handleBackToAllArticles,
  handleViewBookmarks,
  handleExportToCSV,
  handleLogout,
}) => {
  return (
    <Offcanvas
      show={showOffcanvas}
      onHide={() => setShowOffcanvas(false)}
      placement="end"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Account Menu</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {showBookmarkedArticles ? (
          <button
            className="offcanvas-button"
            onClick={handleBackToAllArticles}
          >
            <i className="bi bi-house me-2"></i> Back to All Articles
          </button>
        ) : (
          <button className="offcanvas-button" onClick={handleViewBookmarks}>
            <i className="bi bi-bookmarks me-2"></i> View Bookmarks
          </button>
        )}
        <br />
        <button className="offcanvas-button" onClick={handleExportToCSV}>
          <i className="bi bi-filetype-csv me-2"></i> Export Bookmarks to CSV
        </button>
        <button className="offcanvas-button" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> Sign out
        </button>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default OffcanvasMenu;
