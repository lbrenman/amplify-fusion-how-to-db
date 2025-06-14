import React, { createContext, useContext, useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import toast from 'react-hot-toast';

const ResourceContext = createContext();

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type_id: '',
    internal: '',
    obsolete: '',
    tags: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // Fetch resources with current filters
  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceAPI.getAll(filters);
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  // Fetch types
  const fetchTypes = async () => {
    try {
      const data = await resourceAPI.getTypes();
      setTypes(data);
    } catch (error) {
      console.error('Error fetching types:', error);
      toast.error('Failed to fetch types');
    }
  };

  // Create resource
  const createResource = async (resourceData) => {
    try {
      const newResource = await resourceAPI.create(resourceData);
      await fetchResources(); // Refresh list
      toast.success('Resource created successfully');
      return newResource;
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
      throw error;
    }
  };

  // Update resource
  const updateResource = async (id, resourceData) => {
    try {
      const updatedResource = await resourceAPI.update(id, resourceData);
      await fetchResources(); // Refresh list
      toast.success('Resource updated successfully');
      return updatedResource;
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
      throw error;
    }
  };

  // Delete resource
  const deleteResource = async (id) => {
    try {
      await resourceAPI.delete(id);
      await fetchResources(); // Refresh list
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      throw error;
    }
  };

  // Create type
  const createType = async (name) => {
    try {
      const newType = await resourceAPI.createType(name);
      await fetchTypes(); // Refresh types
      toast.success('Type created successfully');
      return newType;
    } catch (error) {
      console.error('Error creating type:', error);
      if (error.response?.status === 409) {
        toast.error('Type already exists');
      } else {
        toast.error('Failed to create type');
      }
      throw error;
    }
  };

  // Delete type
  const deleteType = async (id) => {
    try {
      await resourceAPI.deleteType(id);
      await fetchTypes(); // Refresh types
      toast.success('Type deleted successfully');
    } catch (error) {
      console.error('Error deleting type:', error);
      toast.error('Failed to delete type');
      throw error;
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      await resourceAPI.exportCSV();
      toast.success('Resources exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export resources');
    }
  };

  // Import from CSV
  const importFromCSV = async (file) => {
    try {
      const result = await resourceAPI.importCSV(file);
      await fetchResources(); // Refresh list
      toast.success(`Successfully imported ${result.imported} resources`);
      if (result.errors > 0) {
        toast.error(`${result.errors} rows had errors`);
      }
      return result;
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Failed to import resources');
      throw error;
    }
  };

  // Update filters and fetch resources
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      type_id: '',
      internal: '',
      obsolete: '',
      tags: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  };

  // Get unique tags from all resources
  const getAllTags = () => {
    const allTags = resources
      .map(resource => resource.tags)
      .filter(tags => tags)
      .flatMap(tags => tags.split(',').map(tag => tag.trim()))
      .filter(tag => tag.length > 0);
    
    return [...new Set(allTags)].sort();
  };

  // Initial data fetch
  useEffect(() => {
    fetchTypes();
  }, []);

  // Fetch resources when filters change
  useEffect(() => {
    fetchResources();
  }, [filters]);

  const value = {
    resources,
    types,
    loading,
    filters,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    createType,
    deleteType,
    exportToCSV,
    importFromCSV,
    updateFilters,
    resetFilters,
    getAllTags
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};