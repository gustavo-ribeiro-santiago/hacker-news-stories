import './App.css';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useState } from 'react';
import SortBySection from './components/SortBySection.jsx';
import FilterBySection from './components/FilterBySection.jsx';
import NewsStories from './components/NewsStories.jsx';
import Pagination from './components/Pagination.jsx';
import useDataApi from './useDataApi.js';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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

  let pageData = data.hits;
  if (pageData.length >= 1) {
    pageData = paginate(pageData, currentPage, pageSize);
  }

  const createAISummary = async (objID, link) => {
    try {
      let updatedNewswithSummaries = [
        ...newsWithSummaries,
        { objID, summary: 'Summarizing...' },
      ]
      setNewsWithSummaries([...updatedNewswithSummaries]);
      const response = await axios.post(
        'http://localhost:8001/api/summarize-link/',
        { link }
      );
      console.log('Response:', response.data);
      updatedNewswithSummaries = updatedNewswithSummaries.map((news) => {
        if (news.objID === objID) return { objID, summary: response.data.summary };
        return news;
      });
      console.log(updatedNewswithSummaries)
      setNewsWithSummaries([...updatedNewswithSummaries]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
      {isError && <div>Error loading page.</div>}
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <NewsStories
          pageData={pageData}
          createAISummary={createAISummary}
          newsWithSummaries={newsWithSummaries}
        />
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        currentPage={currentPage}
      ></Pagination>
    </div>
  );
}

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let pageData = items.slice(start, start + pageSize);
  return pageData;
}

export default App;
