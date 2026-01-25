const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { User, Category, Course, Module, Lesson } = require('../models');
const config = require('../config');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
    ]);

    // Create admin user
    // Note: Passwords are plain text - the User model pre-save hook will hash them
    console.log('Creating users...');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eduadmin.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    });

    const instructor = await User.create({
      firstName: 'John',
      lastName: 'Instructor',
      email: 'instructor@eduadmin.com',
      password: 'Instructor@123',
      role: 'instructor',
      isActive: true,
      isEmailVerified: true,
      bio: 'Experienced software developer with 10+ years of teaching experience.',
    });

    const student = await User.create({
      firstName: 'Jane',
      lastName: 'Student',
      email: 'student@eduadmin.com',
      password: 'Student@123',
      role: 'student',
      isActive: true,
      isEmailVerified: true,
    });

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.create([
      { name: 'Web Development', description: 'Learn to build websites and web applications', order: 1 },
      { name: 'Mobile Development', description: 'Build iOS and Android applications', order: 2 },
      { name: 'Data Science', description: 'Learn data analysis and machine learning', order: 3 },
      { name: 'DevOps', description: 'Learn cloud and deployment technologies', order: 4 },
      { name: 'Design', description: 'UI/UX and graphic design courses', order: 5 },
    ]);

    // Create a sample course
    console.log('Creating sample course...');
    const course = await Course.create({
      title: 'Complete Node.js Developer Course',
      description: 'Learn Node.js from scratch to advanced level. Build real-world applications with Express, MongoDB, and more.',
      shortDescription: 'Master Node.js and build production-ready applications',
      instructor: instructor._id,
      category: categories[0]._id,
      price: 49.99,
      discountPrice: 29.99,
      level: 'beginner',
      language: 'English',
      requirements: [
        'Basic JavaScript knowledge',
        'Understanding of HTML & CSS',
        'A computer with internet access',
      ],
      learningOutcomes: [
        'Build RESTful APIs with Node.js and Express',
        'Work with MongoDB and Mongoose',
        'Implement authentication and authorization',
        'Deploy applications to production',
      ],
      tags: ['nodejs', 'express', 'mongodb', 'javascript', 'api'],
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
    });

    // Create modules
    console.log('Creating modules...');
    const modules = await Module.create([
      {
        title: 'Introduction to Node.js',
        description: 'Getting started with Node.js fundamentals',
        course: course._id,
        order: 0,
        isPublished: true,
      },
      {
        title: 'Working with Express.js',
        description: 'Building web servers and APIs with Express',
        course: course._id,
        order: 1,
        isPublished: true,
      },
      {
        title: 'MongoDB & Mongoose',
        description: 'Database integration with MongoDB',
        course: course._id,
        order: 2,
        isPublished: true,
      },
    ]);

    // Create lessons
    console.log('Creating lessons...');
    await Lesson.create([
      {
        title: 'What is Node.js?',
        description: 'Introduction to Node.js and its ecosystem',
        module: modules[0]._id,
        course: course._id,
        order: 0,
        type: 'video',
        duration: 15,
        isPreview: true,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video1.mp4',
          videoProvider: 'local',
        },
      },
      {
        title: 'Setting up Your Development Environment',
        description: 'Installing Node.js and configuring your IDE',
        module: modules[0]._id,
        course: course._id,
        order: 1,
        type: 'video',
        duration: 20,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video2.mp4',
          videoProvider: 'local',
        },
      },
      {
        title: 'Your First Node.js Application',
        description: 'Creating and running your first Node.js app',
        module: modules[0]._id,
        course: course._id,
        order: 2,
        type: 'video',
        duration: 25,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video3.mp4',
          videoProvider: 'local',
        },
      },
      {
        title: 'Introduction to Express.js',
        description: 'Understanding Express.js framework',
        module: modules[1]._id,
        course: course._id,
        order: 0,
        type: 'video',
        duration: 18,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video4.mp4',
          videoProvider: 'local',
        },
      },
      {
        title: 'Creating RESTful Routes',
        description: 'Building REST API endpoints',
        module: modules[1]._id,
        course: course._id,
        order: 1,
        type: 'video',
        duration: 30,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video5.mp4',
          videoProvider: 'local',
        },
      },
      {
        title: 'MongoDB Basics',
        description: 'Introduction to MongoDB database',
        module: modules[2]._id,
        course: course._id,
        order: 0,
        type: 'video',
        duration: 22,
        isPublished: true,
        content: {
          videoUrl: 'https://example.com/video6.mp4',
          videoProvider: 'local',
        },
      },
    ]);

    // Update course duration
    await course.updateDuration();

    console.log('\n✅ Seed data created successfully!\n');
    console.log('📧 Test Accounts:');
    console.log('─────────────────────────────────────────');
    console.log('Admin:      admin@eduadmin.com / Admin@123');
    console.log('Instructor: instructor@eduadmin.com / Instructor@123');
    console.log('Student:    student@eduadmin.com / Student@123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
