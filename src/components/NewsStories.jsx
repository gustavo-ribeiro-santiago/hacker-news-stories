import Comments from './Comments.jsx';
import Button from 'react-bootstrap/Button';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '.././auth';

const NewsStories = ({
  pageData,
  createAISummary,
  newsWithSummaries,
  loggedIn,
  toastUser,
  bookmarkedArticlesIDs,
  handleUpdateBookmarks,
  showBookmarkedArticles,
}) => {
  // Displays news stories from current page
  const [newsWithVisibleComments, setNewsWithVisibleComments] = useState([]);
  const [newsWithShowAuthorText, setNewsWithShowAuthorText] = useState([]);
  const [newsWithShowSummary, setNewsWithShowSummary] = useState([]);

  useEffect(() => {
    setNewsWithVisibleComments([]);
  }, [showBookmarkedArticles]);

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

  const handleAddOrDeleteBookmark = (id, title, url) => {
    if (loggedIn === false) {
      toastUser('danger', 'You need to sign in before bookmarking an article.');
    } else {
      if (bookmarkedArticlesIDs.includes(Number(id))) {
        // Delete bookmark
        fetchWithAuth(
          'https://hacker-news-ai-backend.xyz/api/delete_saved_article/',
          {
            article_hn_id: id,
          },
          'DELETE'
        )
          .then((response) => {
            toastUser(
              'success',
              `The bookmark for the article "${title}" was successfully deleted.`
            );
            handleUpdateBookmarks();
          })
          .catch((err) =>
            toastUser(
              'danger',
              `Following error occured while trying to delete the bookmark: ${err}`
            )
          );
      } else {
        // Add bookmark
        fetchWithAuth('https://hacker-news-ai-backend.xyz/api/add_article/', {
          article_hn_id: id,
          article_name: title,
          article_link: url,
        })
          .then((response) => {
            toastUser(
              'success',
              `The article "${title}" has been bookmarked successfully.`
            );
            handleUpdateBookmarks();
          })
          .catch((err) =>
            toastUser(
              'danger',
              `Following error occured while trying to bookmark the article: ${err}`
            )
          );
      }
    }
  };

  return (
    <ul className="list-group custom-styles">
      {pageData.map(
        (
          {
            objectID,
            id, // if fetched through the id of the article, returns the property id instead of objectID
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
                      handleCreateShowOrHideAISummary(objectID || id, url);
                    }}
                  >
                    <i className="bi bi-lightning-charge"></i>
                    {newsWithShowSummary.includes(objectID || id)
                      ? 'Hide AI Summary'
                      : newsWithSummariesIDs.includes(objectID || id)
                      ? 'Show AI Summary'
                      : 'Create AI Summary'}
                  </Button>
                  {newsWithShowSummary.includes(objectID || id) ? (
                    <div className="border border-black-subtle rounded-3 p-2 m-2">
                      <i className="bi bi-lightning-charge"></i>
                      {(() => {
                        const newsIndex = newsWithSummariesIDs.indexOf(
                          objectID || id
                        );
                        const elapsedTime =
                          newsWithSummaries[newsIndex]?.elapsedTime;
                        return elapsedTime
                          ? `AI Summary (done in ${(elapsedTime / 1000).toFixed(
                              1
                            )}s): `
                          : 'AI Summary:';
                      })()}
                      <div className="mt-2">
                        <ReactMarkdown>
                          {
                            newsWithSummaries[
                              newsWithSummariesIDs.indexOf(objectID || id)
                            ].summary
                          }
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              <button
                className="border-0 ms-2 clickable-bookmark-icon"
                onClick={() => {
                  handleAddOrDeleteBookmark(objectID || String(id), title, url);
                }}
                title={
                  bookmarkedArticlesIDs.includes(id || Number(objectID))
                    ? 'Delete bookmark'
                    : 'Bookmark article'
                }
              >
                <i
                  className={`bi bi-bookmark${
                    bookmarkedArticlesIDs.includes(id || Number(objectID))
                      ? '-fill'
                      : ''
                  }`}
                ></i>
              </button>
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
              {(() => {
                if (showBookmarkedArticles) {
                  num_comments = children.length;
                }
                return (
                  num_comments > 0 && (
                    <div className="inline-display">
                      <button
                        className="border-0 ms-2 clickable-chat-icon"
                        onClick={() => handleShowComments(id || Number(objectID))}
                        title="Click to show/hide comments"
                      >
                        <i className="bi bi-chat-left me-1"></i>
                        {num_comments}
                      </button>
                      <ul
                        className={`comments ${
                          newsWithVisibleComments.includes(id || Number(objectID)) ? 'visible' : ''
                        }`}
                        id={i}
                      >
                        <Comments
                          commentsData={children}
                          showBookmarkedArticles={showBookmarkedArticles}
                        />
                      </ul>
                    </div>
                  )
                );
              })()}
            </div>
          </li>
        )
      )}
    </ul>
  );
};

export default NewsStories;
