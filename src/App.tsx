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
import EntertainmentQuestionnaire from "@/pages/EntertainmentQuestionnaire";
import TravelQuestionnaire from "@/pages/TravelQuestionnaire";
import HealthQuestionnaire from "@/pages/HealthQuestionnaire";
import EducationQuestionnaire from "@/pages/EducationQuestionnaire";
import FinanceQuestionnaire from "@/pages/FinanceQuestionnaire";
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
import Housing from './pages/Housing';
import NotFound from "@/pages/NotFound";
import Questionnaire from "@/pages/Questionnaire";

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
            <Route path="/questionnaire">
              <ProtectedRoute>
                <Questionnaire />
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
            <Route path="/questionnaire/entertainment">
              <ProtectedRoute>
                <EntertainmentQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/questionnaire/travel">
              <ProtectedRoute>
                <TravelQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/questionnaire/health">
              <ProtectedRoute>
                <HealthQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/questionnaire/education">
              <ProtectedRoute>
                <EducationQuestionnaire />
              </ProtectedRoute>
            </Route>
            <Route path="/questionnaire/finance">
              <ProtectedRoute>
                <FinanceQuestionnaire />
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
            <Route path="/housing">
              <ProtectedRoute>
                <Housing />
              </ProtectedRoute>
            </Route>

            {/* Catch-all route for 404 - must be last */}
            <Route>
              <ProtectedRoute>
                <NotFound />
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