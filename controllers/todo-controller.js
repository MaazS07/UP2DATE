const Todo = require('../model/Todo');

// Get all todos for a specific user
exports.getTodos = async (req, res) => {
  try {
    const userId = req.params.userId;
    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
};

// Create a new todo for a specific user
exports.createTodo = async (req, res) => {
  try {
    const newTodo = new Todo({
      ...req.body,
      userId: req.params.userId
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: 'Error creating todo' });
  }
};

// Update a todo (ensure it belongs to the user)
exports.updateTodo = async (req, res) => {
  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.params.userId },
      req.body,
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: 'Error updating todo' });
  }
};


exports.deleteTodo = async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.params.userId });
    if (!deletedTodo) {
      return res.status(404).json({ message: 'Todo not found or not authorized' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting todo' });
  }
};
