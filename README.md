# Job Application Tracker

An intuitive web application for organising and tracking your job search. Visualise your application pipeline, manage interview schedules, and export your data - all in one place.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://job-tracker.vercel.app)

## Features

### 📊 Dashboard View
- **Real-time Statistics**: Track total applications, response rate, interviews, and offers
- **Pipeline Overview**: Visual breakdown across all stages (Wishlist, Applied, Screening, Interviewing, Offer, Rejected)
- **Recent Activity**: Quick view of your most recently updated applications

### 📋 Kanban Board
- **Drag-and-Drop Interface**: Easily move applications between stages
- **Visual Pipeline**: See all your applications organised by stage
- **Quick Actions**: Edit or delete applications directly from cards
- **Stage Counts**: Track how many applications are in each stage

### 📝 All Applications View
- **Table Layout**: Comprehensive list of all applications
- **Quick Stage Updates**: Change application stages with dropdown selectors
- **Search & Filter**: Find specific companies or roles instantly
- **Bulk Management**: Edit and manage multiple applications efficiently

### 🔧 Core Functionality
- **Add/Edit Applications**: Comprehensive form with all relevant fields
  - Company name and role
  - Application stage
  - Applied date
  - Source (LinkedIn, Indeed, Referral, etc.)
  - Location (Remote, Hybrid, City)
  - Salary range
  - Job URL
  - Contact information
  - **Job description** - Paste full job descriptions for reference
  - **Interview questions** - Track questions they asked during interviews
  - **My questions** - Prepare questions to ask them
  - Notes and follow-up actions
- **Detailed View Modal**: Click any application to see a comprehensive view with all information
- **Clickable Applications**: Quick access from Dashboard, Kanban, and List views
- **Local Storage**: All data persists in your browser - no account required
- **Export Data**: Download your applications as CSV or JSON
- **Search**: Filter applications by company or role
- **Stage Filtering**: View applications at specific pipeline stages

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and responsive design
- **LocalStorage API** - Data persistence

## Installation

```bash
# Clone the repository
git clone https://github.com/TheDuGuy/job-tracker.git

# Navigate to project directory
cd job-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Adding an Application

1. Click the **"+ Add Application"** button in the header
2. Fill in the required fields (Company and Role)
3. Add optional details like salary range, location, contact info
4. Click **"Add Application"** to save

### Managing Applications

**Dashboard View:**
- View your overall statistics and recent activity
- Get a quick overview of your job search progress

**Kanban View:**
- Drag applications between stages to update their status
- Click "Edit" on any card to modify details
- Click "Delete" to remove an application

**All Applications View:**
- Use the search bar to find specific companies or roles
- Filter by stage using the dropdown
- Click "Edit" to modify any application
- Change stages directly from the dropdown in the table

### Exporting Your Data

Click **"Export CSV"** or **"Export JSON"** in the header to download your application data. Great for:
- Creating backup copies
- Sharing with career coaches
- Importing into spreadsheets
- Tracking long-term job search metrics

## Pipeline Stages

1. **Wishlist** - Companies you're researching or planning to apply to
2. **Applied** - Applications you've submitted
3. **Screening** - Initial phone screens or recruiter calls
4. **Interviewing** - Technical or panel interviews in progress
5. **Offer** - Received job offers
6. **Rejected** - Applications that didn't progress

## Data Privacy

All your data is stored locally in your browser using LocalStorage. No data is sent to any servers, and no account is required. Your job search information stays completely private.

**Note:** Clearing your browser data will delete your applications. Use the export feature regularly to create backups.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- LocalStorage API
- CSS Grid and Flexbox
- Drag and Drop API (for Kanban)

Recommended browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue on GitHub.

## Licence

MIT Licence - feel free to use this project for your own job search!

## Author

Built by **Edou Mota**
CRM and Marketing Automation Specialist

- GitHub: [@TheDuGuy](https://github.com/TheDuGuy)
- Portfolio: [edou-mota-interactive-cv.vercel.app](https://edou-mota-interactive-cv.vercel.app)
- Twitter: [@EdouEsSanto](https://x.com/EdouEsSanto)

---

**Happy job hunting!** 🚀
