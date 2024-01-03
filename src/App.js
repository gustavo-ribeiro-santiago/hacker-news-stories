import './App.css';
import Form from 'react-bootstrap/Form';
import React, { useEffect, useState } from 'react';
import NewsStories from './components/NewsStories.jsx';
import Pagination from './components/Pagination.jsx';
import useDataApi from './useDataApi.js';
import 'bootstrap/dist/css/bootstrap.min.css';

var timeoutIds = [];

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const pageSize = 10;

  // useDataApi custom hook fetches data and manages states
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search_by_date?tags=story&query=&hitsPerPage=50',
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
  const debouncedFetch = debounce(doFetch, 2000);

  useEffect(() => {
    debouncedFetch(
      `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=${query}&hitsPerPage=50`,
      data
    );
  }, [query]);

  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };

  let pageData = data.hits;
  if (pageData.length >= 1) {
    pageData = paginate(pageData, currentPage, pageSize);
  }

  return (
    <div className="app">
      <header className="border rounded mx-auto">
        <h1 className="title">
          <i className="bi bi-newspaper me-2"></i>Hacker News Stories
        </h1>
        <h4 className="text-center text-secondary">
          What's up in the tech world?
        </h4>
      </header>
      <Form.Control
        id="form-search"
        className="search bg-primary text-white"
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
      />
      {isError && <div>Error loading page.</div>}
      {isLoading ? <div>Loading ...</div> : <NewsStories pageData={pageData} />}
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
