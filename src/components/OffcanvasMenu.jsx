import Offcanvas from 'react-bootstrap/Offcanvas';

// ... existing code ...
const OffcanvasMenu = ({
  showOffcanvas,
  setShowOffcanvas,
  showBookmarkedArticles,
  handleBackToAllArticles,
  handleViewBookmarks,
  handleExportToCSV,
  handleLogout,
  loggedIn,
  handleGoogleSignIn,
  handleYesterday,
  handleLastWeek,
  handleLastMonth,
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
        <button className="offcanvas-button" onClick={handleYesterday}>
          <i className="bi bi-calendar me-2"></i> Most relevant news from
          yesterday
        </button>
        <button className="offcanvas-button" onClick={handleLastWeek}>
          <i className="bi bi-calendar-week me-2"></i> Most relevant news from
          last week
        </button>
        <button className="offcanvas-button" onClick={handleLastMonth}>
          <i className="bi bi-calendar-month me-2"></i> Most relevant news from
          last month
        </button>
        {!loggedIn && (
          <button className="offcanvas-button" onClick={handleGoogleSignIn}>
            <i className="bi bi-google me-2"></i> Sign in with Google
          </button>
        )}
        {loggedIn && (
          <>
            <button className="offcanvas-button" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Sign out
            </button>
            {showBookmarkedArticles ? (
              <button
                className="offcanvas-button"
                onClick={handleBackToAllArticles}
              >
                <i className="bi bi-house me-2"></i> Back to All Articles
              </button>
            ) : (
              <button
                className="offcanvas-button"
                onClick={handleViewBookmarks}
              >
                <i className="bi bi-bookmarks me-2"></i> View Bookmarks
              </button>
            )}
            <br />
            <button className="offcanvas-button" onClick={handleExportToCSV}>
              <i className="bi bi-filetype-csv me-2"></i> Export Bookmarks to
              CSV
            </button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default OffcanvasMenu;
