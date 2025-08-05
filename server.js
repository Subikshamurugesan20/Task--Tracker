const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;


const MONGO_URI = 'mongodb://localhost:27017/Tasks';

app.use(cors());
app.use(express.json());


const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

function parseDate(str) {
  if (!str) return null;
  const [day, month, year] = str.split('-');
  return new Date(`${year}-${month}-${day}`);
}

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  endDate: Date,
  
});


taskSchema.set('toJSON', {
  transform: function (doc, ret) {
    if (ret.startDate) ret.startDate = ret.startDate.toISOString().split('T')[0];
    if (ret.endDate) ret.endDate = ret.endDate.toISOString().split('T')[0];
    return ret;
  }
});

const Task = mongoose.model('Task', taskSchema);

app.post('/tasks', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const task = new Task({
      title,
      description,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate)
      
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(' Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate,} = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate: parseDate(startDate),
        endDate: parseDate(endDate),
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(' Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
