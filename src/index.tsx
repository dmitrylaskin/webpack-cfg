import React, {Suspense} from "react";
import ReactDOM from "react-dom/client";
import {App} from "./components/App";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AboutLazy} from "./pages/About/About.lazy";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/about",
                // ленивая подгрузка, разделение на чанки
                element: <Suspense fallback={'Loading...'}><AboutLazy/></Suspense>,
            },
        ]
    },

]);

root.render(<RouterProvider router={router}/>);