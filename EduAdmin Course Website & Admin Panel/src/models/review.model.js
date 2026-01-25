const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    response: {
      content: {
        type: String,
        maxlength: [1000, 'Response cannot exceed 1000 characters'],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index - one review per student per course
reviewSchema.index({ student: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, isApproved: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Update course rating after review is saved
reviewSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course && this.isApproved) {
    await course.updateRating();
  }
});

// Update course rating after review is deleted
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    await course.updateRating();
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
