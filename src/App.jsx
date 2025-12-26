import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

/* Public pages */
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';

/* Dashboards */
import DashboardPage from './pages/DashboardPage';
import DashboardAdminPage from './pages/admin/DashboardAdminPage';

/* Customers */
import CustomerPage from './pages/CustomerPage.jsx';
import CustomerViewPage from './pages/CustomerViewPage.jsx';

/* Products & Services */
import ProductsServicesPage from './pages/ProductsServicesPage.jsx';

/* Sales */
import SalesPage from './pages/Sales/SalesPage.jsx';
import NewSalePage from './pages/Sales/NewSalePage.jsx';
import ViewSalePage from './pages/Sales/ViewSalePage.jsx';

/* Purchases */
import PurchasePage from './pages/purchase/PurchasePage.jsx';
import ProviderPage from './pages/purchase/ProviderPage.jsx';

/* Daily Sales */
import PageDailySales from './pages/PageDailySales.jsx';
import ViewDailySalePage from './pages/dailySales/ViewDailySalePage.jsx';

/* Business */
import RegisterBusinessPage from './pages/business/RegisterBusinessPage.jsx';

/* Users */
import UsersPage from './pages/users/UsersPage.jsx';
import UserGuestPage from './pages/users/UserGuestPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ConfirmAccountPage from './pages/users/ConfirmAccountPage.jsx';

/* Finance */
import TransactionsPage from './pages/TransactionsPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import FinancePage from './pages/FinancePage.jsx';

/* Support */
import SupportPage from './pages/support/SupportPage.jsx';

/* Admin */
import TicketsAdminPage from './pages/admin/TicketsAdminPage.jsx';
import TicketDetailAdminPage from './pages/admin/TicketDetailAdminPage.jsx';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/politicas" element={<PrivacyPage />} />

            {/* General dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/customers/:id" element={<CustomerViewPage />} />

            {/* Products */}
            <Route path="/products_services" element={<ProductsServicesPage />} />

            {/* Sales */}
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/register" element={<NewSalePage />} />
            <Route path="/sales/view/:id" element={<ViewSalePage />} />

            {/* Purchases */}
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/providers" element={<ProviderPage />} />

            {/* Daily sales */}
            <Route path="/sales/dailySales" element={<PageDailySales />} />
            <Route path="/daily-sales/view/:id" element={<ViewDailySalePage />} />

            {/* Users */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/userGuest" element={<UserGuestPage />} />
            <Route path="/users/:id/confirm-email" element={<ConfirmAccountPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Finance */}
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/finance" element={<FinancePage />} />

            {/* Support */}
            <Route path="/support" element={<SupportPage />} />

            {/* Business */}
            <Route path="/business/register" element={<RegisterBusinessPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
            <Route path="/admin/tickets" element={<TicketsAdminPage />} />
            <Route path="/admin/tickets/:id" element={<TicketDetailAdminPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
