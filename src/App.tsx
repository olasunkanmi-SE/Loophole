import Layout from "@/components/Layout";
import { Route, Switch } from "wouter";
import Listing from "@/pages/Listing";
import Listings from "@/pages/Listings";
import Home from "@/pages/Home"; // Import Home
import ErrorPage from "@/pages/ErrorPage";

export default function App() {
  return (
    <Layout>
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} /> {/* Set Home as the default route */}
          <Route path="/listings" component={Listings} />
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
