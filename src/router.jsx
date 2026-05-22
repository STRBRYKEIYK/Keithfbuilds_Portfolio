import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import Project from "./pages/Project.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "project/:slug", element: <Project /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
