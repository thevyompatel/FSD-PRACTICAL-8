import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function Cart() {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useStore();

  if (cart.length === 0) {
    return (
      <section>
        <h1>Cart</h1>
        <p className="status">Your cart is empty.</p>
        <Link to="/" className="btn">Continue Shopping</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Cart</h1>
      <div className="cart-list">
        {cart.map((item) => (
          <article key={item.productId} className="cart-item">
            <img
              src={item.image || 'https://via.placeholder.com/140x90?text=No+Image'}
              alt={item.name}
              className="cart-thumb"
            />
            <div className="cart-main">
              <h2>{item.name}</h2>
              <p>Unit: Rs {item.price.toFixed(2)}</p>
              <p>Line Total: Rs {item.lineTotal.toFixed(2)}</p>
            </div>
            <div className="cart-controls">
              <button
                className="btn small"
                type="button"
                onClick={() => updateCartQuantity(item.productId, Math.max(0, item.quantity - 1))}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                className="btn small"
                type="button"
                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
              <button
                className="btn danger small"
                type="button"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="checkout-bar">
        <strong>Total: Rs {cartTotal.toFixed(2)}</strong>
        <div className="actions">
          <button className="btn danger" type="button" onClick={clearCart}>
            Clear Cart
          </button>
          <Link to="/checkout" className="btn">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Cart;
