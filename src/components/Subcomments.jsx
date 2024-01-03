const Subcomments = ({ subcomments }) => {
  // Display subcomments recursively, since each subcomment may have children subcomments, and so on
  return subcomments.map(({ text, author, children }) => (
    <ul>
      <li className="p-1 m-1 border list-group-item rounded">
        <i className="bi bi-chat-left me-2"></i>
        <span className="fst-italic">by {author}</span>
        <span>
          : {<div dangerouslySetInnerHTML={{ __html: text }} />}
          {children.length > 0 && (
            <Subcomments subcomments={children} />
          )}
        </span>
      </li>
    </ul>
  ));
};

export default Subcomments;