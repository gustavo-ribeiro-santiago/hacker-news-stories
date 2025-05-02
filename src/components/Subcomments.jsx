import { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

// You can import fetchComments from Comments.jsx or move it to a utils file
const fetchComments = async (commentsId) => {
  try {
    let commentsPromises = commentsId.map((commentId) =>
      axios.get('https://hn.algolia.com/api/v1/items/' + commentId)
    );

    let commentsResponses = await Promise.allSettled(commentsPromises);

    const comments = commentsResponses
      .filter((response) => response.status === 'fulfilled')
      .map((response) => response.value.data);

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

const Subcomments = ({ subcomments }) => {
  return (
    <ul>
      {subcomments.map((subcomment) => (
        <SubcommentItem key={subcomment.id} comment={subcomment} />
      ))}
    </ul>
  );
};

const SubcommentItem = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [subcomments, setSubcomments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleShowReplies = async () => {
    setLoading(true);
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

export default Subcomments;