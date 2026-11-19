import AppShell from "./components/layout/AppShell";
import { AdminOnly } from "./components/layout/AdminOnly";
import CustomersPage from "./pages/customers";
import CalendarPage from "./pages/calendar";
import SettingsPage from "./pages/settings";
import Login from "./pages/login";
import BookPage from "./pages/book";
import EmailPage from "./pages/email";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    name: "staff",
    element: <AppShell />,
    children: [
      { index: true, name: "customers", element: <AdminOnly><CustomersPage /></AdminOnly> },
      { path: "calendar", name: "calendar", element: <CalendarPage /> },
      { path: "settings", name: "settings", element: <AdminOnly><SettingsPage /></AdminOnly> },
    ],
  },
  { path: "/login", name: "login", element: <Login /> },
  { path: "/book/:token", name: "book", element: <BookPage /> },
  { path: "/email/:token", name: "email", element: <EmailPage /> },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
