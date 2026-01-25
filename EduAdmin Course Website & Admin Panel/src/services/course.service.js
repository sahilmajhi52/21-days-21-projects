const { Course, Module, Lesson, Enrollment } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationResult, getSort } = require('../utils/pagination');

/**
 * Get courses with pagination and filtering
 * @param {Object} query - Query parameters
 * @param {Object} user - Current user (optional)
 * @returns {Promise<Object>} Courses and pagination info
 */
const getCourses = async (query, user = null) => {
  const { page, limit, skip } = getPagination(query);
  const sort = getSort(query.sort, ['createdAt', 'title', 'price', 'rating.average', 'enrollmentCount']);
  
  // Build filter
  const filter = {};
  
  // Non-admin users can only see published courses
  if (!user || user.role !== 'admin') {
    filter.isPublished = true;
    filter.status = 'published';
  } else {
    // Admin can filter by status
    if (query.status) {
      filter.status = query.status;
    }
    if (query.isPublished !== undefined) {
      filter.isPublished = query.isPublished;
    }
  }
  
  if (query.category) {
    filter.category = query.category;
  }
  
  if (query.instructor) {
    filter.instructor = query.instructor;
  }
  
  if (query.level) {
    filter.level = query.level;
  }
  
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured;
  }
  
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  
  if (query.search) {
    filter.$text = { $search: query.search };
  }
  
  const [courses, totalResults] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { courses, pagination };
};

/**
 * Get course by ID
 * @param {string} courseId - Course ID
 * @param {Object} user - Current user (optional)
 * @returns {Promise<Course>}
 */
const getCourseById = async (courseId, user = null) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'firstName lastName avatar bio')
    .populate('category', 'name slug')
    .populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        select: 'title description type duration order isPreview isPublished',
      },
    });
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check access for unpublished courses
  if (!course.isPublished) {
    if (!user) {
      throw ApiError.notFound('Course not found');
    }
    
    const isOwner = course.instructor._id.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      throw ApiError.notFound('Course not found');
    }
  }
  
  return course;
};

/**
 * Get course by slug
 * @param {string} slug - Course slug
 * @param {Object} user - Current user (optional)
 * @returns {Promise<Course>}
 */
const getCourseBySlug = async (slug, user = null) => {
  const course = await Course.findOne({ slug })
    .populate('instructor', 'firstName lastName avatar bio')
    .populate('category', 'name slug')
    .populate({
      path: 'modules',
      match: user ? {} : { isPublished: true },
      populate: {
        path: 'lessons',
        match: user ? {} : { isPublished: true },
        select: 'title description type duration order isPreview isPublished',
      },
    });
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check access for unpublished courses
  if (!course.isPublished && (!user || (user.role !== 'admin' && course.instructor._id.toString() !== user._id.toString()))) {
    throw ApiError.notFound('Course not found');
  }
  
  return course;
};

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Course>}
 */
const createCourse = async (courseData, instructorId) => {
  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
  });
  
  return course.populate([
    { path: 'instructor', select: 'firstName lastName avatar' },
    { path: 'category', select: 'name slug' },
  ]);
};

/**
 * Update course
 * @param {string} courseId - Course ID
 * @param {Object} updateData - Data to update
 * @param {Object} user - Current user
 * @returns {Promise<Course>}
 */
const updateCourse = async (courseId, updateData, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to update this course');
  }
  
  // Only admin can update certain fields
  if (!isAdmin) {
    delete updateData.isFeatured;
    delete updateData.status;
  }
  
  Object.assign(course, updateData);
  await course.save();
  
  return course.populate([
    { path: 'instructor', select: 'firstName lastName avatar' },
    { path: 'category', select: 'name slug' },
  ]);
};

/**
 * Delete course
 * @param {string} courseId - Course ID
 * @param {Object} user - Current user
 * @returns {Promise<void>}
 */
const deleteCourse = async (courseId, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to delete this course');
  }
  
  // Check for enrollments
  const enrollmentCount = await Enrollment.countDocuments({ course: courseId });
  if (enrollmentCount > 0 && !isAdmin) {
    throw ApiError.badRequest('Cannot delete course with active enrollments');
  }
  
  // Delete all modules and lessons
  const modules = await Module.find({ course: courseId });
  for (const module of modules) {
    await Lesson.deleteMany({ module: module._id });
  }
  await Module.deleteMany({ course: courseId });
  
  await course.deleteOne();
};

/**
 * Publish/unpublish course
 * @param {string} courseId - Course ID
 * @param {boolean} publish - Publish or unpublish
 * @param {Object} user - Current user
 * @returns {Promise<Course>}
 */
const publishCourse = async (courseId, publish, user) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  
  // Check ownership
  const isOwner = course.instructor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('You do not have permission to publish this course');
  }
  
  if (publish) {
    // Validate course has content before publishing
    const moduleCount = await Module.countDocuments({ course: courseId });
    if (moduleCount === 0) {
      throw ApiError.badRequest('Course must have at least one module to publish');
    }
    
    const lessonCount = await Lesson.countDocuments({ course: courseId });
    if (lessonCount === 0) {
      throw ApiError.badRequest('Course must have at least one lesson to publish');
    }
    
    course.isPublished = true;
    course.status = 'published';
    course.publishedAt = new Date();
  } else {
    course.isPublished = false;
    course.status = 'draft';
  }
  
  await course.save();
  
  return course;
};

/**
 * Get instructor courses
 * @param {string} instructorId - Instructor ID
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>}
 */
const getInstructorCourses = async (instructorId, query) => {
  const { page, limit, skip } = getPagination(query);
  
  const filter = { instructor: instructorId };
  
  if (query.status) {
    filter.status = query.status;
  }
  
  const [courses, totalResults] = await Promise.all([
    Course.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);
  
  const pagination = getPaginationResult(page, limit, totalResults);
  
  return { courses, pagination };
};

/**
 * Get course statistics
 * @returns {Promise<Object>}
 */
const getStatistics = async () => {
  const [totalCourses, publishedCourses, statusStats] = await Promise.all([
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Course.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);
  
  const byStatus = {};
  statusStats.forEach((stat) => {
    byStatus[stat._id] = stat.count;
  });
  
  return {
    total: totalCourses,
    published: publishedCourses,
    byStatus,
  };
};

module.exports = {
  getCourses,
  getCourseById,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  getInstructorCourses,
  getStatistics,
};
