import { Link } from "react-router-dom";

const ProductCard = ({ data }) => {
  const {
    id,
    title,
    brand,
    category,
    price,
    discountPercentage,
    thumbnail,
  } = data;

  const discountedPrice = (
    price - (price * discountPercentage) / 100
  ).toFixed(2);

  return (
    <Link to={`/product/${id}`} className="product-card">
      <div className="image-wrapper">
        <img src={thumbnail} alt={title} />
        <span className="discount-badge">
          {discountPercentage.toFixed(0)}% OFF
        </span>
      </div>

      <div className="product-info">
        <p className="brand">{brand}</p>
        <h3 className="title">{title}</h3>
        <p className="category">{category}</p>

        <div className="price-container">
          <span className="discounted-price">₹{discountedPrice}</span>
          <span className="original-price">₹{price}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
