import React from "react";
import Navbar from "../Components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, ShoppingBag } from "lucide-react";
import { removeFromCart } from "../Store/appSlice";

const Cart = () => {
  const cartData = useSelector((store) => store.app.cart);
  const dispatch = useDispatch();

  // Convert the object into an array so we can use .map()
  const cartItems = Object.values(cartData);

  // Calculate Total Price
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <ShoppingBag /> Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Item List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 md:w-32 md:h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      By {item.instructor}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm font-bold text-blue-600">
                      <span>{item.rating} ★</span>
                      <span className="text-gray-400 font-normal">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => dispatch(removeFromCart({ id: item.id }))}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Price Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Total:</h2>
              <div className="text-4xl font-bold mb-6 text-gray-900">
                ₹{totalPrice.toFixed(2)}
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mb-4">
                Checkout Now
              </button>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
                  Promotions
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon"
                    className="border p-2 rounded flex-1 text-sm outline-none focus:border-blue-500"
                  />
                  <button className="bg-gray-100 px-4 py-2 rounded text-sm font-bold">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
