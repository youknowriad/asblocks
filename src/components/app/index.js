import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";
import { Suspense, useLayoutEffect } from "@wordpress/element";
import { RouteNew } from "../route-new";
import { RouteWrite } from "../route-write";
import { RouteRead } from "../route-read";
import { clearCache } from "../../lib/data";
import { LoadingPage } from "../loading-page";

function ClearCacheOnNavigate() {
  const location = useLocation();
  useLayoutEffect(() => {
    clearCache();
  }, [location]);

  return null;
}

export function App() {
  return (
    <Router>
      <ClearCacheOnNavigate />

      <Suspense fallback={<LoadingPage />}>
        <Route path="/write/:id/:ownerKey">
          <RouteWrite />
        </Route>

        <Route path="/write/:id">
          <RouteRead />
        </Route>

        <Route path="/read/:id">
          <RouteRead />
        </Route>

        <Route exact path="/">
          <RouteNew />
        </Route>
      </Suspense>
    </Router>
  );
}
