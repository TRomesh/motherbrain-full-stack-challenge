import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import Home from "./pages/Home";
import World from "./pages/World";
import Organization from "./pages/Organization";
import NotFound from "./pages/NotFound";
import Funding from "./pages/Funding";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/world",
        element: <World />,
      },
      {
        path: "/organization",
        element: <Organization />,
      },
      {
        path: "/funding",
        element: <Funding />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
