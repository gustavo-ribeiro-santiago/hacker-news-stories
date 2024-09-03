import Comments from './Comments.jsx';
import Button from 'react-bootstrap/Button';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';

const NewsStories = ({ pageData, createAISummary, newsWithSummaries }) => {
  console.log(pageData);
  // Displays news stories from current page
  const [newsWithVisibleComments, setNewsWithVisibleComments] = useState([]);
  const [newsWithShowAuthorText, setNewsWithShowAuthorText] = useState([]);
  const [newsWithShowSummary, setNewsWithShowSummary] = useState([]);

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

  let newsWithSummariesIDs = newsWithSummaries.map((news) => news.objID);

  const handleCreateShowOrHideAISummary = (objectID, url) => {
    if (!newsWithSummariesIDs.includes(objectID)) {
      createAISummary(objectID, url);
      setNewsWithShowSummary([...newsWithShowSummary, objectID]);
      return;
    }
    if (!newsWithShowSummary.includes(objectID)) {
      setNewsWithShowSummary([...newsWithShowSummary, objectID]);
      return;
    }
    const updatednewsWithShowSummary = newsWithShowSummary.filter(
      (id) => id !== objectID
    );
    setNewsWithShowSummary([...updatednewsWithShowSummary]);
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
            author,
            points,
          },
          i
        ) => (
          <li key={objectID} className="list-group-item custom-news-container">
            <a className="text-dark text-decoration-none news-title" href={url}>
              {title}
            </a>
            <br />
            <div className="news-subtitle mt-1">
              <span className="posted"> Posted: </span>
              {created_at.substring(0, 16).replace('T', ' ')}
              <span className="author"> Author: </span>
              {author}
              <span className="points"> Points: </span>
              {points}
              {url && (
                <>
                  <span className="url"> URL: </span>
                  <a className="text-dark" href={url}>
                    {url}
                  </a>
                  <Button
                    className="btn-sm custom-small-button"
                    variant="outline-dark"
                    onClick={() => {
                      handleCreateShowOrHideAISummary(objectID, url);
                    }}
                  >
                    <i className="bi bi-lightning-charge"></i>
                    {newsWithShowSummary.includes(objectID)
                      ? 'Hide AI Summary'
                      : newsWithSummariesIDs.includes(objectID)
                      ? 'Show AI Summary'
                      : 'Create AI Summary'}
                  </Button>
                  {newsWithShowSummary.includes(objectID) ? (
                    <div className="border border-black-subtle rounded-3 p-2 m-2">
                      <i className="bi bi-lightning-charge"></i>
                      AI Summary:
                      <div className="mt-2">
                      <ReactMarkdown>{
                          newsWithSummaries[
                            newsWithSummariesIDs.indexOf(objectID)
                          ].summary
                        }</ReactMarkdown>
                      </div>
                    </div>
                  ) : null}
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
                  {newsWithShowAuthorText.includes(i) ? (
                    <div
                      className={`comments ${
                        newsWithShowAuthorText.includes(i) ? 'visible' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: story_text }}
                    ></div>
                  ) : (
                    ''
                  )}
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
