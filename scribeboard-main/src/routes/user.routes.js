/**
 * User Routes (for public author profiles)
 */

const express = require('express');
const { prisma } = require('../config/database');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { parsePagination, buildPaginationResponse } = require('../utils/helpers');
const AppError = require('../utils/AppError');

const router = express.Router();

// Get public author profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: { in: ['AUTHOR', 'EDITOR', 'ADMIN'] },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        website: true,
        twitter: true,
        linkedin: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { status: 'PUBLISHED' } }
          }
        }
      }
    });
    
    if (!user) {
      throw AppError.notFound('Author not found');
    }
    
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// Get author's published posts
router.get('/:id/posts', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    
    const where = {
      authorId: req.params.id,
      status: 'PUBLISHED'
    };
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readingTime: true,
          category: {
            select: { id: true, name: true, slug: true, color: true }
          },
          _count: {
            select: { comments: { where: { status: 'APPROVED' } } }
          }
        }
      }),
      prisma.post.count({ where })
    ]);
    
    sendPaginated(res, posts, buildPaginationResponse(total, page, limit));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
