const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
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
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module is required'],
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'Enrollment is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    watchTime: {
      type: Number, // Time watched in seconds
      default: 0,
    },
    lastPosition: {
      type: Number, // Last position in video (seconds)
      default: 0,
    },
    notes: {
      type: String,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index
progressSchema.index({ student: 1, lesson: 1 }, { unique: true });
progressSchema.index({ student: 1, course: 1 });
progressSchema.index({ enrollment: 1 });

// Update enrollment progress after marking lesson complete
progressSchema.post('save', async function () {
  if (this.isCompleted) {
    const Enrollment = mongoose.model('Enrollment');
    const Lesson = mongoose.model('Lesson');
    
    // Get total lessons in course
    const totalLessons = await Lesson.countDocuments({
      course: this.course,
      isPublished: true,
    });
    
    // Get completed lessons count
    const completedLessons = await this.constructor.countDocuments({
      student: this.student,
      course: this.course,
      isCompleted: true,
    });
    
    // Update enrollment
    const enrollment = await Enrollment.findById(this.enrollment);
    if (enrollment) {
      await enrollment.updateProgress(completedLessons, totalLessons);
      
      // Update last accessed lesson
      enrollment.progress.lastLessonId = this.lesson;
      await enrollment.save();
    }
  }
});

/**
 * Mark lesson as complete
 */
progressSchema.methods.markComplete = async function () {
  if (!this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    await this.save();
  }
};

/**
 * Update watch time
 */
progressSchema.methods.updateWatchTime = async function (seconds, position) {
  this.watchTime = Math.max(this.watchTime, seconds);
  this.lastPosition = position;
  await this.save();
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
