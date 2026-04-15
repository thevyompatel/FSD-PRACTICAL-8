import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useStore } from '../context/StoreContext';

const FALLBACK_IMAGE = '/no-image.svg';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await productAPI.getById(id);
        setProduct(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <div className="status">Loading product details...</div>;
  }

  if (error) {
    return <div className="status error">{error}</div>;
  }

  if (!product) {
    return <div className="status">Product not found.</div>;
  }

  return (
    <section className="detail-layout">
      <img
        src={product.image || FALLBACK_IMAGE}
        alt={product.name}
        className="detail-image"
        onError={(event) => {
          if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
          event.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <div className="detail-content">
        <h1>{product.name}</h1>
        <p>{product.description || 'No description available.'}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Price:</strong> Rs {Number(product.price).toFixed(2)}</p>
        <p><strong>Stock:</strong> {product.stock}</p>

        <div className="qty-row">
          <label htmlFor="qty">Quantity:</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={Math.max(1, product.stock)}
            value={quantity}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isFinite(nextValue) || nextValue < 1) {
                setQuantity(1);
                return;
              }
              setQuantity(Math.min(nextValue, Math.max(1, product.stock)));
            }}
          />
        </div>

        <div className="actions">
          <button
            className="btn"
            type="button"
            disabled={product.stock < 1}
            onClick={() => addToCart(product._id, quantity)}
          >
            Add to Cart
          </button>
          <Link to="/cart" className="btn secondary">Go to Cart</Link>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
