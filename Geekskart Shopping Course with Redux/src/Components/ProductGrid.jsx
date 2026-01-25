import React from "react";

import { Star, User } from "lucide-react";
import { useGetCourseData } from "../Hooks";
import { Link } from "react-router-dom";

const ProductGrid = () => {
  const courseData = useGetCourseData();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Courses</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courseData &&
          courseData.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
      </div>
    </div>
  );
};

export default ProductGrid;

const CourseCard = ({ course }) => {
  return (
    <Link
      to={`/course/${course.id}`}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Course Image */}
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-40 object-cover"
      />

      <div className="p-4 flex flex-col flex-grow">
        {/* Category Tag */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <User size={14} />
          <span>{course.instructor}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold mb-4">
          <span>{course.rating}</span>
          <Star size={14} fill="currentColor" />
          <span className="text-gray-400 font-normal">
            ({course.studentsEnrolled})
          </span>
        </div>

        {/* Price and Action */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${course.price}
          </span>
          <button className="bg-blue-600 text-white px-3 py-1.5 rounded font-medium text-sm hover:bg-blue-700">
            Explore
          </button>
        </div>
      </div>
    </Link>
  );
};
