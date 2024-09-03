import Subcomments from './Subcomments.jsx';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Comments = ({ commentsId }) => {
  // Fetching each comment fetches all its children subcomments with, including subcomments' subcomments and so on
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchComments(commentsId).then((response) => {
      setComments(response);
    });
  }, [commentsId]);

  if (!Array.isArray(comments)) return;
  return (
    <div className="comment">
      {comments.map(({ text, author, children }) => (
        <li className="p-1 m-1 border list-group-item rounded">
          <i className="bi bi-chat-left me-2"></i>
          <span className="fst-italic">by {author}</span>
          <span>
            : {<div dangerouslySetInnerHTML={{ __html: text }} />}
            {children.length > 0 && <Subcomments subcomments={children} />}
          </span>
        </li>
      ))}
    </div>
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
