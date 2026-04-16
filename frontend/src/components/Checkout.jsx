import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  zipCode: '',
  paymentMethod: 'cod'
};

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, placeOrder } = useStore();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <section>
        <h1>Checkout</h1>
        <p className="status">Your cart is empty. Add products before checkout.</p>
        <Link to="/" className="btn">Go to Products</Link>
      </section>
    );
  }

  const onChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await placeOrder(form);
      setMessage('Order placed successfully.');
      setForm(initialForm);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="checkout-grid">
      <div>
        <h1>Checkout</h1>
        {message && <p className="status success">{message}</p>}
        {error && <p className="status error">{error}</p>}

        <form className="checkout-form" onSubmit={onSubmit}>
          <label>
            Full Name
            <input name="fullName" value={form.fullName} onChange={onChange} required />
          </label>

          <label>
            Phone
            <input name="phone" value={form.phone} onChange={onChange} required />
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>

          <label>
            Address
            <input name="address" value={form.address} onChange={onChange} required />
          </label>

          <label>
            City
            <input name="city" value={form.city} onChange={onChange} required />
          </label>

          <label>
            Zip Code
            <input name="zipCode" value={form.zipCode} onChange={onChange} required />
          </label>

          <label>
            Payment Method
            <select name="paymentMethod" value={form.paymentMethod} onChange={onChange} required>
              <option value="card">Card</option>
              <option value="paypal">PayPal</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </label>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      <aside className="order-summary">
        <h2>Order Summary</h2>
        {cart.map((item) => (
          <div key={item.productId} className="summary-line">
            <span>{item.name} x {item.quantity}</span>
            <strong>Rs {item.lineTotal.toFixed(2)}</strong>
          </div>
        ))}
        <hr />
        <div className="summary-line total">
          <span>Total</span>
          <strong>Rs {cartTotal.toFixed(2)}</strong>
        </div>
      </aside>
    </section>
  );
}

export default Checkout;
