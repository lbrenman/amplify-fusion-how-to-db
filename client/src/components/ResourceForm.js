import React, { useState, useEffect } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { format } from 'date-fns';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ResourceForm = ({ resource, onClose }) => {
  const { types, createResource, updateResource, createType, deleteType } = useResources();
  const [loading, setLoading] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    type_id: '',
    internal: false,
    date_created: format(new Date(), 'yyyy-MM-dd'),
    tags: '',
    obsolete: false
  });

  // Populate form if editing
  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        description: resource.description || '',
        url: resource.url || '',
        type_id: resource.type_id || '',
        internal: resource.internal || false,
        date_created: resource.date_created 
          ? format(new Date(resource.date_created), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd'),
        tags: resource.tags || '',
        obsolete: resource.obsolete || false
      });
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        date_created: new Date(formData.date_created).toISOString(),
        type_id: formData.type_id || null
      };

      if (resource) {
        await updateResource(resource.id, dataToSubmit);
      } else {
        await createResource(dataToSubmit);
      }
      
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim()) {
      toast.error('Type name is required');
      return;
    }

    try {
      const newType = await createType(newTypeName.trim());
      setFormData(prev => ({ ...prev, type_id: newType.id }));
      setNewTypeName('');
      toast.success('Type created and selected');
    } catch (error) {
      // Error handled in context
    }
  };

  const handleDeleteType = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this type? Resources using this type will have their type set to none.')) {
      try {
        await deleteType(typeId);
        if (formData.type_id === typeId) {
          setFormData(prev => ({ ...prev, type_id: '' }));
        }
      } catch (error) {
        // Error handled in context
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {resource ? 'Edit Resource' : 'Create New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary p-2"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body space-y-6">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label required">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter resource name"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Enter resource description"
                rows="3"
              />
            </div>

            {/* URL */}
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com"
              />
            </div>

            {/* Type */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="type_id" className="form-label">
                  Type
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeManager(!showTypeManager)}
                  className="btn btn-secondary btn-sm"
                >
                  Manage Types
                </button>
              </div>
              
              <select
                id="type_id"
                name="type_id"
                value={formData.type_id}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Select a type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              {/* Type Manager */}
              {showTypeManager && (
                <div className="mt-4 p-4 border border-primary rounded-lg bg-secondary">
                  <h4 className="font-medium mb-3">Manage Types</h4>
                  
                  {/* Add new type */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="New type name"
                      className="form-input flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                    <button
                      type="button"
                      onClick={handleCreateType}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Existing types */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {types.map(type => (
                      <div key={type.id} className="flex items-center justify-between p-2 bg-primary rounded border">
                        <span className="text-sm">{type.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteType(type.id)}
                          className="btn btn-danger btn-sm p-1"
                          title="Delete type"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Created */}
            <div className="form-group">
              <label htmlFor="date_created" className="form-label">
                Date Created
              </label>
              <input
                type="date"
                id="date_created"
                name="date_created"
                value={formData.date_created}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-input"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-secondary mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="internal"
                  name="internal"
                  checked={formData.internal}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <label htmlFor="internal" className="form-label mb-0">
                  Internal (Private)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="obsolete"
                  name="obsolete"
                  checked={formData.obsolete}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <label htmlFor="obsolete" className="form-label mb-0">
                  Obsolete
                </label>
              </div>
            </div>
          </div>

          <div className="card-footer flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading && <div className="spinner" />}
              {resource ? 'Update' : 'Create'} Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceForm;