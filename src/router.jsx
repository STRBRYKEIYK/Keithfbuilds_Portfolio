import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Project from "./pages/Project.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/project/:slug", element: <Project /> },
  { path: "*", element: <NotFound /> },
]);
