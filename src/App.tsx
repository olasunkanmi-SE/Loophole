import Layout from "@/components/Layout";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import NewHome from "./pages/NewHome";
import Quiz from "./pages/Quiz";
import Listing from "@/pages/Listing";
import Listings from "@/pages/Listings";
// Import Home
import FoodMenu from "@/pages/FoodMenu";
import MenuItemDetail from "@/pages/MenuItemDetail";
import OrderSummary from "@/pages/OrderSummary";
import LifestyleQuestionnaire from "@/pages/LifestyleQuestionnaire";
import DigitalQuestionnaire from "@/pages/DigitalQuestionnaire";
import FoodQuestionnaire from "@/pages/FoodQuestionnaire";
import Points from "@/pages/Points";
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CreateProfile from './pages/CreateProfile';
import ResetPassword from "./pages/ResetPassword";
import Settings from './pages/Settings';
import ErrorPage from "@/pages/ErrorPage";
import { CartProvider } from "@/contexts/CartContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingChatIcon from "@/components/FloatingChatIcon";
import Chat from "@/pages/Chat";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PointsProvider>
          <Switch>
            {/* Public routes */}
            <Route path="/signin">
              <SignIn />
            </Route>
            <Route path="/signup">
              <SignUp />
            </Route>
            <Route path="/create-profile">
              <CreateProfile />
            </Route>
            <Route path="/reset-password">
              <ResetPassword />
            </Route>

            {/* Protected routes */}
            <Route path="/">
              <ProtectedRoute>
                <NewHome />
              </ProtectedRoute>
            </Route>
            <Route path="/quiz">
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Route>
            <Route path="/home">
              <ProtectedRoute>
                <NewHome />
              </ProtectedRoute>
            </Route>
            <Route path="/lifestyle">
              <ProtectedRoute>
                <LifestyleQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/digital">
              <ProtectedRoute>
                <DigitalQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/food">
              <ProtectedRoute>
                <FoodQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/food-menu">
              <ProtectedRoute>
                <FoodMenu />
              </ProtectedRoute>
            </Route>
            <Route path="/menu">
              <ProtectedRoute>
                <FoodMenu />
              </ProtectedRoute>
            </Route>
            <Route path="/menu/:id">
              {(params) => (
                <ProtectedRoute>
                  <MenuItemDetail id={params.id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/order-summary">
              <ProtectedRoute>
                <OrderSummary />
              </ProtectedRoute>
            </Route>
            <Route path="/points">
              <ProtectedRoute>
                <Points />
              </ProtectedRoute>
            </Route>
            <Route path="/location">
              <ProtectedRoute>
                <NewHome />
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
              {(params) => (
                <ProtectedRoute>
                  <Listing id={params.id} />
                </ProtectedRoute>
              )}
            </Route>
            <Route path="/chat">
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            </Route>
          </Switch>

          {/* Floating Chat Icon - appears on all protected routes */}
          <FloatingChatIcon />
        </PointsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;