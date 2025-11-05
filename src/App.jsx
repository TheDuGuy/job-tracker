import { useState, useEffect } from 'react';
import './App.css';

// Pipeline stages
const STAGES = {
  WISHLIST: 'wishlist',
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEWING: 'interviewing',
  OFFER: 'offer',
  REJECTED: 'rejected'
};

const STAGE_LABELS = {
  [STAGES.WISHLIST]: 'Wishlist',
  [STAGES.APPLIED]: 'Applied',
  [STAGES.SCREENING]: 'Screening',
  [STAGES.INTERVIEWING]: 'Interviewing',
  [STAGES.OFFER]: 'Offer',
  [STAGES.REJECTED]: 'Rejected'
};

const STAGE_COLORS = {
  [STAGES.WISHLIST]: 'bg-gray-100 border-gray-300',
  [STAGES.APPLIED]: 'bg-blue-50 border-blue-300',
  [STAGES.SCREENING]: 'bg-yellow-50 border-yellow-300',
  [STAGES.INTERVIEWING]: 'bg-purple-50 border-purple-300',
  [STAGES.OFFER]: 'bg-green-50 border-green-300',
  [STAGES.REJECTED]: 'bg-red-50 border-red-300'
};

function App() {
  const [applications, setApplications] = useState([]);
  const [view, setView] = useState('dashboard'); // dashboard, kanban, list
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jobApplications');
    if (saved) {
      setApplications(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever applications change
  useEffect(() => {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
  }, [applications]);

  const addApplication = (app) => {
    const newApp = {
      ...app,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setApplications([...applications, newApp]);
    setShowModal(false);
  };

  const updateApplication = (id, updates) => {
    setApplications(applications.map(app =>
      app.id === id
        ? { ...app, ...updates, updatedAt: new Date().toISOString() }
        : app
    ));
    setShowModal(false);
    setEditingApp(null);
  };

  const deleteApplication = (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
      setApplications(applications.filter(app => app.id !== id));
    }
  };

  const moveToStage = (id, newStage) => {
    updateApplication(id, { stage: newStage });
  };

  const viewApplication = (app) => {
    setViewingApp(app);
    setShowDetailModal(true);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(applications, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportCSV = () => {
    const headers = ['Company', 'Role', 'Stage', 'Applied Date', 'Source', 'Location', 'Salary Range', 'Contact', 'Notes'];
    const rows = applications.map(app => [
      app.company,
      app.role,
      STAGE_LABELS[app.stage],
      app.appliedDate || '',
      app.source || '',
      app.location || '',
      app.salaryRange || '',
      app.contact || '',
      app.notes?.replace(/\n/g, ' ') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || app.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  // Calculate stats
  const stats = {
    total: applications.length,
    wishlist: applications.filter(a => a.stage === STAGES.WISHLIST).length,
    applied: applications.filter(a => a.stage === STAGES.APPLIED).length,
    screening: applications.filter(a => a.stage === STAGES.SCREENING).length,
    interviewing: applications.filter(a => a.stage === STAGES.INTERVIEWING).length,
    offers: applications.filter(a => a.stage === STAGES.OFFER).length,
    rejected: applications.filter(a => a.stage === STAGES.REJECTED).length,
    responseRate: applications.filter(a => a.stage === STAGES.APPLIED).length > 0
      ? Math.round(((applications.filter(a => [STAGES.SCREENING, STAGES.INTERVIEWING, STAGES.OFFER].includes(a.stage)).length) /
          applications.filter(a => a.stage !== STAGES.WISHLIST).length) * 100)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Organise and track your job search</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  setEditingApp(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Application
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex gap-4 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'kanban', label: 'Kanban' },
              { id: 'list', label: 'All Applications' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  view === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        {view !== 'dashboard' && (
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stages</option>
              {Object.entries(STAGE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && <Dashboard stats={stats} applications={applications} onView={viewApplication} />}

        {/* Kanban View */}
        {view === 'kanban' && (
          <KanbanBoard
            applications={filteredApps}
            moveToStage={moveToStage}
            onView={viewApplication}
            onEdit={(app) => {
              setEditingApp(app);
              setShowModal(true);
            }}
            onDelete={deleteApplication}
          />
        )}

        {/* List View */}
        {view === 'list' && (
          <ListView
            applications={filteredApps}
            onView={viewApplication}
            onEdit={(app) => {
              setEditingApp(app);
              setShowModal(true);
            }}
            onDelete={deleteApplication}
            moveToStage={moveToStage}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-300 text-sm">
            Built by <a href="https://github.com/TheDuGuy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors font-medium">Edou Mota</a>
          </p>
          <p className="text-gray-300 text-xs mt-1">
            CRM and Marketing Automation
          </p>
        </div>
      </footer>

      {/* Edit/Add Modal */}
      {showModal && (
        <ApplicationModal
          application={editingApp}
          onSave={editingApp ? (data) => updateApplication(editingApp.id, data) : addApplication}
          onClose={() => {
            setShowModal(false);
            setEditingApp(null);
          }}
        />
      )}

      {/* Detail View Modal */}
      {showDetailModal && viewingApp && (
        <DetailModal
          application={viewingApp}
          onClose={() => {
            setShowDetailModal(false);
            setViewingApp(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setEditingApp(viewingApp);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard({ stats, applications, onView }) {
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Applications" value={stats.total} color="blue" />
        <StatCard title="Response Rate" value={`${stats.responseRate}%`} color="green" />
        <StatCard title="Interviews" value={stats.interviewing} color="purple" />
        <StatCard title="Offers" value={stats.offers} color="green" />
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pipeline Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <PipelineCard label="Wishlist" count={stats.wishlist} color="gray" />
          <PipelineCard label="Applied" count={stats.applied} color="blue" />
          <PipelineCard label="Screening" count={stats.screening} color="yellow" />
          <PipelineCard label="Interviewing" count={stats.interviewing} color="purple" />
          <PipelineCard label="Offers" count={stats.offers} color="green" />
          <PipelineCard label="Rejected" count={stats.rejected} color="red" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {recentApps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications yet. Start by adding your first application!</p>
        ) : (
          <div className="space-y-3">
            {recentApps.map(app => (
              <div
                key={app.id}
                onClick={() => onView(app)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{app.company}</h3>
                  <p className="text-sm text-gray-600">{app.role}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStageBadgeColor(app.stage)}`}>
                  {STAGE_LABELS[app.stage]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`inline-block p-3 rounded-lg ${colors[color]} mb-3`}>
        <div className="text-white text-2xl">📊</div>
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function PipelineCard({ label, count, color }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-4 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
    </div>
  );
}

// Kanban Board Component
function KanbanBoard({ applications, moveToStage, onView, onEdit, onDelete }) {
  const [draggedApp, setDraggedApp] = useState(null);

  const handleDragStart = (app) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (stage) => {
    if (draggedApp) {
      moveToStage(draggedApp.id, stage);
      setDraggedApp(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Object.entries(STAGES).map(([key, stage]) => (
        <div
          key={stage}
          className={`rounded-lg border-2 ${STAGE_COLORS[stage]} p-4 min-h-[500px]`}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(stage)}
        >
          <h3 className="font-semibold mb-3 flex items-center justify-between">
            <span>{STAGE_LABELS[stage]}</span>
            <span className="text-sm bg-white rounded-full px-2 py-1">
              {applications.filter(a => a.stage === stage).length}
            </span>
          </h3>
          <div className="space-y-2">
            {applications
              .filter(app => app.stage === stage)
              .map(app => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => handleDragStart(app)}
                  className="bg-white rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
                >
                  <div onClick={() => onView(app)} className="cursor-pointer">
                    <h4 className="font-medium text-sm hover:text-blue-600">{app.company}</h4>
                    <p className="text-xs text-gray-600 mt-1">{app.role}</p>
                    {app.location && (
                      <p className="text-xs text-gray-500 mt-1">📍 {app.location}</p>
                    )}
                    {app.appliedDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(app.appliedDate).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(app);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(app);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(app.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// List View Component
function ListView({ applications, onView, onEdit, onDelete, moveToStage }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No applications found</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id} onClick={() => onView(app)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{app.company}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{app.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.stage}
                    onChange={(e) => moveToStage(app.id, e.target.value)}
                    className={`text-xs font-medium rounded-full px-3 py-1 ${getStageBadgeColor(app.stage)}`}
                  >
                    {Object.entries(STAGE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-GB') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onView(app)}
                    className="text-gray-600 hover:text-gray-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(app)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(app.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Application Modal Component
function ApplicationModal({ application, onSave, onClose }) {
  const [formData, setFormData] = useState(application || {
    // Company Information
    company: '',
    role: '',
    location: '',
    salaryRange: '',
    jobUrl: '',
    appliedDate: '',

    // Role Details
    keyResponsibilities: '',
    requiredSkills: '',
    whyGoodFit: '',

    // Application Details
    source: '',
    cvVersion: '',
    coverLetter: false,
    portfolioIncluded: false,

    // Contact Information
    hiringManager: '',
    recruiter: '',
    recruiterContact: '',
    internalContact: '',

    // Timeline
    stage: STAGES.WISHLIST,
    recruiterScreen: '',
    phoneScreen: '',
    firstInterview: '',
    secondInterview: '',
    finalInterview: '',

    // Interview Prep
    questionsToAsk: '',
    technicalTopics: '',
    portfolioProjects: {
      gtmGenerator: false,
      leadScoring: false,
      abTest: false,
      customerJourney: false
    },

    // Full Details
    jobDescription: '',
    questionsAsked: '',

    // Notes
    initialThoughts: '',
    followUpActions: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('portfolio_')) {
      const projectName = name.replace('portfolio_', '');
      setFormData(prev => ({
        ...prev,
        portfolioProjects: {
          ...prev.portfolioProjects,
          [projectName]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {application ? 'Edit Application' : 'Add New Application'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., London, Remote, Hybrid"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    name="salaryRange"
                    placeholder="e.g., £70-85k"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Post URL
                  </label>
                  <input
                    type="url"
                    name="jobUrl"
                    placeholder="https://..."
                    value={formData.jobUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Role Details Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Responsibilities
                  </label>
                  <textarea
                    name="keyResponsibilities"
                    rows="3"
                    placeholder="List key responsibilities from the job posting..."
                    value={formData.keyResponsibilities}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills
                  </label>
                  <textarea
                    name="requiredSkills"
                    rows="3"
                    placeholder="List required skills and qualifications..."
                    value={formData.requiredSkills}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why I'm a Good Fit
                  </label>
                  <textarea
                    name="whyGoodFit"
                    rows="3"
                    placeholder="Why you're a good fit for this role..."
                    value={formData.whyGoodFit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Application Details Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(STAGE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How Applied (Source)
                  </label>
                  <input
                    type="text"
                    name="source"
                    placeholder="e.g., LinkedIn, Company Website, Referral"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CV Version Used
                  </label>
                  <input
                    type="text"
                    name="cvVersion"
                    placeholder="e.g., Standard, Tech-focused"
                    value={formData.cvVersion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="coverLetter"
                    checked={formData.coverLetter}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Cover Letter Included
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="portfolioIncluded"
                    checked={formData.portfolioIncluded}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Portfolio Included
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hiring Manager
                  </label>
                  <input
                    type="text"
                    name="hiringManager"
                    placeholder="Name of hiring manager"
                    value={formData.hiringManager}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recruiter
                  </label>
                  <input
                    type="text"
                    name="recruiter"
                    placeholder="Recruiter name"
                    value={formData.recruiter}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recruiter Contact
                  </label>
                  <input
                    type="text"
                    name="recruiterContact"
                    placeholder="Email or LinkedIn URL"
                    value={formData.recruiterContact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Contact/Referral
                  </label>
                  <input
                    type="text"
                    name="internalContact"
                    placeholder="Internal contact name"
                    value={formData.internalContact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recruiter Screen
                  </label>
                  <input
                    type="date"
                    name="recruiterScreen"
                    value={formData.recruiterScreen}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Screen
                  </label>
                  <input
                    type="date"
                    name="phoneScreen"
                    value={formData.phoneScreen}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1st Interview
                  </label>
                  <input
                    type="date"
                    name="firstInterview"
                    value={formData.firstInterview}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2nd Interview
                  </label>
                  <input
                    type="date"
                    name="secondInterview"
                    value={formData.secondInterview}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Final Interview
                  </label>
                  <input
                    type="date"
                    name="finalInterview"
                    value={formData.finalInterview}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Interview Prep Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Preparation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Questions to Ask Them
                  </label>
                  <textarea
                    name="questionsToAsk"
                    rows="4"
                    placeholder="Questions you want to ask them..."
                    value={formData.questionsToAsk}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technical Topics to Review
                  </label>
                  <textarea
                    name="technicalTopics"
                    rows="3"
                    placeholder="Technical topics or skills to prepare..."
                    value={formData.technicalTopics}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Projects to Showcase
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="portfolio_gtmGenerator"
                        checked={formData.portfolioProjects.gtmGenerator}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">GTM Strategy Generator</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="portfolio_leadScoring"
                        checked={formData.portfolioProjects.leadScoring}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Lead Scoring Calculator</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="portfolio_abTest"
                        checked={formData.portfolioProjects.abTest}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">A/B Test Analyzer</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="portfolio_customerJourney"
                        checked={formData.portfolioProjects.customerJourney}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Customer Journey Map</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Job Description Section */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Job Description</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    name="jobDescription"
                    rows="6"
                    placeholder="Paste the full job description here..."
                    value={formData.jobDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Questions They Asked
                  </label>
                  <textarea
                    name="questionsAsked"
                    rows="4"
                    placeholder="Track questions they asked during interviews..."
                    value={formData.questionsAsked}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notes & Updates Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes & Updates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Thoughts
                  </label>
                  <textarea
                    name="initialThoughts"
                    rows="3"
                    placeholder="Your initial impressions of this opportunity..."
                    value={formData.initialThoughts}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Actions
                  </label>
                  <textarea
                    name="followUpActions"
                    rows="3"
                    placeholder="Actions needed, deadlines, or reminders..."
                    value={formData.followUpActions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="4"
                    placeholder="Any other notes or observations..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {application ? 'Update Application' : 'Add Application'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Detail View Modal Component
function DetailModal({ application, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">{application.company}</h2>
              <p className="text-lg text-gray-600 mt-1">{application.role}</p>
              <div className="flex gap-3 mt-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStageBadgeColor(application.stage)}`}>
                  {STAGE_LABELS[application.stage]}
                </span>
                {application.location && (
                  <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                    📍 {application.location}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
            >
              ×
            </button>
          </div>

          {/* Content Grid */}
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.appliedDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Applied Date</h3>
                  <p className="text-gray-900">{new Date(application.appliedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
              )}

              {application.source && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Source</h3>
                  <p className="text-gray-900">{application.source}</p>
                </div>
              )}

              {application.salaryRange && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Salary Range</h3>
                  <p className="text-gray-900">{application.salaryRange}</p>
                </div>
              )}

              {application.cvVersion && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">CV Version</h3>
                  <p className="text-gray-900">{application.cvVersion}</p>
                </div>
              )}

              {(application.coverLetter || application.portfolioIncluded) && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Included</h3>
                  <div className="flex gap-3">
                    {application.coverLetter && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Cover Letter ✓</span>
                    )}
                    {application.portfolioIncluded && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Portfolio ✓</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {application.jobUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Job URL</h3>
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  {application.jobUrl}
                </a>
              </div>
            )}

            {/* Role Details */}
            {(application.keyResponsibilities || application.requiredSkills || application.whyGoodFit) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Role Details</h3>
                <div className="space-y-3">
                  {application.keyResponsibilities && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Key Responsibilities</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.keyResponsibilities}</p>
                    </div>
                  )}
                  {application.requiredSkills && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Required Skills</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.requiredSkills}</p>
                    </div>
                  )}
                  {application.whyGoodFit && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Why Good Fit</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.whyGoodFit}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(application.hiringManager || application.recruiter || application.recruiterContact || application.internalContact) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.hiringManager && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Hiring Manager</h4>
                      <p className="text-gray-900">{application.hiringManager}</p>
                    </div>
                  )}
                  {application.recruiter && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Recruiter</h4>
                      <p className="text-gray-900">{application.recruiter}</p>
                    </div>
                  )}
                  {application.recruiterContact && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Recruiter Contact</h4>
                      <p className="text-gray-900">{application.recruiterContact}</p>
                    </div>
                  )}
                  {application.internalContact && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Internal Contact</h4>
                      <p className="text-gray-900">{application.internalContact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interview Timeline */}
            {(application.recruiterScreen || application.phoneScreen || application.firstInterview || application.secondInterview || application.finalInterview) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.recruiterScreen && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Recruiter Screen</h4>
                      <p className="text-gray-900">{new Date(application.recruiterScreen).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                  {application.phoneScreen && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Phone Screen</h4>
                      <p className="text-gray-900">{new Date(application.phoneScreen).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                  {application.firstInterview && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">First Interview</h4>
                      <p className="text-gray-900">{new Date(application.firstInterview).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                  {application.secondInterview && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Second Interview</h4>
                      <p className="text-gray-900">{new Date(application.secondInterview).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                  {application.finalInterview && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Final Interview</h4>
                      <p className="text-gray-900">{new Date(application.finalInterview).toLocaleDateString('en-GB')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interview Preparation */}
            {(application.questionsToAsk || application.technicalTopics || (application.portfolioProjects && Object.values(application.portfolioProjects).some(v => v))) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Preparation</h3>
                <div className="space-y-3">
                  {application.questionsToAsk && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Questions to Ask Them</h4>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{application.questionsToAsk}</p>
                      </div>
                    </div>
                  )}
                  {application.technicalTopics && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Technical Topics to Review</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.technicalTopics}</p>
                    </div>
                  )}
                  {application.portfolioProjects && Object.values(application.portfolioProjects).some(v => v) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Portfolio Projects to Showcase</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.portfolioProjects.gtmGenerator && (
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">GTM Strategy Generator</span>
                        )}
                        {application.portfolioProjects.leadScoring && (
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">Lead Scoring Calculator</span>
                        )}
                        {application.portfolioProjects.abTest && (
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">A/B Test Analyzer</span>
                        )}
                        {application.portfolioProjects.customerJourney && (
                          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">Customer Journey Map</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Description */}
            {application.jobDescription && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap">{application.jobDescription}</p>
                </div>
              </div>
            )}

            {/* Questions They Asked */}
            {application.questionsAsked && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Interview Questions They Asked</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{application.questionsAsked}</p>
                </div>
              </div>
            )}

            {/* Notes & Updates */}
            {(application.initialThoughts || application.followUpActions || application.notes) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes & Updates</h3>
                <div className="space-y-3">
                  {application.initialThoughts && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Initial Thoughts</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.initialThoughts}</p>
                    </div>
                  )}
                  {application.followUpActions && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Follow-up Actions</h4>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-gray-900 whitespace-pre-wrap">{application.followUpActions}</p>
                      </div>
                    </div>
                  )}
                  {application.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Additional Notes</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(application.createdAt).toLocaleString('en-GB')}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(application.updatedAt).toLocaleString('en-GB')}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Application
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getStageBadgeColor(stage) {
  const colors = {
    [STAGES.WISHLIST]: 'bg-gray-100 text-gray-800',
    [STAGES.APPLIED]: 'bg-blue-100 text-blue-800',
    [STAGES.SCREENING]: 'bg-yellow-100 text-yellow-800',
    [STAGES.INTERVIEWING]: 'bg-purple-100 text-purple-800',
    [STAGES.OFFER]: 'bg-green-100 text-green-800',
    [STAGES.REJECTED]: 'bg-red-100 text-red-800'
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
}

export default App;
