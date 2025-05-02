import Subcomments from './Subcomments.jsx';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';

const Comments = ({ commentsData }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // normalize commentsData into a flat array of IDs:
    const ids = commentsData.map((item) =>
      typeof item === 'number' ? item : item.id
    );

    fetchComments(ids).then(setComments);
  }, [commentsData]);

  if (!Array.isArray(comments)) return null;

  return (
    <div className="comment">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

const CommentItem = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [subcomments, setSubcomments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleShowReplies = async () => {
    setLoading(true);
    // Fetch subcomments only when user requests
    const children = await fetchComments(comment.children.map((c) => c.id));
    setSubcomments(children);
    setShowReplies(true);
    setLoading(false);
  };

  return (
    <li className="p-1 m-1 border list-group-item rounded">
      <i className="bi bi-chat-left me-2"></i>
      <span className="fst-italic">by {comment.author} at {new Date(comment.created_at).toLocaleString()}</span>
      <span>
        : <div dangerouslySetInnerHTML={{ __html: comment.text }} />
        {comment.children.length > 0 && (
          <>
            {!showReplies ? (
              <Button
              className="btn-sm custom-small-button mt-2"
              variant="outline-dark"
              onClick={handleShowReplies}
              disabled={loading}
              >
                <i className="bi bi-chevron-down me-2"></i>
                {loading
                  ? 'Loading...'
                  : `Show Replies (${comment.children.length})`}
              </Button>
            ) : (
              <Button
                className="btn-sm custom-small-button mt-2"
                variant="outline-dark"
                onClick={() => setShowReplies(false)}
              >
                <i className="bi bi-chevron-up me-2"></i>
                Hide Replies
              </Button>
            )}
            {showReplies && <Subcomments subcomments={subcomments} />}
          </>
        )}
      </span>
    </li>
  );
};

const fetchComments = async (commentsId) => {
  try {
    let commentsPromises = commentsId.map((commentId) =>
      axios.get('https://hn.algolia.com/api/v1/items/' + commentId)
    );

    let commentsResponses = await Promise.allSettled(commentsPromises);

    const comments = commentsResponses
      .filter((response) => response.status === 'fulfilled')
      .map((response) => response.value.data);

    console.log('comments', comments);

    return comments;
  } catch (error) {
    return [
      {
        author: '',
        text: 'Failed to load comment(s)',
        children: [],
      },
    ];
  }
};

export default Comments;
