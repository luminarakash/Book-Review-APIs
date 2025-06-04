const Book = require('../models/Book');
const Review = require('../models/Review');

exports.addBook = async (req, res) => {
  const book = new Book(req.body);
  await book.save();
  res.json(book);
};

exports.getBooks = async (req, res) => {
  const { author, genre, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (author) filter.author = author;
  if (genre) filter.genre = genre;

  const books = await Book.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  res.json(books);
};

exports.getBookDetails = async (req, res) => {
  const book = await Book.findById(req.params.id);
  const reviews = await Review.find({ book: book._id }).populate('user', 'username');
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
  res.json({ book, avgRating, reviews });
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const regex = new RegExp(q, 'i'); // case-insensitive search

    const books = await Book.find({
      $or: [
        { title: { $regex: regex } },
        { author: { $regex: regex } }
      ]
    });

    if (books.length === 0) {
      return res.status(404).json({ message: 'No matching books found' });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

