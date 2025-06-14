import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ResourceList from './components/ResourceList';
import ResourceForm from './components/ResourceForm';
import { ThemeProvider } from './contexts/ThemeContext';
import { ResourceProvider } from './contexts/ResourceContext';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [editingResource, setEditingResource] = useState(null);

  const handleCreateNew = () => {
    setEditingResource(null);
    setCurrentView('form');
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setCurrentView('form');
  };

  const handleFormClose = () => {
    setEditingResource(null);
    setCurrentView('list');
  };

  return (
    <ThemeProvider>
      <ResourceProvider>
        <div className="min-h-screen bg-primary">
          <Header 
            onCreateNew={handleCreateNew}
            currentView={currentView}
          />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentView === 'list' ? (
              <ResourceList onEdit={handleEdit} />
            ) : (
              <ResourceForm 
                resource={editingResource}
                onClose={handleFormClose}
              />
            )}
          </main>
        </div>
      </ResourceProvider>
    </ThemeProvider>
  );
}

export default App;