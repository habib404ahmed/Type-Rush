import { Paragraph } from '../models/Paragraph.js';
import { Log } from '../models/Log.js';

// Default paragraphs seed data
const defaultParagraphs = [
  {
    title: 'Technology and Innovation',
    content: 'Technology continues to reshape the landscape of modern education and industry. Artificial intelligence, cloud computing, and high-speed communications enable students to collaborate globally. Developing strong foundational skills in typing, coding, and logical problem solving equips individuals to adapt seamlessly in a rapidly evolving technological ecosystem.',
    difficulty: 'Easy',
    category: 'Technology',
  },
  {
    title: 'Cybersecurity Principles',
    content: 'Information security is a paramount concern for organizations worldwide. Implementing robust encryption standards, multi-factor authentication protocols, and continuous vulnerability monitoring reduces the risk of data breaches. Understanding common attack vectors empowers teams to build resilient software architectures that defend sensitive user data.',
    difficulty: 'Medium',
    category: 'Security',
  },
  {
    title: 'Algorithmic Optimization',
    content: 'Computer algorithms structure complex computational workflows efficiently. Optimizing time complexity through dynamic programming, logarithmic search trees, and parallelized graph traversals significantly reduces system execution latency. As data volumes scale exponentially, algorithmic elegance distinguishes high-throughput software systems from legacy applications.',
    difficulty: 'Hard',
    category: 'Computer Science',
  },
];

// Seed default paragraphs helper
export const seedDefaultParagraphs = async () => {
  try {
    const count = await Paragraph.countDocuments();
    if (count === 0) {
      await Paragraph.insertMany(defaultParagraphs);
      console.log('[Paragraph Setup] Seeded 3 default typing paragraphs (Easy, Medium, Hard)');
    }
  } catch (err) {
    console.warn(`[Paragraph Seed Warning]: ${err.message}`);
  }
};

// @desc    Get random paragraph by difficulty
// @route   GET /api/v1/paragraphs/random
// @access  Public
export const getRandomParagraph = async (req, res, next) => {
  try {
    const { difficulty } = req.query;

    const query = { isDeleted: false };
    if (difficulty && ['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      query.difficulty = difficulty;
    }

    const count = await Paragraph.countDocuments(query);
    if (count === 0) {
      const fallback = await Paragraph.findOne({ isDeleted: false });
      if (!fallback) {
        return res.status(404).json({
          success: false,
          message: 'No typing paragraphs available in pool',
        });
      }
      return res.status(200).json({
        success: true,
        paragraph: fallback,
      });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const paragraph = await Paragraph.findOne(query).skip(randomIndex);

    res.status(200).json({
      success: true,
      paragraph,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all paragraphs
// @route   GET /api/v1/paragraphs
// @access  Private (Admin)
export const getAllParagraphs = async (req, res, next) => {
  try {
    const paragraphs = await Paragraph.find({ isDeleted: false }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: paragraphs.length,
      paragraphs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a paragraph
// @route   POST /api/v1/paragraphs
// @access  Private (Admin)
export const createParagraph = async (req, res, next) => {
  try {
    const { title, content, difficulty, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content text are required',
      });
    }

    const paragraph = await Paragraph.create({
      title: title.trim(),
      content: content.trim(),
      difficulty: difficulty || 'Medium',
      category: category || 'General',
    });

    await Log.create({
      action: 'PARAGRAPH_CREATED',
      category: 'SYSTEM',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { title: paragraph.title, difficulty: paragraph.difficulty },
    });

    res.status(201).json({
      success: true,
      message: 'Paragraph created successfully',
      paragraph,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a paragraph
// @route   PUT /api/v1/paragraphs/:id
// @access  Private (Admin)
export const updateParagraph = async (req, res, next) => {
  try {
    const { title, content, difficulty, category } = req.body;

    let paragraph = await Paragraph.findOne({ _id: req.params.id, isDeleted: false });
    if (!paragraph) {
      return res.status(404).json({
        success: false,
        message: 'Paragraph not found',
      });
    }

    if (title) paragraph.title = title.trim();
    if (content) paragraph.content = content.trim();
    if (difficulty) paragraph.difficulty = difficulty;
    if (category) paragraph.category = category;

    await paragraph.save();

    res.status(200).json({
      success: true,
      message: 'Paragraph updated successfully',
      paragraph,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a paragraph
// @route   DELETE /api/v1/paragraphs/:id
// @access  Private (Admin)
export const deleteParagraph = async (req, res, next) => {
  try {
    const paragraph = await Paragraph.findOne({ _id: req.params.id, isDeleted: false });
    if (!paragraph) {
      return res.status(404).json({
        success: false,
        message: 'Paragraph not found',
      });
    }

    paragraph.isDeleted = true;
    paragraph.deletedAt = new Date();
    await paragraph.save();

    res.status(200).json({
      success: true,
      message: 'Paragraph deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import paragraphs via JSON
// @route   POST /api/v1/paragraphs/bulk-import
// @access  Private (Admin)
export const bulkImportParagraphs = async (req, res, next) => {
  try {
    const { paragraphs } = req.body;

    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid JSON array of paragraphs',
      });
    }

    const cleanParagraphs = paragraphs.map((item) => ({
      title: (item.title || 'Untitled Paragraph').trim(),
      content: (item.content || '').trim(),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Medium',
      category: item.category || 'General',
    })).filter((item) => item.content.length > 0);

    const inserted = await Paragraph.insertMany(cleanParagraphs);

    await Log.create({
      action: 'PARAGRAPHS_BULK_IMPORTED',
      category: 'SYSTEM',
      userId: req.admin?._id,
      userType: 'Admin',
      details: { count: inserted.length },
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${inserted.length} paragraphs into content pool.`,
      count: inserted.length,
    });
  } catch (error) {
    next(error);
  }
};
