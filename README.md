# MakeMyGraph

A powerful web application for data visualization and statistical analysis. Upload your data files and generate interactive graphs with statistical insights.

## Features

- File Upload: Support for CSV, XLSX, and XLS files
- Statistical Analysis: Calculate mean, median, mode, highest, and lowest values
- Interactive Graphs: View data in bar charts and pie charts
- Dark Mode Support: Toggle between light and dark themes
- Responsive Design: Works on desktop, tablet, and mobile devices
- Graph Export: Download graphs in PNG, JPEG, or PDF formats
- Data Storage: Save and manage your graphs using MongoDB Atlas

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/makemygraph.git
cd makemygraph
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your MongoDB Atlas connection string:

```
REACT_APP_MONGODB_URI=your_mongodb_atlas_connection_string_here
```

4. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Upload Data:

   - Click on the upload area or drag and drop your data file
   - Supported formats: CSV, XLSX, XLS
   - Ensure your data file has proper column headers

2. Generate Graphs:

   - Select the column you want to analyze
   - View statistical information
   - Switch between bar chart and pie chart views

3. Export Graphs:

   - Click on the export buttons (PNG, JPEG, PDF)
   - Downloaded files will be saved to your default downloads folder

4. Save Graphs:
   - Click the "Save Graph" button to store your visualization
   - Access saved graphs from the "Saved Graphs" page
   - Delete saved graphs when no longer needed

## Project Structure

```
makemygraph/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── Footer.jsx
│   │   ├── graphs/
│   │   │   ├── CreateGraph.jsx
│   │   │   ├── GraphDisplay.jsx
│   │   │   └── SavedGraphs.jsx
│   │   ├── upload/
│   │   │   └── FileUpload.jsx
│   │   ├── navbar.jsx
│   │   └── AboutUs.jsx
│   ├── services/
│   │   └── mongodb.js
│   └── App.js
├── .env
├── package.json
└── README.md
```

## Technologies Used

- React.js
- React Router
- Chart.js
- MongoDB Atlas
- Tailwind CSS
- Papa Parse (CSV parsing)
- XLSX (Excel file parsing)
- React Dropzone
- React Toastify
- HTML2Canvas
- jsPDF

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact support@makemygraph.com.
