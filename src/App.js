import { Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./Components/Layout";
import IndexPage from "./Components/pages/IndexPage";
import LoginPage from "./Components/pages/LoginPage";
import RegisterPage from "./Components/pages/RegisterPage";
import CreatePost from "./Components/pages/CreatePost";
import { UserContextProvider } from "./UserContext";
import PostPage from "./Components/pages/PostPage";
import EditPostPage from "./Components/pages/EditPostPage";
import DeletePostPage from "./Components/pages/DeletePostPage";
function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path={"/login"} element={<LoginPage />} />
          <Route path={"/register"} element={<RegisterPage />} />
          <Route path={"/create"} element={<CreatePost />} />
          <Route path={"/post/:id"} element={<PostPage />} />
          <Route path={"/edit/:id"} element={<EditPostPage />} />
          <Route path={"/delete/:id"} element={<DeletePostPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
