import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

function DeletePostPage() {
  const url = `${process.env.REACT_APP_API_URL}`;
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    fetch(`${url}/post/${id}`)
      .then((response) => response.json())
      .then((postInfo) => setPostInfo(postInfo));
  }, []);

  async function deletePost() {
    const response = await fetch(`${url}/post/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  if (!postInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Delete Post</h2>
      <p>Are you sure you want to delete this post?</p>
      <h3>{postInfo.title}</h3>
      <p>{postInfo.summary}</p>
      <button onClick={deletePost}>Delete</button>
    </div>
  );
}

export default DeletePostPage;
