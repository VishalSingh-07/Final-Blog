import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

function Header() {
  const url = `${process.env.REACT_APP_API_URL}`;
  const { userInfo, setUserInfo } = useContext(UserContext);
  useEffect(() => {
    fetch(`/profile`, {
      credentials: "include",
    }).then((response) => {
      response.json().then((userinfo) => {
        setUserInfo(userinfo);
      });
    });
  }, []); // eslint-disable-next-line

  function logout() {
    fetch(`${url}/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }
  const username = userInfo?.username;
  return (
    <header>
      <Link to="/" className="logo">
        My Blog
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create new Post</Link>
            <a href="" onClick={logout}>
              Logout
            </a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
