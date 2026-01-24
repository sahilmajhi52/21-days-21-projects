import React, { useEffect, useState } from "react";
import Navbar from "../Components/NavBar";
import { useParams } from "react-router-dom";

const Pdp = () => {
  let [pdpData, setPdpData] = useState(null);
  let { id } = useParams();

  async function getData() {
    let data = await fetch(`https://dummyjson.com/products/${id}`);
    let jsonData = await data.json();
    setPdpData(jsonData);
  }

  useEffect(() => {
    getData();
  }, [id]);

  if (!pdpData) {
    return (
      <div>
        <Navbar />
        <div className="pdp-loading">Loading product...</div>
      </div>
    );
  }

  const discountedPrice = (
    pdpData.price -
    (pdpData.price * pdpData.discountPercentage) / 100
  ).toFixed(2);

  return (
    <div>
      <Navbar />

      <div className="pdp-container">
        {/* LEFT IMAGE SECTION */}
        <div className="pdp-image-section">
          <img src={pdpData.thumbnail} alt={pdpData.title} />
        </div>

        {/* RIGHT DETAILS SECTION */}
        <div className="pdp-details">
          <p className="pdp-brand">{pdpData.brand}</p>
          <h1 className="pdp-title">{pdpData.title}</h1>
          <p className="pdp-category">{pdpData.category}</p>

          <div className="pdp-rating">
            ⭐ {pdpData.rating} <span>({pdpData.stock} in stock)</span>
          </div>

          <div className="pdp-price">
            <span className="discounted">₹{discountedPrice}</span>
            <span className="original">₹{pdpData.price}</span>
            <span className="offer">
              {pdpData.discountPercentage.toFixed(0)}% OFF
            </span>
          </div>

          <p className="pdp-description">{pdpData.description}</p>

          <div className="pdp-tags">
            {pdpData.tags?.map((tag, index) => (
              <span key={index}>{tag}</span>
            ))}
          </div>

          <div className="pdp-actions">
            <button className="add-cart">Add to Cart</button>
            <button className="buy-now">Buy Now</button>
          </div>

          <div className="pdp-info">
            <p>🚚 {pdpData.shippingInformation}</p>
            <p>🛡 {pdpData.warrantyInformation}</p>
            <p>↩ {pdpData.returnPolicy}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pdp;