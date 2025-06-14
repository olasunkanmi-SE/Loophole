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
import { PaymentProvider } from "@/contexts/PaymentContext";
import { NotificationProvider } from './contexts/NotificationContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { SocialProvider } from './contexts/SocialContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { FinancialProvider } from './contexts/FinancialContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from "@/components/ProtectedRoute";
import FloatingChatIcon from "@/components/FloatingChatIcon";
import Chat from "@/pages/Chat";
import Housing from './pages/Housing';
import NotFound from "@/pages/NotFound";
import Questionnaire from "@/pages/Questionnaire";
import OrderHistory from "@/pages/OrderHistory";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminOrders from "@/pages/AdminOrders";
import AdminSurveys from './pages/AdminSurveys';
import AdminMenu from './pages/AdminMenu';
import AdminFinance from './pages/AdminFinance';
import AdminContent from './pages/AdminContent';
import AdminSettings from './pages/AdminSettings';
import AdminHousing from './pages/AdminHousing';
import UserOrders from './pages/UserOrders';
import Notifications from './pages/Notifications';
import Achievements from './pages/Achievements';
import Social from './pages/Social';
import OfflineIndicator from './components/OfflineIndicator';
import PaymentHistory from './pages/PaymentHistory';
import FinancialAnalytics from './pages/FinancialAnalytics';
import BudgetManager from './pages/BudgetManager';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PointsProvider>
          <PaymentProvider>
            <NotificationProvider>
              <SurveyProvider>
                <GamificationProvider>
                  <SocialProvider>
                    <OfflineProvider>
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
                        <Route path="/notifications">
                          <ProtectedRoute>
                            <Notifications />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/achievements">
                          <ProtectedRoute>
                            <Achievements />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/social">
                          <ProtectedRoute>
                            <Social />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/order-history">
                           <ProtectedRoute>
                             <OrderHistory />
                           </ProtectedRoute>
                         </Route>
                        <Route path="/chat">
                          <ProtectedRoute>
                            <Chat />
                          </ProtectedRoute>
                        </Route>
                       <Route path="/payment-history">
                           <ProtectedRoute>
                            <PaymentHistory />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/financial-analytics">
                          <ProtectedRoute>
                            <FinancialAnalytics />
                          </ProtectedRoute>
                        </Route>
                         <Route path="/budget-manager">
                          <ProtectedRoute>
                            <BudgetManager />
                          </ProtectedRoute>
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard">
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/users">
                          <ProtectedRoute>
                            <AdminUsers />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/orders">
                          <ProtectedRoute>
                            <AdminOrders />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/surveys">
                          <ProtectedRoute>
                            <AdminSurveys />
                          </ProtectedRoute>
                        </Route>
                         <Route path="/admin/menu">
                          <ProtectedRoute>
                            <AdminMenu />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/finance">
                          <ProtectedRoute>
                            <AdminFinance />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/content">
                          <ProtectedRoute>
                            <AdminContent />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/housing">
                          <ProtectedRoute>
                            <AdminHousing />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/settings">
                          <ProtectedRoute>
                            <AdminSettings />
                          </ProtectedRoute>
                        </Route>
                        <Route path="/admin/user-orders/:email">
                          {(params) => (
                            <ProtectedRoute>
                              <UserOrders userEmail={decodeURIComponent(params.email)} />
                            </ProtectedRoute>
                          )}
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
                      <OfflineIndicator />
                    </OfflineProvider>
                  </SocialProvider>
                </GamificationProvider>
              </SurveyProvider>
            </NotificationProvider>
          </PaymentProvider>
        </PointsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;