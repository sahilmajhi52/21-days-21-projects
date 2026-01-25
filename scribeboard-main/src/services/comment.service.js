/**
 * Comment Service
 * Comment CRUD and moderation system
 */

const { prisma } = require('../config/database');
const config = require('../config');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * Create comment
 */
const createComment = async (postId, data, userId = null, ipInfo = {}) => {
  const { content, parentId, guestName, guestEmail } = data;
  
  // Check if post exists and allows comments
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, allowComments: true, status: true }
  });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  if (post.status !== 'PUBLISHED') {
    throw AppError.badRequest('Cannot comment on unpublished posts');
  }
  
  if (!post.allowComments) {
    throw AppError.badRequest('Comments are disabled for this post');
  }
  
  // Check parent comment if replying
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true, parentId: true }
    });
    
    if (!parentComment) {
      throw AppError.notFound('Parent comment not found');
    }
    
    if (parentComment.postId !== postId) {
      throw AppError.badRequest('Parent comment belongs to different post');
    }
    
    // Check nesting level
    if (parentComment.parentId) {
      // Count nesting levels
      let level = 1;
      let currentParent = parentComment;
      while (currentParent.parentId && level < config.comments.maxNestingLevel) {
        currentParent = await prisma.comment.findUnique({
          where: { id: currentParent.parentId },
          select: { parentId: true }
        });
        level++;
      }
      
      if (level >= config.comments.maxNestingLevel) {
        throw AppError.badRequest(`Maximum nesting level (${config.comments.maxNestingLevel}) reached`);
      }
    }
  }
  
  // Determine initial status
  const status = config.comments.autoApprove || userId ? 'APPROVED' : 'PENDING';
  
  const comment = await prisma.comment.create({
    data: {
      content,
      status,
      postId,
      authorId: userId,
      parentId,
      guestName: !userId ? guestName : null,
      guestEmail: !userId ? guestEmail : null,
      ipAddress: ipInfo.ip,
      userAgent: ipInfo.userAgent
    },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true }
      },
      replies: {
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true }
          }
        }
      }
    }
  });
  
  return comment;
};

/**
 * Get comments for a post
 */
const getPostComments = async (postId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true }
  });
  
  if (!post) {
    throw AppError.notFound('Post not found');
  }
  
  // Get top-level comments only (not replies)
  const where = {
    postId,
    status: 'APPROVED',
    parentId: null
  };
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        },
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true }
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true, avatar: true }
                }
              }
            }
          }
        }
      }
    }),
    prisma.comment.count({ where })
  ]);
  
  return {
    comments,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Get all comments (admin/moderator)
 */
const getAllComments = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const { status, postId } = query;
  
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (postId) {
    where.postId = postId;
  }
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        post: {
          select: { id: true, title: true, slug: true }
        }
      }
    }),
    prisma.comment.count({ where })
  ]);
  
  return {
    comments,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Approve comment
 */
const approveComment = async (commentId, moderatorId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  
  if (!comment) {
    throw AppError.notFound('Comment not found');
  }
  
  const approvedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'APPROVED',
      moderatedAt: new Date(),
      moderatedBy: moderatorId
    }
  });
  
  return approvedComment;
};

/**
 * Reject comment
 */
const rejectComment = async (commentId, moderatorId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  
  if (!comment) {
    throw AppError.notFound('Comment not found');
  }
  
  const rejectedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'REJECTED',
      moderatedAt: new Date(),
      moderatedBy: moderatorId
    }
  });
  
  return rejectedComment;
};

/**
 * Mark comment as spam
 */
const markAsSpam = async (commentId, moderatorId) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  
  if (!comment) {
    throw AppError.notFound('Comment not found');
  }
  
  const spamComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: 'SPAM',
      isSpam: true,
      moderatedAt: new Date(),
      moderatedBy: moderatorId
    }
  });
  
  return spamComment;
};

/**
 * Delete comment
 */
const deleteComment = async (commentId, userId, userRole) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { _count: { select: { replies: true } } }
  });
  
  if (!comment) {
    throw AppError.notFound('Comment not found');
  }
  
  // Check permission
  if (comment.authorId !== userId && !['ADMIN', 'EDITOR'].includes(userRole)) {
    throw AppError.forbidden('You can only delete your own comments');
  }
  
  // If has replies, just mark as deleted instead of removing
  if (comment._count.replies > 0) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { content: '[Deleted]', status: 'REJECTED' }
    });
  } else {
    await prisma.comment.delete({ where: { id: commentId } });
  }
  
  return { message: 'Comment deleted successfully' };
};

/**
 * Get comment stats
 */
const getCommentStats = async () => {
  const stats = await prisma.comment.groupBy({
    by: ['status'],
    _count: true
  });
  
  const statsMap = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0
  };
  
  stats.forEach(item => {
    statsMap[item.status.toLowerCase()] = item._count;
    statsMap.total += item._count;
  });
  
  return statsMap;
};

module.exports = {
  createComment,
  getPostComments,
  getAllComments,
  approveComment,
  rejectComment,
  markAsSpam,
  deleteComment,
  getCommentStats
};
