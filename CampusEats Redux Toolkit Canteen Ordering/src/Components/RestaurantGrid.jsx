import React, { useState } from "react";
import { useGetRestaurantDetails } from "../Hooks";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60", // Interior
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=60", // Fine Dining
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60", // Steak
  "https://images.unsplash.com/photo-1476224484751-18e7c1bb0967?auto=format&fit=crop&w=800&q=60", // Platter
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=60", // Pizza
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=60", // Dessert
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=60", // Healthy
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=60", // Salmon
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=60", // Salad
  "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=800&q=60", // Pancakes
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=60", // Toast
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=60", // Bowl
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=60", // BBQ
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=60", // Vegan
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60", // Breakfast
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=60", // Pasta
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=60", // Italian Pizza
  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=800&q=60", // Chops
  "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=60", // Burger
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=60", // Thai
];

const RestaurantGrid = () => {
  const restaurants = useGetRestaurantDetails();
  console.log(restaurants);

  // Guard clause for loading state or empty data
  if (!restaurants)
    return <div className="text-center py-10">Loading tasty options...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Popular Restaurants Near You
      </h2>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((res) => (
          <RestaurantCard key={res.id} restaurant={res} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantGrid;
const RestaurantCard = ({ restaurant }) => {
  const [image, setImage] = useState(restaurant.image_url);
  const { id, name, rating, cuisine, address } = restaurant;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          onError={() => {
            const idx = Math.floor(Math.random() * 18);
            setImage(RESTAURANT_IMAGES[idx]);
          }}
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
          <span className="text-sm font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-800 truncate">{name}</h3>
        </div>

        <p className="text-sm font-medium text-orange-600 mb-2">{cuisine}</p>

        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs truncate">{address}</p>
        </div>

        {/* Action Button */}
        <Link to={`/res/${id}`}>
          <button className="w-full mt-4 py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
            View Menu
          </button>
        </Link>
      </div>
    </div>
  );
};
