import Layout from "@/components/Layout";
import { Route, Switch } from "wouter";
import Listing from "@/pages/Listing";
import Listings from "@/pages/Listings";
import Home from "@/pages/Home"; // Import Home
import FoodMenu from "@/pages/FoodMenu";
import MenuItemDetail from "@/pages/MenuItemDetail";
import OrderSummary from "@/pages/OrderSummary";
import Quiz from "@/pages/Quiz";
import LifestyleQuestionnaire from "@/pages/LifestyleQuestionnaire";
import DigitalQuestionnaire from "@/pages/DigitalQuestionnaire";
import FoodQuestionnaire from "@/pages/FoodQuestionnaire";
import ErrorPage from "@/pages/ErrorPage";
import { CartProvider } from "@/contexts/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Layout>
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} /> {/* Set Home as the default route */}
            <Route path="/menu" component={FoodMenu} />
            <Route path="/menu/:id" component={MenuItemDetail} />
            <Route path="/order-summary" component={OrderSummary} />
            <Route path="/quiz" component={Quiz} />
            <Route path="/questionnaire/lifestyle" component={LifestyleQuestionnaire} />
            <Route path="/questionnaire/digital" component={DigitalQuestionnaire} />
            <Route path="/questionnaire/food" component={FoodQuestionnaire} />
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
    </CartProvider>
  );
}
