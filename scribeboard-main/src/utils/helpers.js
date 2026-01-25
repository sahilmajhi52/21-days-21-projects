/**
 * Helper Utilities
 */

const slugify = require('slugify');
const config = require('../config');

/**
 * Generate URL-friendly slug
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  });
};

/**
 * Generate unique slug with suffix if needed
 */
const generateUniqueSlug = async (text, model, prisma, excludeId = null) => {
  let slug = generateSlug(text);
  let counter = 1;
  let uniqueSlug = slug;
  
  while (true) {
    const existing = await prisma[model].findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId && { NOT: { id: excludeId } })
      }
    });
    
    if (!existing) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Calculate reading time in minutes
 */
const calculateReadingTime = (content) => {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / config.content.wordsPerMinute);
};

/**
 * Generate excerpt from content
 */
const generateExcerpt = (content, length = config.content.excerptLength) => {
  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= length) {
    return plainText;
  }
  
  return plainText.substring(0, length).trim() + '...';
};

/**
 * Parse pagination params
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || config.pagination.defaultPage);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(query.limit, 10) || config.pagination.defaultLimit)
  );
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Parse sort params
 */
const parseSort = (sortQuery, allowedFields = ['createdAt', 'updatedAt', 'title']) => {
  if (!sortQuery) {
    return { createdAt: 'desc' };
  }
  
  const sortOrder = {};
  const fields = sortQuery.split(',');
  
  for (const field of fields) {
    const direction = field.startsWith('-') ? 'desc' : 'asc';
    const fieldName = field.replace(/^-/, '');
    
    if (allowedFields.includes(fieldName)) {
      sortOrder[fieldName] = direction;
    }
  }
  
  return Object.keys(sortOrder).length > 0 ? sortOrder : { createdAt: 'desc' };
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
  calculateReadingTime,
  generateExcerpt,
  parsePagination,
  buildPaginationResponse,
  parseSort
};
