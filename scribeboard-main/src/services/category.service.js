/**
 * Category Service
 * CRUD operations for blog categories
 */

const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { generateUniqueSlug, parsePagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * Create category
 */
const createCategory = async (data) => {
  const { name, description, color, icon, metaTitle, metaDescription } = data;
  
  // Generate unique slug
  const slug = await generateUniqueSlug(name, 'category', prisma);
  
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      color,
      icon,
      metaTitle,
      metaDescription
    }
  });
  
  return category;
};

/**
 * Get all categories
 */
const getCategories = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const { includeInactive = false, withPostCount = false } = query;
  
  const where = includeInactive ? {} : { isActive: true };
  
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      ...(withPostCount && {
        include: {
          _count: {
            select: { posts: { where: { status: 'PUBLISHED' } } }
          }
        }
      })
    }),
    prisma.category.count({ where })
  ]);
  
  return {
    categories,
    pagination: buildPaginationResponse(total, page, limit)
  };
};

/**
 * Get category by ID or slug
 */
const getCategory = async (identifier) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier }
      ]
    },
    include: {
      _count: {
        select: { posts: { where: { status: 'PUBLISHED' } } }
      }
    }
  });
  
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  
  return category;
};

/**
 * Update category
 */
const updateCategory = async (id, data) => {
  const { name, description, color, icon, isActive, sortOrder, metaTitle, metaDescription } = data;
  
  // Check if category exists
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Category not found');
  }
  
  // Generate new slug if name changed
  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = await generateUniqueSlug(name, 'category', prisma, id);
  }
  
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name, slug }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(icon !== undefined && { icon }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription })
    }
  });
  
  return category;
};

/**
 * Delete category
 */
const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } }
  });
  
  if (!category) {
    throw AppError.notFound('Category not found');
  }
  
  if (category._count.posts > 0) {
    throw AppError.badRequest(`Cannot delete category with ${category._count.posts} posts. Remove posts first or reassign them.`);
  }
  
  await prisma.category.delete({ where: { id } });
  
  return { message: 'Category deleted successfully' };
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
