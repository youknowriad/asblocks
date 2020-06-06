import { BrowserRouter as Router, Route, useLocation } from "react-router-dom";
import { Suspense, useLayoutEffect } from "@wordpress/element";
import { RouteNew } from "../route-new";
import { RouteWrite } from "../route-write";
import { RouteRead } from "../route-read";
import { clearCache } from "../../lib/data";

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

      <Suspense fallback="loading...">
        <Route exact path="/">
          <RouteNew />
        </Route>

        <Route exact path="/write/:id">
          <RouteWrite />
        </Route>

        <Route exact path="/read/:id">
          <RouteRead />
        </Route>
      </Suspense>
    </Router>
  );
}
