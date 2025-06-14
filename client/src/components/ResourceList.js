import React, { useState } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { format } from 'date-fns';
import {
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ResourceList = ({ onEdit }) => {
  const {
    resources,
    types,
    loading,
    filters,
    updateFilters,
    resetFilters,
    deleteResource,
    getAllTags
  } = useResources();

  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteResource(id);
      setDeleteConfirm(null);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleSort = (field) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    updateFilters({ sortBy: field, sortOrder: newOrder });
  };

  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return null;
    return filters.sortOrder === 'ASC' ? '↑' : '↓';
  };

  const getTypeBadgeColor = (typeName) => {
    const colors = {
      video: 'badge-primary',
      blog: 'badge-success',
      article: 'badge-warning',
      podcast: 'badge-danger',
      tool: 'badge-primary',
      course: 'badge-success',
      documentation: 'badge-warning',
      tutorial: 'badge-danger'
    };
    return colors[typeName?.toLowerCase()] || 'badge-primary';
  };

  const allTags = getAllTags();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
        <span className="ml-2 text-secondary">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                placeholder="Search resources..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="form-input pl-10"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {Object.values(filters).some(v => v && v !== 'created_at' && v !== 'DESC') && (
                <span className="badge badge-danger ml-1">•</span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={filters.type_id}
                    onChange={(e) => updateFilters({ type_id: e.target.value })}
                    className="form-select"
                  >
                    <option value="">All types</option>
                    {types.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Internal Filter */}
                <div>
                  <label className="form-label">Visibility</label>
                  <select
                    value={filters.internal}
                    onChange={(e) => updateFilters({ internal: e.target.value })}
                    className="form-select"
                  >
                    <option value="">All</option>
                    <option value="false">Public</option>
                    <option value="true">Internal</option>
                  </select>
                </div>

                {/* Obsolete Filter */}
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.obsolete}
                    onChange={(e) => updateFilters({ obsolete: e.target.value })}
                    className="form-select"
                  >
                    <option value="">All</option>
                    <option value="false">Active</option>
                    <option value="true">Obsolete</option>
                  </select>
                </div>

                {/* Tags Filter */}
                <div>
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    placeholder="Filter by tags..."
                    value={filters.tags}
                    onChange={(e) => updateFilters({ tags: e.target.value })}
                    className="form-input"
                    list="tags-list"
                  />
                  <datalist id="tags-list">
                    {allTags.map(tag => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={resetFilters}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear Filters
                </button>
                <span className="text-sm text-secondary">
                  {resources.length} resource{resources.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resources Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:bg-tertiary"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </th>
                <th>Description</th>
                <th 
                  className="cursor-pointer hover:bg-tertiary"
                  onClick={() => handleSort('type_name')}
                >
                  Type {getSortIcon('type_name')}
                </th>
                <th>Tags</th>
                <th>Status</th>
                <th 
                  className="cursor-pointer hover:bg-tertiary"
                  onClick={() => handleSort('date_created')}
                >
                  Created {getSortIcon('date_created')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-secondary">
                    No resources found. Create your first resource to get started!
                  </td>
                </tr>
              ) : (
                resources.map(resource => (
                  <tr key={resource.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{resource.name}</span>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-600"
                            title="Open URL"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs truncate" title={resource.description}>
                        {resource.description || '-'}
                      </div>
                    </td>
                    <td>
                      {resource.type_name && (
                        <span className={`badge ${getTypeBadgeColor(resource.type_name)}`}>
                          {resource.type_name}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {resource.tags
                          ? resource.tags.split(',').map((tag, index) => (
                              <span
                                key={index}
                                className="badge badge-primary text-xs"
                              >
                                {tag.trim()}
                              </span>
                            ))
                          : '-'
                        }
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {resource.internal && (
                          <span className="badge badge-warning text-xs">Internal</span>
                        )}
                        {resource.obsolete && (
                          <span className="badge badge-danger text-xs">Obsolete</span>
                        )}
                        {!resource.internal && !resource.obsolete && (
                          <span className="badge badge-success text-xs">Public</span>
                        )}
                      </div>
                    </td>
                    <td className="text-sm text-secondary">
                      {format(new Date(resource.date_created), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(resource)}
                          className="btn btn-secondary btn-sm p-2"
                          title="Edit resource"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(resource.id)}
                          className="btn btn-danger btn-sm p-2"
                          title="Delete resource"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <div className="card-body">
              <p className="text-secondary">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
            </div>
            <div className="card-footer flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList;