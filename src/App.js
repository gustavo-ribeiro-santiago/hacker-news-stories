import './App.css';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import React, { useEffect, useState } from 'react';
import SortBySection from './components/SortBySection.jsx';
import FilterBySection from './components/FilterBySection.jsx';
import NewsStories from './components/NewsStories.jsx';
import Pagination from './components/Pagination.jsx';
import OffcanvasMenu from './components/OffcanvasMenu.jsx';
import useDataApi from './useDataApi.js';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, getAdditionalUserInfo } from 'firebase/auth';
import 'bootstrap/dist/css/bootstrap.min.css';
import { signInWithGoogle, logOut, fetchWithAuth } from './auth';

var timeoutIds = [];

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [showFilterBy, setShowFilterBy] = useState(false);
  const [showSortBy, setShowSortBy] = useState(false);
  const [sortBy, setSortBy] = useState('search_by_date');
  const [filteredStoryType, setFilteredStoryType] = useState('All Stories');
  const [filteredDate, setFilteredDate] = useState('');
  const [filteredTags, setFilteredTags] = useState('');
  const [isMobile, setIsMobile] = useState(true);
  const [newsWithSummaries, setNewsWithSummaries] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showBookmarkedArticles, setShowBookmarkedArticles] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(false);
  const [bookmarkedArticlesIDs, setBookmarkedArticlesIDs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('');
  const pageSize = 10;

  // useDataApi custom hook fetches data and manages states
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search_by_date?tags=(story,show_hn,ask_hn)&query=&hitsPerPage=50',
    {
      hits: [],
    }
  );

  // It is used debouncing to avoid making too many API calls while the user is typing in the search bar
  const debounce = (func, delay) => {
    return (...args) => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIds.push(setTimeout(() => func(...args), delay));
    };
  };
  const debouncedFetch = debounce(doFetch, 1000);

  useEffect(() => {
    let storyTypes = '(story,show_hn,ask_hn)';
    if (filteredStoryType === 'Show HN') storyTypes = '(show_hn)';
    if (filteredStoryType === 'Ask HN') storyTypes = '(ask_hn)';
    debouncedFetch(
      `https://hn.algolia.com/api/v1/${sortBy}?tags=${storyTypes}&query=${
        filteredTags + query
      }&hitsPerPage=50${filteredDate}`,
      data
    );
    setCurrentPage(1);
  }, [sortBy, filteredStoryType, filteredDate, filteredTags, query]);

  useEffect(() => {
    // Information text depends on screen width
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobile(false);
      } else {
        setIsMobile(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  let pageData = showBookmarkedArticles ? bookmarkedArticles : data.hits;
  if (pageData.length >= 1) {
    pageData = paginate(pageData, currentPage, pageSize);
  }

  const createAISummary = async (objID, link) => {
    try {
      let updatedNewswithSummaries = [
        ...newsWithSummaries,
        { objID, summary: 'Summarizing...', elapsedTime: '' },
      ];
      setNewsWithSummaries([...updatedNewswithSummaries]);
      const startTime = Date.now();
      const response = await axios.post(
        // 'http://localhost:8001/api/summarize-link/',
        'https://hacker-news-ai-backend.xyz/api/summarize-link/',
        { link }
      );
      const endTime = Date.now();
      const elapsedTime = endTime - startTime; // Time in milliseconds
      updatedNewswithSummaries = updatedNewswithSummaries.map((news) => {
        if (news.objID === objID)
          return { objID, summary: response.data.summary, elapsedTime };
        return news;
      });
      setNewsWithSummaries([...updatedNewswithSummaries]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toastUser = (variant, message) => {
    setShowToast(true);
    setToastVariant(variant);
    setToastMessage(message);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    monitorAuthState();
    if (getAdditionalUserInfo(result).isNewUser) {
      toastUser('success', `Welcome, ${result.user.displayName}!`);
    } else {
      toastUser('success', `Welcome back, ${result.user.displayName}!`);
    }
  };

  const handleLogout = () => {
    setShowOffcanvas(false);
    logOut();
  };

  const handleViewBookmarks = () => {
    fetchWithAuth('https://hacker-news-ai-backend.xyz/api/get_saved_articles/')
      .then((response) => {
        fetchBookmarkedArticlesData(response.reverse())
          .then((response) => {
            setBookmarkedArticles(response);
            setShowBookmarkedArticles(true);
            setShowOffcanvas(false);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => toastUser('danger', `Following error occured: ${err}`));
  };

  const handleBackToAllArticles = () => {
    setShowBookmarkedArticles(false);
    setShowOffcanvas(false);
  };

  const fetchBookmarkedArticlesData = async (bookmarkedArticles) => {
    try {
      let articlesPromises = bookmarkedArticles.map(({ article_hn_id }) =>
        axios.get('https://hn.algolia.com/api/v1/items/' + article_hn_id)
      );

      let articlesResponses = await Promise.allSettled(articlesPromises);

      const articles = articlesResponses
        .filter((response) => response.status === 'fulfilled')
        .map((response) => response.value.data);

      return articles;
    } catch (error) {
      return [
        {
          author: '',
          text: 'Failed to load bookmark(s)',
          children: [],
        },
      ];
    }
  };

  // Function to monitor authentication state
  const monitorAuthState = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is logged in:', user);
        setLoggedIn(true);
        setUserEmail(user.email);
        handleUpdateBookmarks();
      } else {
        console.log('No user is signed in.');
        setLoggedIn(false);
      }
    });
  };

  const handleUpdateBookmarks = () => {
    if (showBookmarkedArticles) {
      handleViewBookmarks(); // update all bookmarks data
    } else {
      fetchWithAuth('https://hacker-news-ai-backend.xyz/api/get_saved_articles/')
        .then((response) => {
          setBookmarkedArticlesIDs(
            response.map(({ article_hn_id }) => Number(article_hn_id))
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleExportToCSV = () => {
    fetchWithAuth('https://hacker-news-ai-backend.xyz/api/get_saved_articles/')
      .then((response) => {
        setBookmarkedArticlesIDs(
          response.map(({ article_hn_id }) => Number(article_hn_id))
        );
        fetchBookmarkedArticlesData(response.reverse())
          .then((response) => {
            setBookmarkedArticles(response);
            const csvData = jsonToCSV(response);
            const blob = new Blob([csvData], {
              type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];
            link.setAttribute('download', formattedDate + ' hns_bookmarks.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const jsonToCSV = (jsonArray) => {
    const keys = Object.keys(jsonArray[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(keys.join(','));

    // Add data rows
    for (const item of jsonArray) {
      const values = keys.map((key) => item[key]);
      csvRows.push(values.join(','));
    }

    return csvRows.join('\r\n');
  };

  useEffect(() => {
    monitorAuthState(); // Start monitoring auth state on app load
  }, []);

  return (
    <div className="app">
      <header className="border rounded mx-auto">
        <h1 className="title">
          <i className="bi bi-newspaper pe-2 me-2"></i>Hacker News Stories
        </h1>
        <h4 className="text-center text-secondary">
          What's up in the tech world?
        </h4>
      </header>
      <section className="menu-controls">
        <button
          onClick={(e) => {
            setShowFilterBy(!showFilterBy);
            setShowSortBy(false);
          }}
        >
          <i className="bi bi-funnel-fill"></i> {isMobile ? '' : 'Filter by'}
        </button>
        <button
          onClick={(e) => {
            setShowSortBy(!showSortBy);
            setShowFilterBy(false);
          }}
        >
          <i className="bi bi-sort-numeric-down"></i>
          {isMobile ? '' : ' Sort by'}
        </button>
        <div className="d-flex search-container">
          <i className="bi bi-search my-auto mx-1"></i>
          <span className="my-auto mx-1">{isMobile ? '' : 'Search:'}</span>
          <Form.Control
            id="form-search"
            className="search bg-primary text-white"
            placeholder={isMobile ? 'Search...' : 'Type here your search...'}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loggedIn ? (
          <button onClick={() => setShowOffcanvas(true)}>
            <i className="bi bi-person"></i> {isMobile ? '' : 'Account'}
          </button>
        ) : (
          <button onClick={handleGoogleSignIn}>
            <i className="bi bi-google"></i>{' '}
            {isMobile ? '' : 'Sign with Google'}
          </button>
        )}
      </section>
      {showFilterBy && (
        <FilterBySection
          setFilteredDate={setFilteredDate}
          filteredTags={filteredTags}
          setFilteredTags={setFilteredTags}
          filteredStoryType={filteredStoryType}
          setFilteredStoryType={setFilteredStoryType}
          isMobile={isMobile}
        />
      )}
      {showSortBy && <SortBySection sortBy={sortBy} setSortBy={setSortBy} />}
      {loggedIn && (
        <section className="logged-user-email">
          <i className="bi bi-circle-fill text-success icon-small"></i> Logged
          in as {userEmail}
        </section>
      )}
      {isError && <div>Error loading page.</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <NewsStories
          pageData={pageData}
          createAISummary={createAISummary}
          newsWithSummaries={newsWithSummaries}
          loggedIn={loggedIn}
          toastUser={toastUser}
          bookmarkedArticlesIDs={bookmarkedArticlesIDs}
          handleUpdateBookmarks={handleUpdateBookmarks}
          showBookmarkedArticles={showBookmarkedArticles}
        />
      )}
      <Pagination
        items={showBookmarkedArticles ? bookmarkedArticles : data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      ></Pagination>
      {showToast && (
        <Toast
          className="d-inline-block position-fixed bottom-0 end-0 m-3"
          bg={toastVariant}
          onClose={() => setShowToast(false)}
        >
          <Toast.Header>
            <i className="bi bi-newspaper me-2"></i>
            <strong className="me-auto">Hacker News Stories</strong>
            <small>Just now</small>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      )}
      <OffcanvasMenu
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
        showBookmarkedArticles={showBookmarkedArticles}
        handleBackToAllArticles={handleBackToAllArticles}
        handleViewBookmarks={handleViewBookmarks}
        handleExportToCSV={handleExportToCSV}
        handleLogout={handleLogout}
      />
    </div>
  );
}

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let pageData = items.slice(start, start + pageSize);
  return pageData;
}

export default App;
