import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App';
import Shop from './components/Shop';
import ProductDetail from './components/ProductDetail';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import Features from './components/Features';
import About from './components/About';
import Contact from './components/Contact';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './components/AdminDashboard';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminCustomers from './components/AdminCustomers';
import AdminAnalytics from './components/AdminAnalytics';

// Placeholder admin components for components not yet implemented
const AdminSettings = () => <div className="p-6"><h2 className="text-2xl font-bold">System Settings</h2><p className="mt-4 text-muted-foreground">Settings management functionality coming soon...</p></div>;

const AdminProductNew = () => <div className="p-6"><h2 className="text-2xl font-bold">Add New Product</h2><p className="mt-4 text-muted-foreground">Product creation form coming soon...</p></div>;

const AdminProductEdit = () => <div className="p-6"><h2 className="text-2xl font-bold">Edit Product</h2><p className="mt-4 text-muted-foreground">Product editing form coming soon...</p></div>;

const AdminProductView = () => <div className="p-6"><h2 className="text-2xl font-bold">View Product</h2><p className="mt-4 text-muted-foreground">Product details view coming soon...</p></div>;

export default function Router() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<App />} /> {/* Homepage keeps its own layout */}
      <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
      <Route path="/product/:slug" element={<MainLayout><ProductDetail /></MainLayout>} />
      <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
      <Route path="/order-confirmation" element={<MainLayout><OrderConfirmation /></MainLayout>} />
      <Route path="/features" element={<MainLayout><Features /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
      <Route path="/admin/products/new" element={<AdminLayout><AdminProductNew /></AdminLayout>} />
      <Route path="/admin/products/:id" element={<AdminLayout><AdminProductView /></AdminLayout>} />
      <Route path="/admin/products/:id/edit" element={<AdminLayout><AdminProductEdit /></AdminLayout>} />
      <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
      <Route path="/admin/customers" element={<AdminLayout><AdminCustomers /></AdminLayout>} />
      <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
      <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
    </Routes>
  );
}