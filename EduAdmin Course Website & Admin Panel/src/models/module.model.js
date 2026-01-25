const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number, // Total duration in minutes
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for lessons
moduleSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'module',
  options: { sort: { order: 1 } },
});

// Virtual for lesson count
moduleSchema.virtual('lessonCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'module',
  count: true,
});

// Indexes
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ isPublished: 1 });

// Update duration based on lessons
moduleSchema.methods.updateDuration = async function () {
  const Lesson = mongoose.model('Lesson');
  const result = await Lesson.aggregate([
    { $match: { module: this._id } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' } } },
  ]);
  
  this.duration = result.length > 0 ? result[0].totalDuration : 0;
  await this.save();
  
  // Also update course duration
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateDuration();
  }
};

// Middleware to reorder modules after deletion
moduleSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Module = mongoose.model('Module');
  await Module.updateMany(
    { course: this.course, order: { $gt: this.order } },
    { $inc: { order: -1 } }
  );
  
  // Delete all lessons in this module
  const Lesson = mongoose.model('Lesson');
  await Lesson.deleteMany({ module: this._id });
});

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
