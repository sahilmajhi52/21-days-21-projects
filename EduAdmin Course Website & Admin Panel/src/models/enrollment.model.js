const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'cancelled'],
      default: 'active',
    },
    progress: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      completedLessons: {
        type: Number,
        default: 0,
      },
      totalLessons: {
        type: Number,
        default: 0,
      },
      lastAccessedAt: {
        type: Date,
        default: null,
      },
      lastLessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        default: null,
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificateId: {
      type: String,
      default: null,
    },
    payment: {
      amount: {
        type: Number,
        default: 0,
      },
      method: {
        type: String,
        enum: ['free', 'card', 'paypal', 'coupon', null],
        default: null,
      },
      transactionId: {
        type: String,
        default: null,
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Increment course enrollment count when a new enrollment is created
enrollmentSchema.post('save', async function (doc, next) {
  if (this.wasNew) {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(doc.course, {
      $inc: { enrollmentCount: 1 },
    });
  }
  next();
});

// Store wasNew flag before save
enrollmentSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
});

/**
 * Check if student is enrolled in a course
 */
enrollmentSchema.statics.isEnrolled = async function (studentId, courseId) {
  const enrollment = await this.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });
  return !!enrollment;
};

/**
 * Update progress for enrollment
 */
enrollmentSchema.methods.updateProgress = async function (completedLessons, totalLessons) {
  this.progress.completedLessons = completedLessons;
  this.progress.totalLessons = totalLessons;
  this.progress.percentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;
  this.progress.lastAccessedAt = new Date();
  
  // Mark as completed if all lessons are done
  if (this.progress.percentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
