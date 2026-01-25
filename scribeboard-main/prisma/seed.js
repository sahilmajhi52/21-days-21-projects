/**
 * Database Seed Script
 * Creates sample data for ScribeBoard API
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  // Create users
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@scribeboard.com' },
    update: {},
    create: {
      email: 'admin@scribeboard.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      bio: 'Platform administrator',
      isVerified: true
    }
  });
  console.log('✅ Admin user created:', admin.email);
  
  const editor = await prisma.user.upsert({
    where: { email: 'editor@scribeboard.com' },
    update: {},
    create: {
      email: 'editor@scribeboard.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Editor',
      role: 'EDITOR',
      bio: 'Content editor and reviewer',
      isVerified: true
    }
  });
  console.log('✅ Editor user created:', editor.email);
  
  const author = await prisma.user.upsert({
    where: { email: 'author@scribeboard.com' },
    update: {},
    create: {
      email: 'author@scribeboard.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Writer',
      role: 'AUTHOR',
      bio: 'Technical writer and blogger',
      website: 'https://johnwriter.dev',
      isVerified: true
    }
  });
  console.log('✅ Author user created:', author.email);
  
  // Create categories
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Tech news and tutorials', color: '#3B82F6', icon: '💻' },
    { name: 'Programming', slug: 'programming', description: 'Coding tutorials and tips', color: '#10B981', icon: '⌨️' },
    { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend development', color: '#8B5CF6', icon: '🌐' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD, cloud, and infrastructure', color: '#F59E0B', icon: '🚀' },
    { name: 'Career', slug: 'career', description: 'Career advice and growth', color: '#EF4444', icon: '📈' }
  ];
  
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }
  console.log('✅ Categories created:', categories.length);
  
  // Create sample posts
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const programmingCategory = await prisma.category.findUnique({ where: { slug: 'programming' } });
  
  const posts = [
    {
      title: 'Getting Started with Node.js in 2024',
      slug: 'getting-started-with-nodejs-2024',
      excerpt: 'A comprehensive guide to starting your Node.js journey with modern best practices.',
      content: `# Getting Started with Node.js in 2024

Node.js continues to be one of the most popular runtime environments for building server-side applications. In this guide, we'll cover everything you need to know to get started.

## Why Node.js?

Node.js offers several advantages:
- **Non-blocking I/O**: Perfect for handling multiple concurrent requests
- **JavaScript everywhere**: Use the same language on frontend and backend
- **Rich ecosystem**: NPM has millions of packages
- **Active community**: Constant improvements and support

## Setting Up Your Environment

First, download Node.js from the official website. We recommend using the LTS version for production applications.

\`\`\`bash
# Check your installation
node --version
npm --version
\`\`\`

## Your First Application

Create a simple HTTP server:

\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
\`\`\`

## Next Steps

- Learn about Express.js for building APIs
- Explore async/await patterns
- Study database integrations

Happy coding!`,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: author.id,
      categoryId: programmingCategory.id,
      readingTime: 5,
      isFeatured: true
    },
    {
      title: 'Building RESTful APIs with Express.js',
      slug: 'building-restful-apis-expressjs',
      excerpt: 'Learn how to build scalable and maintainable REST APIs using Express.js framework.',
      content: `# Building RESTful APIs with Express.js

Express.js is the most popular web framework for Node.js. Let's learn how to build production-ready APIs.

## What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. Key principles include:

- **Stateless**: Each request contains all information needed
- **Resource-based**: Everything is a resource with a unique URL
- **HTTP Methods**: Use GET, POST, PUT, DELETE appropriately

## Setting Up Express

\`\`\`bash
npm init -y
npm install express
\`\`\`

## Creating Your First Route

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);
\`\`\`

## Best Practices

1. Use proper HTTP status codes
2. Implement input validation
3. Add error handling middleware
4. Use environment variables
5. Document your API

Start building!`,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: author.id,
      categoryId: programmingCategory.id,
      readingTime: 7
    },
    {
      title: 'Top 10 VS Code Extensions for 2024',
      slug: 'top-10-vscode-extensions-2024',
      excerpt: 'Boost your productivity with these essential VS Code extensions every developer should have.',
      content: `# Top 10 VS Code Extensions for 2024

Visual Studio Code is the most popular code editor. Here are the must-have extensions.

## 1. ESLint
Keep your code clean with automatic linting.

## 2. Prettier
Format your code automatically on save.

## 3. GitLens
Supercharge your Git capabilities within VS Code.

## 4. Auto Rename Tag
Automatically rename paired HTML/XML tags.

## 5. Bracket Pair Colorizer
Make matching brackets easier to identify.

## 6. Path Intellisense
Autocomplete filenames in your imports.

## 7. Thunder Client
Test APIs directly from VS Code.

## 8. Live Server
Launch a local development server with live reload.

## 9. Docker
Manage Docker containers from VS Code.

## 10. GitHub Copilot
AI-powered code completion.

Install these and watch your productivity soar!`,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
      authorId: editor.id,
      categoryId: techCategory.id,
      readingTime: 4,
      isFeatured: true
    },
    {
      title: 'Draft: Upcoming Features in JavaScript',
      slug: 'draft-upcoming-features-javascript',
      excerpt: 'A sneak peek at the exciting features coming to JavaScript.',
      content: `# Upcoming Features in JavaScript

This is a draft post about upcoming JavaScript features. 

## Topics to cover:
- Pattern matching
- Record and Tuple
- Decorators
- Temporal API

*Work in progress...*`,
      status: 'DRAFT',
      authorId: author.id,
      categoryId: programmingCategory.id,
      readingTime: 3
    }
  ];
  
  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post
    });
  }
  console.log('✅ Sample posts created:', posts.length);
  
  // Create tags
  const tags = ['nodejs', 'javascript', 'express', 'api', 'tutorial', 'vscode', 'productivity'];
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: tagName },
      update: {},
      create: { name: tagName, slug: tagName }
    });
  }
  console.log('✅ Tags created:', tags.length);
  
  // Create sample comments
  const publishedPost = await prisma.post.findFirst({ where: { status: 'PUBLISHED' } });
  
  if (publishedPost) {
    const comment1 = await prisma.comment.create({
      data: {
        content: 'Great article! Very helpful for beginners.',
        status: 'APPROVED',
        postId: publishedPost.id,
        authorId: editor.id
      }
    });
    
    await prisma.comment.create({
      data: {
        content: 'Thanks! Glad you found it useful.',
        status: 'APPROVED',
        postId: publishedPost.id,
        authorId: author.id,
        parentId: comment1.id
      }
    });
    
    await prisma.comment.create({
      data: {
        content: 'This needs moderation approval.',
        status: 'PENDING',
        postId: publishedPost.id,
        guestName: 'Anonymous',
        guestEmail: 'anon@example.com'
      }
    });
    
    console.log('✅ Sample comments created');
  }
  
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Test Accounts:');
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│ Role   │ Email                      │ Password     │');
  console.log('├─────────────────────────────────────────────────────┤');
  console.log('│ Admin  │ admin@scribeboard.com      │ Admin@123    │');
  console.log('│ Editor │ editor@scribeboard.com     │ Admin@123    │');
  console.log('│ Author │ author@scribeboard.com     │ Admin@123    │');
  console.log('└─────────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
