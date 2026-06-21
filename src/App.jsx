import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import RouteSeo from "./components/seo/RouteSeo.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import { PaymentModalProvider } from "./context/paymentModalContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ConfirmationProvider } from "./context/ConfirmationContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import TenantContentGate from "./components/TenantContentGate.jsx";
import TenantRoleGate from "./components/TenantRoleGate.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminProtectedView from "./components/AdminProtectedView.jsx";

/* Public pages */
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPage from "./pages/PrivacyPage.jsx";
import AboutUsPage from "./pages/web/us/AboutUsPage.jsx";

/* Dashboards */
import DashboardPage from "./pages/DashboardPage";
import DashboardAdminPage from "./pages/admin/DashboardAdminPage";

/* Customers */
import CustomerPage from "./pages/CustomerPage.jsx";
import CustomerViewPage from "./pages/CustomerViewPage.jsx";

/* Products & Services */
import ProductsServicesPage from "./pages/ProductsServicesPage.jsx";
import ProductsServicesViewPage from "./pages/ProductsServicesViewPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";

/* Sales */
import SalesPage from "./pages/Sales/SalesPage.jsx";
import NewSalePage from "./pages/Sales/NewSalePage.jsx";
import ViewSalePage from "./pages/Sales/ViewSalePage.jsx";

/* Purchases */
import PurchasePage from "./pages/purchase/PurchasePage.jsx";
import ProviderPage from "./pages/purchase/ProviderPage.jsx";
import NewPurchasePage from "./pages/purchase/NewPurchasePage.jsx";
import ViewPurchasePage from "./pages/purchase/ViewPurchasePage.jsx";

/* Daily Sales */
import PageDailySales from "./pages/PageDailySales.jsx";
import ViewDailySalePage from "./pages/dailySales/ViewDailySalePage.jsx";

/* Business */
import RegisterBusinessPage from "./pages/business/RegisterBusinessPage.jsx";

/* Users */
import UsersPage from "./pages/users/UsersPage.jsx";
import UserGuestPage from "./pages/users/UserGuestPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ConfirmAccountPage from "./pages/users/ConfirmAccountPage.jsx";
import LogoutPage from "./pages/LogoutPage.jsx";

/* Finance */
import TransactionsPage from "./pages/TransactionsPage.jsx";
import ExpensesPage from "./pages/ExpensesPage.jsx";
import FinancePage from "./pages/FinancePage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";

/* Campaigns */
import CampaignsAsmrPage from "./pages/campaigns/CampaignsAsmrPage.jsx";

/* Support */
import SupportPage from "./pages/support/SupportPage.jsx";

/* Admin */
import TicketsAdminPage from "./pages/admin/TicketsAdminPage.jsx";
import TicketDetailAdminPage from "./pages/admin/TicketDetailAdminPage.jsx";
import SubscriptionsAdminPage from "./pages/admin/SubscriptionsAdminPage.jsx";
import BusinessesAdminPage from "./pages/admin/BusinessesAdminPage.jsx";
import BusinessDetailAdminPage from "./pages/admin/BusinessDetailAdminPage.jsx";
import PlansAdminPage from "./pages/admin/PlansAdminPage.jsx";
import UsersAdminPage from "./pages/admin/UsersAdminPage.jsx";
import PaymentsAdminPage from "./pages/admin/PaymentsAdminPage.jsx";
import EmailCampaignsAdminPage from "./pages/admin/emailCampaigns/EmailCampaignsAdminPage.jsx";
import EmailCampaignViewAdminPage from "./pages/admin/emailCampaigns/EmailCampaignViewAdminPage.jsx";
import EmailCampaignHistoryAdminPage from "./pages/admin/emailCampaigns/EmailCampaignHistoryAdminPage.jsx";
import EmailCampaignHistoryDetailAdminPage from "./pages/admin/emailCampaigns/EmailCampaignHistoryDetailAdminPage.jsx";
import EmailCampaignDetailAdminPage from "./pages/admin/emailCampaigns/EmailCampaignDetailAdminPage.jsx";
import EmailProspectsAdminPage from "./pages/admin/emailProspects/EmailProspectsAdminPage.jsx";
import ProspectUnsubscribePage from "./pages/ProspectUnsubscribePage.jsx";
import NotificationsAdminPage from "./pages/admin/NotificationsAdminPage.jsx";
import AgentTasksAdminPage from "./pages/admin/AgentTasksAdminPage.jsx";
import PlatformOwnerProtectedView from "./components/PlatformOwnerProtectedView.jsx";
import SubscriptionPaymentReturnPage from "./pages/dashboard/SubscriptionPaymentReturnPage.jsx";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmationProvider>
          <BrowserRouter>
            <RouteSeo />
            <PaymentModalProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPasswordPage />}
              />
              <Route path="/terminos" element={<TermsPage />} />
              <Route path="/politicas" element={<PrivacyPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/users/:id/confirm-email" element={<ConfirmAccountPage />} />
              <Route path="/prospect-unsubscribe/:token" element={<ProspectUnsubscribePage />} />

              {/* Authenticated tenant shell */}
              <Route element={<AppLayout />}>
                <Route element={<TenantContentGate />}>
                  <Route element={<TenantRoleGate />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/customers" element={<CustomerPage />} />
                  <Route path="/customers/:id" element={<CustomerViewPage />} />
                  <Route path="/campaigns-asmr" element={<CampaignsAsmrPage />} />
                  <Route path="/products_services" element={<ProductsServicesPage />} />
                  <Route path="/products/:id" element={<ProductsServicesViewPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/sales/register" element={<NewSalePage />} />
                  <Route path="/sales/dailySales/view/:id" element={<ViewDailySalePage />} />
                  <Route path="/sales/dailySales" element={<PageDailySales />} />
                  <Route path="/sales/view/:id" element={<ViewSalePage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/purchase" element={<PurchasePage />} />
                  <Route path="/providers" element={<ProviderPage />} />
                  <Route path="/purchase/register" element={<NewPurchasePage />} />
                  <Route path="/purchase/view/:id" element={<ViewPurchasePage />} />
                  <Route path="/daily-sales/view/:id" element={<ViewDailySalePage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/userGuest" element={<UserGuestPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/business/register" element={<RegisterBusinessPage />} />
                  </Route>
                </Route>
                <Route path="/subscription/payment/return" element={<SubscriptionPaymentReturnPage />} />
              </Route>

              {/* Zona administrativa global */}
              <Route element={<AdminProtectedView />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
                  <Route path="/admin/users" element={<UsersAdminPage />} />
                  <Route path="/admin/subscriptions" element={<SubscriptionsAdminPage />} />
                  <Route path="/admin/payments" element={<PaymentsAdminPage />} />
                  <Route path="/admin/businesses" element={<BusinessesAdminPage />} />
                  <Route path="/admin/businesses/:id" element={<BusinessDetailAdminPage />} />
                  <Route path="/admin/plans" element={<PlansAdminPage />} />
                  <Route path="/admin/tickets" element={<TicketsAdminPage />} />
                  <Route path="/admin/tickets/:id" element={<TicketDetailAdminPage />} />
                  <Route path="/admin/email-campaigns" element={<EmailCampaignsAdminPage />} />
                  <Route path="/admin/email-campaigns/history" element={<EmailCampaignHistoryAdminPage />} />
                  <Route path="/admin/email-campaigns/new" element={<EmailCampaignDetailAdminPage />} />
                  <Route path="/admin/email-campaigns/:id/history" element={<EmailCampaignHistoryDetailAdminPage />} />
                  <Route path="/admin/email-campaigns/:id/settings" element={<EmailCampaignDetailAdminPage />} />
                  <Route path="/admin/email-campaigns/:id" element={<EmailCampaignViewAdminPage />} />
                  <Route path="/admin/email-prospects" element={<EmailProspectsAdminPage />} />
                  <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
                  <Route element={<PlatformOwnerProtectedView />}>
                    <Route path="/admin/agent-tasks" element={<AgentTasksAdminPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<HomePage />} />
            </Routes>
            </PaymentModalProvider>
            <Analytics />
            <SpeedInsights />
          </BrowserRouter>
        </ConfirmationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
