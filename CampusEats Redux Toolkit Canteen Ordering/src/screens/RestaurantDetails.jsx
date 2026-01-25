import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetRestaurantDetails } from "../Hooks";
import { Star, Clock, Plus, MapPin, BadgePercent } from "lucide-react";
import Navbar from "../Components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../Store/appSlice";

const RestaurantDetails = () => {
  let dispatch = useDispatch();
 
  const { id } = useParams();
  const allRestaurantData = useGetRestaurantDetails();

  const restaurant = allRestaurantData?.find((res) => res.id === id);

  const handleAdd = (item) => {
    dispatch(addToCart(item));
  };
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center mt-20">
          <h2 className="text-2xl font-bold text-gray-800">
            Restaurant not found
          </h2>
          <Link
            to="/"
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* 1. Restaurant Info Header */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <span className="text-orange-600">{restaurant.cuisine}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" /> {restaurant.address}
                </span>
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
              <div className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                <Star className="w-4 h-4 fill-white" />
                <span className="font-bold text-lg">{restaurant.rating}</span>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                100+ Ratings
              </span>
            </div>
          </div>

          {/* Delivery & Cost Meta Info */}
          <div className="flex gap-8 mt-8 pt-6 border-t border-dashed border-gray-200">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">
                  Delivery
                </p>
                <p className="text-sm font-bold text-gray-700">25-35 MINS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <BadgePercent className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">
                  Offers
                </p>
                <p className="text-sm font-bold text-gray-700">
                  Use FREE50 code
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Menu Section */}
        <div className="mt-12">
          <div className="flex items-baseline gap-3 mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-black text-gray-800">Menu</h2>
            <span className="text-gray-400 font-medium italic">
              {restaurant.menu.length} items available
            </span>
          </div>

          <div className="grid gap-6">
            {restaurant.menu.map((item) => (
              <div
                key={item.item_id}
                className="bg-white rounded-2xl p-5 flex justify-between items-center shadow-sm border border-transparent hover:border-orange-100 hover:shadow-md transition-all group"
              >
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-100"
                      title="Veg"
                    ></span>
                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-2">
                    ${item.price}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>

                <div className="relative">
                  <div className="w-36 h-36 md:w-40 md:h-40 overflow-hidden rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <button
                    onClick={() => handleAdd(item)}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-green-600 font-black px-8 py-2 rounded-xl shadow-lg border border-gray-100 hover:bg-green-50 transition-all flex items-center gap-2 active:scale-90"
                  >
                    ADD
                    <Plus className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDetails;
