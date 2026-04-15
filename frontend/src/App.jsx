import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { useStore } from './context/StoreContext';

function App() {
  const { cartCount } = useStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">TechStore React</div>
        <nav className="topnav">
          <Link to="/">Products</Link>
          <Link to="/cart">Cart ({cartCount})</Link>
          <Link to="/checkout">Checkout</Link>
        </nav>
      </header>

      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
