import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const FALLBACK_IMAGE = '/no-image.svg';

function ProductList() {
  const { products, loading, error, addToCart } = useStore();

  if (loading) {
    return <div className="status">Loading products...</div>;
  }

  if (error) {
    return <div className="status error">{error}</div>;
  }

  return (
    <section>
      <h1>Product List</h1>
      {products.length === 0 ? (
        <p className="status">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article key={product._id} className="card">
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                className="thumb"
                onError={(event) => {
                  if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="card-body">
                <h2>{product.name}</h2>
                <p>{product.description || 'No description available.'}</p>
                <div className="meta-line">
                  <strong>Rs {Number(product.price).toFixed(2)}</strong>
                  <span>Stock: {product.stock}</span>
                </div>
                <div className="actions">
                  <Link to={`/products/${product._id}`} className="btn secondary">
                    View Details
                  </Link>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => addToCart(product._id, 1)}
                    disabled={product.stock < 1}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductList;
