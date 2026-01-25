/**
 * Post Service
 * Blog post CRUD with publishing workflow
 */

const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const {
  generateUniqueSlug,
  calculateReadingTime,
  generateExcerpt,
  parsePagination,
  buildPaginationResponse,
  parseSort
} = require('../utils/helpers');

/**
 * Create new post (draft)
 */
const createPost = async (authorId, data) => {
  const { title, content, excerpt, coverImage, categoryId, tags, allowComments, metaTitle, metaDescription } = data;
  
  // Generate unique slug
  const slug = await generateUniqueSlug(title, 'post', prisma);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(content);
  
  // Auto-generate excerpt if not provided
  const postExcerpt = excerpt || generateExcerpt(content);
  
  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: postExcerpt,
      coverImage,
      readingTime,
      allowComments: allowComments !== false,
      metaTitle,
      metaDescription,
      authorId,
      categoryId,
      // Create tags
      tags: tags?.length > 0 ? {
        create: await Promise.all(tags.map(async (tagName) => {
          const tag = await prisma.tag.upsert({
            where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-')
            }
          });
          return { tagId: tag.id };
        }))
      } : undefined
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true }
      },
      category: {
        select: { id: true, name: true, slug: true }
      },
      tags: {
        include: { tag: true }
      }
    }
  });
  
  return post;
};

/**
 * Get posts with filters
 */
const getPosts = async (query = {}, userId = null) => {
  const { page, limit, skip } = parsePagination(query);
  const {
    status,
    authorId,
    categoryId,
    category,
    tag,
    search,
    featured,
    sort
  } = query;
  
  // Build where clause
  const where = {};
  
  // For public: only show published posts
  // For authors: show their own posts regardless of status
  if (userId) {
    where.OR = [
      { status: 'PUBLISHED' },
      { authorId: userId }
    ];
  } else {
    where.status = 'PUBLISHED';
  }
  
  // Apply filters
  if (status && userId) {
    where.status = status;
    delete where.OR;
  }
  
  if (authorId) {
    where.authorId = authorId;
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (category) {
    where.category = { slug: category };
  }
  
  if (tag) {
    where.tags = {
      some: { tag: { slug: tag } }
    };
  }
  
  if (featured === 'true') {
    where.isFeatured = true;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  const orderBy = parseSort(sort, ['createdAt', 'publishedAt', 'title', 'viewCount']);
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        category: {
          select: { id: true, name: true, slug: true, color: true }
        },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } }
        },
        _count: {
          select: { comments: { where: { status: 'APPROVED' } } }
        }
      }
    }),
    prisma.post.count({ where })
  ]);
  
  return {
    posts,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Get single post by ID or slug
 */
const getPost = async (identifier, incrementView = false) => {
  const post = await prisma.post.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier }
      ]
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true, bio: true }
      },
      category: true,
      tags: {
        include: { tag: true }
      },
      _count: {
        select: { comments: { where: { status: 'APPROVED' } } }
      }
    }
  });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  // Increment view count
  if (incrementView && post.status === 'PUBLISHED') {
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    });
    post.viewCount += 1;
  }
  
  return post;
};

/**
 * Update post
 */
const updatePost = async (postId, authorId, data, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  // Check permission (author or admin/editor)
  if (post.authorId !== authorId && !['ADMIN', 'EDITOR'].includes(userRole)) {
    throw AppError.forbidden('You can only edit your own posts');
  }
  
  const { title, content, excerpt, coverImage, categoryId, tags, allowComments, isFeatured, isPinned, metaTitle, metaDescription } = data;
  
  // Generate new slug if title changed
  let slug = post.slug;
  if (title && title !== post.title) {
    slug = await generateUniqueSlug(title, 'post', prisma, postId);
  }
  
  // Recalculate reading time if content changed
  const readingTime = content ? calculateReadingTime(content) : post.readingTime;
  
  // Save revision before update
  await prisma.postRevision.create({
    data: {
      postId,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt
    }
  });
  
  // Update post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title && { title, slug }),
      ...(content && { content, readingTime }),
      ...(excerpt !== undefined && { excerpt }),
      ...(coverImage !== undefined && { coverImage }),
      ...(categoryId !== undefined && { categoryId }),
      ...(allowComments !== undefined && { allowComments }),
      ...(isFeatured !== undefined && ['ADMIN', 'EDITOR'].includes(userRole) && { isFeatured }),
      ...(isPinned !== undefined && ['ADMIN', 'EDITOR'].includes(userRole) && { isPinned }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription })
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true }
      },
      category: true,
      tags: {
        include: { tag: true }
      }
    }
  });
  
  // Update tags if provided
  if (tags !== undefined) {
    // Remove existing tags
    await prisma.postTag.deleteMany({ where: { postId } });
    
    // Add new tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-')
          }
        });
        await prisma.postTag.create({
          data: { postId, tagId: tag.id }
        });
      }
    }
  }
  
  return updatedPost;
};

/**
 * Publish post
 */
const publishPost = async (postId, authorId, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.authorId !== authorId && !['ADMIN', 'EDITOR'].includes(userRole)) {
    throw AppError.forbidden('You can only publish your own posts');
  }
  
  if (post.status === 'PUBLISHED') {
    throw AppError.badRequest('Post is already published');
  }
  
  const publishedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date()
    }
  });
  
  return publishedPost;
};

/**
 * Unpublish post
 */
const unpublishPost = async (postId, authorId, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.authorId !== authorId && !['ADMIN', 'EDITOR'].includes(userRole)) {
    throw AppError.forbidden('You can only unpublish your own posts');
  }
  
  if (post.status !== 'PUBLISHED') {
    throw AppError.badRequest('Post is not published');
  }
  
  const unpublishedPost = await prisma.post.update({
    where: { id: postId },
    data: { status: 'UNPUBLISHED' }
  });
  
  return unpublishedPost;
};

/**
 * Submit post for review
 */
const submitForReview = async (postId, authorId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.authorId !== authorId) {
    throw AppError.forbidden('You can only submit your own posts');
  }
  
  if (post.status !== 'DRAFT') {
    throw AppError.badRequest('Only drafts can be submitted for review');
  }
  
  const submittedPost = await prisma.post.update({
    where: { id: postId },
    data: { status: 'PENDING_REVIEW' }
  });
  
  return submittedPost;
};

/**
 * Delete post
 */
const deletePost = async (postId, authorId, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.authorId !== authorId && !['ADMIN'].includes(userRole)) {
    throw AppError.forbidden('You can only delete your own posts');
  }
  
  await prisma.post.delete({ where: { id: postId } });
  
  return { message: 'Post deleted successfully' };
};

/**
 * Get post revisions
 */
const getPostRevisions = async (postId, authorId, userRole) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.authorId !== authorId && !['ADMIN', 'EDITOR'].includes(userRole)) {
    throw AppError.forbidden('You can only view revisions of your own posts');
  }
  
  const revisions = await prisma.postRevision.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  return revisions;
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  publishPost,
  unpublishPost,
  submitForReview,
  deletePost,
  getPostRevisions
};
