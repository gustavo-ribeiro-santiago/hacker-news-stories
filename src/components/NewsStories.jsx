import Comments from './Comments.jsx';
import { useState, useEffect } from 'react';

const NewsStories = ({ pageData }) => {
  console.log(pageData);
  // Displays news stories from current page
  const [newsWithVisibleComments, setNewsWithVisibleComments] = useState([]);
  const [newsWithShowAuthorText, setNewsWithShowAuthorText] = useState([]);

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

  const handleShowAuthorText = (i) => {
    // Show or hide comments
    if (!newsWithShowAuthorText.includes(i)) {
      setNewsWithShowAuthorText([...newsWithShowAuthorText, i]);
      return;
    }
    setNewsWithShowAuthorText(newsWithShowAuthorText.filter((id) => id !== i));
  };

  return (
    <ul className="list-group custom-styles">
      {pageData.map(
        (
          {
            objectID,
            title,
            url,
            created_at,
            num_comments,
            children,
            story_text,
          },
          i
        ) => (
          <li key={objectID} className="list-group-item">
            <a className="text-dark text-decoration-none news-title" href={url}>
              {title}
            </a>
            <br />
            <div className="news-subtitle">
              <span className="posted"> Posted: </span>
              {created_at.substring(0, 16).replace('T', ' ')}
              {url && (
                <>
                  <span className="url"> URL: </span>
                  <a className="text-dark" href={url}>
                    {url}
                  </a>
                </>
              )}
              {story_text && (
                <>
                  <button
                    className="border-0 ms-2 clickable-quote-icon"
                    onClick={() => handleShowAuthorText(i)}
                    title="Click to show/hide author's text"
                  >
                    <i className="bi bi-blockquote-left"></i>
                  </button>
                  {newsWithShowAuthorText.includes(i) ?
                  <div
                    className={`comments ${
                      newsWithShowAuthorText.includes(i) ? 'visible' : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: story_text }}
                  ></div>
                  : ''}
                </>
              )}
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
