import Layout from "@/components/Layout";
import { Route, Switch } from "wouter";
import Listing from "@/pages/Listing"; // Changed import path
import Home from "@/pages/Home"; // Added import for Home
import ErrorPage from "@/pages/ErrorPage"; // Added import for ErrorPage

export default function App() {
  return (
    <Layout>
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/listing/:id">
            <Listing />
          </Route>
          <Route path="*">
            <ErrorPage
              title="404: Page Not Found"
              message="Sorry, the page you are looking for does not exist"
            />
          </Route>
        </Switch>
      </main>
    </Layout>
  );
}
