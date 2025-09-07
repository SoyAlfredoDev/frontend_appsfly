import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardAdminPage from './pages/admin/DashboardAdminPage';
import { AuthProvider } from './context/authContext.jsx';
import DashboardPage from './pages/DashboardPage';
import CustomerPage from './pages/CustomerPage.jsx';
import ProductsServicesPage from './pages/ProductsServicesPage.jsx';
import SalesPage from './pages/Sales/SalesPage.jsx';
import NewSalePage from './pages/Sales/NewSalePage.jsx';
import CustomerViewPage from './pages/CustomerViewPage.jsx';
import ViewSalePage from './pages/Sales/ViewSalePage.jsx';
import RegisterBusinessPage from './pages/business/RegisterBusinessPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import UserGuestPage from './pages/users/UserGuestPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='*' element={<HomePage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/customers' element={<CustomerPage />} />
            <Route path='/customers/:id' element={<CustomerViewPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/products_services' element={<ProductsServicesPage />} />
            <Route path='/sales' element={<SalesPage />} />
            <Route path='/sale/:id' element={<ViewSalePage />} />
            <Route path='/sales/register' element={<NewSalePage />} />
            <Route path='/users' element={<UsersPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/users/userGuest' element={<UserGuestPage />} />
            {/**si el usuario esta autentificado debe redirigir dashboard */}
            {/** admin */}
            <Route path='/admin/dashboard' element={<DashboardAdminPage />} />
            <Route path='/business/register' element={<RegisterBusinessPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
