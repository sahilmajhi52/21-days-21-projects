import React from "react";
import Navbar from "../Components/Navbar";
import {
  useGetCourseData,
  useIsProductInCart,
  useIsProductInWishlist,
} from "../Hooks";
import { useParams } from "react-router-dom";
import {
  Star,
  CheckCircle,
  Globe,
  Calendar,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  addToWishlist,
  removeFromWishlist,
} from "../Store/appSlice";
const Course = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((store) => store.app.cart);

  console.log(cartData);
  const allCourseData = useGetCourseData();
  const { id: courseId } = useParams();

  const isCourseInCart = useIsProductInCart(courseId);
  const isCourseInWishlist = useIsProductInWishlist(courseId);

  const handleAddToCart = (courseData) => {
    if (isCourseInCart) {
      dispatch(removeFromCart(courseData));
    } else {
      dispatch(addToCart(courseData));
    }
  };

  const handleAddToWishlist = (courseData) => {
    if (isCourseInCart) {
      dispatch(removeFromWishlist(courseData));
    } else {
      dispatch(addToWishlist(courseData));
    }
  };

  // Find the specific course based on the URL ID
  const courseData = allCourseData.find((data) => data.id == courseId);

  // Handle loading state if data isn't fetched yet
  if (!courseData) {
    return <div className="p-10 text-center">Loading course details...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section / Header */}
      <div className="bg-gray-900 text-white p-8 md:p-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Left Side: Course Info */}
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {courseData.title}
            </h1>
            <p className="text-lg mb-4 text-gray-300">
              {courseData.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold">{courseData.rating}</span>
                <Star size={16} fill="currentColor" />
              </div>
              <span className="text-blue-400 font-medium">
                ({courseData.studentsEnrolled} students)
              </span>
              <span>
                Created by{" "}
                <span className="underline text-blue-300">
                  {courseData.instructor}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Last updated {courseData.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={16} />
                <span>{courseData.language}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Action Box (Floating Card style) */}
          <div className="bg-white text-gray-900 p-6 rounded-xl border border-gray-200 shadow-xl self-start">
            <img
              src={courseData.image}
              alt="Thumbnail"
              className="w-full rounded-lg mb-4"
            />
            <div className="text-3xl font-bold mb-4">₹{courseData.price}</div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  handleAddToCart(courseData);
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <ShoppingCart size={20} />{" "}
                {isCourseInCart ? "Remove from Cart" : "Add to Cart"}
              </button>
              <button
                onClick={() => {
                  handleAddToWishlist(courseData);
                }}
                className="w-full border border-gray-900 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Heart size={20} />
                {isCourseInWishlist ? "Remove from Wishlist" : "Wishlist"}
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              30-Day Money-Back Guarantee
            </p>
          </div>
        </div>
      </div>

      {/* Lower Section: Detailed Content */}
      <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* What you'll learn */}
          <div className="border border-gray-200 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {courseData.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-2 text-sm text-gray-700">
                  <CheckCircle size={18} className="text-green-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Prerequisites</h2>
            <ul className="list-disc ml-5 text-gray-700">
              {courseData.prerequisites.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
