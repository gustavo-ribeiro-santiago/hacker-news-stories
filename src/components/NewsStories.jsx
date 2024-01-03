import Comments from './Comments.jsx';
import { useState, useEffect } from 'react';

const NewsStories = ({ pageData }) => {
  // Displays news stories from current page
  const [newsWithVisibleComments, setNewsWithVisibleComments] = useState([]);

  useEffect(() => {
    setNewsWithVisibleComments([]);
  }, [pageData]);

  const handleShowComments = (i) => {
    // Show or hide comments
    if (!newsWithVisibleComments.includes(i)) {
      setNewsWithVisibleComments([...newsWithVisibleComments, i]);
      return;
    }
    setNewsWithVisibleComments(
      newsWithVisibleComments.filter((id) => id !== i)
    );
  };

  return (
    <ul className="list-group custom-styles">
      {pageData.map(
        ({ objectID, title, url, created_at, num_comments, children }, i) => (
          <li key={objectID} className="list-group-item">
            <a className="text-dark text-decoration-none news-title" href={url}>
              {title}
            </a>
            <br />
            <div className="news-subtitle">
              <span className="posted"> Posted: </span>
              {created_at.substring(0, 16).replace('T', ' ')}
              <span className="url"> URL: </span>
              <a className="text-dark" href={url}>
                {url}
              </a>
              {num_comments > 0 && (
                <>
                  <button
                    className="border-0 ms-2 clickable-chat-icon"
                    onClick={() => handleShowComments(i)}
                    title="Click to show/hide comments"
                  >
                    <i className="bi bi-chat-left me-1"></i>
                    {num_comments}
                  </button>
                  <ul
                    className={`comments ${
                      newsWithVisibleComments.includes(i) ? 'visible' : ''
                    }`}
                    id={i}
                  >
                    <Comments commentsId={children} />
                  </ul>
                </>
              )}
            </div>
          </li>
        )
      )}
    </ul>
  );
};

export default NewsStories;
