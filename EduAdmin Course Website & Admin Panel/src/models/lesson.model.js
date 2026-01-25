const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module is required'],
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
    type: {
      type: String,
      enum: ['video', 'article', 'quiz', 'assignment', 'resource'],
      default: 'video',
    },
    content: {
      // For video lessons
      videoUrl: {
        type: String,
        default: null,
      },
      videoProvider: {
        type: String,
        enum: ['local', 'youtube', 'vimeo', 's3', null],
        default: null,
      },
      // For article lessons
      articleContent: {
        type: String,
        default: null,
      },
      // For resource lessons
      resources: [{
        name: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'document', 'link', 'other'],
        },
      }],
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
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

// Indexes
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 });
lessonSchema.index({ isPublished: 1 });
lessonSchema.index({ isPreview: 1 });

// Update module duration after saving
lessonSchema.post('save', async function () {
  const Module = mongoose.model('Module');
  const module = await Module.findById(this.module);
  if (module) {
    await module.updateDuration();
  }
});

// Middleware to reorder lessons after deletion
lessonSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const Lesson = mongoose.model('Lesson');
  await Lesson.updateMany(
    { module: this.module, order: { $gt: this.order } },
    { $inc: { order: -1 } }
  );
});

// Update module duration after deletion
lessonSchema.post('deleteOne', { document: true, query: false }, async function () {
  const Module = mongoose.model('Module');
  const module = await Module.findById(this.module);
  if (module) {
    await module.updateDuration();
  }
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
