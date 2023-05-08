import React from "react";
import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, content, cover, createdAt, author }) {
  // const src = cover && cover.includes("https://") ? cover : "http://localhost:4000/" + cover;
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={cover} alt="ImagePost"></img>
        </Link>
      </div>
      <div className="content">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a href="$" className="author">
            {author.username}
          </a>
          {/* <time>{format(new Date(createdAt),'MMM d, yyyy HH:mm')}</time> */}
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
