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
import Points from "@/pages/Points";
import Profile from './pages/Profile';
import CreateProfile from './pages/CreateProfile';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import ErrorPage from "@/pages/ErrorPage";
import { CartProvider } from "@/contexts/CartContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PointsProvider>
          <Layout>
          <main className="flex-grow">
            <Switch>
              {/* Public routes */}
              <Route path="/signin" component={SignIn} />
              <Route path="/create-profile" component={CreateProfile} />
              
              {/* Protected routes */}
              <Route path="/">
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              </Route>
              <Route path="/location">
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              </Route>
              <Route path="/menu">
                <ProtectedRoute>
                  <FoodMenu />
                </ProtectedRoute>
              </Route>
              <Route path="/menu/:id">
                <ProtectedRoute>
                  <MenuItemDetail />
                </ProtectedRoute>
              </Route>
              <Route path="/order-summary">
                <ProtectedRoute>
                  <OrderSummary />
                </ProtectedRoute>
              </Route>
              <Route path="/questionnaire/lifestyle">
                <ProtectedRoute>
                  <LifestyleQuestionnaire />
                </ProtectedRoute>
              </Route>
              <Route path="/questionnaire/digital">
                <ProtectedRoute>
                  <DigitalQuestionnaire />
                </ProtectedRoute>
              </Route>
              <Route path="/questionnaire/food">
                <ProtectedRoute>
                  <FoodQuestionnaire />
                </ProtectedRoute>
              </Route>
              <Route path="/points">
                <ProtectedRoute>
                  <Points />
                </ProtectedRoute>
              </Route>
              <Route path="/profile">
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Route>
              <Route path="/settings">
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              </Route>
              <Route path="/listings">
                <ProtectedRoute>
                  <Listings />
                </ProtectedRoute>
              </Route>
              <Route path="/listing/:id">
                <ProtectedRoute>
                  <Listing />
                </ProtectedRoute>
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
        </PointsProvider>
      </CartProvider>
    </AuthProvider>
  );
}