import React from "react";
import Navbar from "../Components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { addToCart, decreseQuantity, removeItem } from "../Store/appSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((store) => store.app.cart);
  const cartItems = Object.values(cartData); // Convert object to array

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 5.0 : 0;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-20 px-4 text-center">
          <div className="bg-orange-50 p-6 rounded-full mb-6">
            <ShoppingBag className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2 mb-8">
            Good food is always just a few clicks away!
          </p>
          <Link
            to="/"
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1. Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.item_id}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover bg-gray-100"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                    {item.description}
                  </p>
                  <p className="font-black text-orange-600">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => {
                      dispatch(decreseQuantity(item));
                    }}
                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-800 w-4 text-center">
                    {item.quantity}
                  </span>
                  <button className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-orange-500">
                    <Plus
                      onClick={() => {
                        dispatch(addToCart(item));
                      }}
                      className="w-4 h-4"
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    dispatch(removeItem(item));
                  }}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* 2. Right Column: Bill Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Bill Details
              </h2>

              <div className="space-y-4 border-b border-dashed border-gray-200 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm font-medium">
                  <span>Discounts applied</span>
                  <span>-$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 mb-8">
                <span className="text-lg font-bold text-gray-800">To Pay</span>
                <span className="text-2xl font-black text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95">
                Place Order
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-widest font-bold">
                Secure Checkout • 100% Safe Payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
