import React from "react";
import Navbar from "../Components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, ShoppingCart, HeartOff } from "lucide-react";
import { removeFromWishlist, addToCart } from "../Store/appSlice";

const Wishlist = () => {
  const wishlistData = useSelector((store) => store.app.wishlist);
  const dispatch = useDispatch();

  // Convert object to array for mapping
  const wishlistItems = Object.values(wishlistData);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          My Wishlist{" "}
          <span className="text-gray-400 text-lg font-normal">
            ({wishlistItems.length} items)
          </span>
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
            <HeartOff size={64} className="text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">
              Your wishlist is empty
            </p>
            <button className="mt-4 text-blue-600 font-bold hover:underline">
              Continue Browsing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all group"
              >
                {/* Image Section */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  {/* Remove Button - Top Right Overlay */}
                  <button
                    onClick={() =>
                      dispatch(removeFromWishlist({ id: item.id }))
                    }
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-all"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2 h-12">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    By {item.instructor}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-extrabold text-gray-900">
                      ₹{item.price}
                    </span>
                    <span className="text-sm font-bold text-yellow-600 flex items-center gap-0.5">
                      {item.rating} ★
                    </span>
                  </div>

                  {/* Move to Cart Button */}
                  <button
                    onClick={() => {
                      dispatch(addToCart(item));
                      dispatch(removeFromWishlist({ id: item.id }));
                    }}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                  >
                    <ShoppingCart size={18} />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
