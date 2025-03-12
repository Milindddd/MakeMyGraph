// Import dependencies
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const xlsx = require('xlsx');
require('dotenv').config();

// Initialize app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read the uploaded file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Send back the sheet data as JSON
    res.json({ data: sheetData });
  } catch (error) {
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
