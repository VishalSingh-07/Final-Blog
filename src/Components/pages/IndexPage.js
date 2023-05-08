import React, { useEffect, useState } from "react";
import Post from "../Post";

function IndexPage() {
  const url = `${process.env.REACT_APP_API_URL}`;
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch(`${url}/post`).then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);
  return <>{posts.length > 0 && posts.map((post) => <Post key={post._id} {...post} />)}</>;
}

export default IndexPage;
