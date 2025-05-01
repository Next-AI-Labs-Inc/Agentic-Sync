import React, { useState } from 'react';
import { Project, ProjectFilterType } from '@/types';
import { PROJECT_FILTERS } from '@/config/constants';
import { ClickableId } from '@/utils/clickable-id';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjects: string[];
  onChange: (selectedProjects: string[]) => void;
  updateGlobalFilter: (filter: ProjectFilterType) => void;
}

/**
 * A collapsible project selector component
 * Shows selected projects in a single line when collapsed
 * Expands to show all projects with checkboxes when clicked
 */
export default function ProjectSelector({
  projects,
  selectedProjects,
  onChange,
  updateGlobalFilter
}: ProjectSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort projects alphabetically by name
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Handle individual project selection
  const handleProjectSelection = (projectId: string) => {
    const newSelectedProjects = selectedProjects.includes(projectId)
      ? selectedProjects.filter(id => id !== projectId)
      : [...selectedProjects, projectId];
    
    onChange(newSelectedProjects);
    
    // Update the global filter
    if (newSelectedProjects.length === 0) {
      updateGlobalFilter(PROJECT_FILTERS.NONE);
    } else if (newSelectedProjects.length === projects.length) {
      updateGlobalFilter(PROJECT_FILTERS.ALL);
    } else if (newSelectedProjects.length === 1) {
      updateGlobalFilter(newSelectedProjects[0]);
    } else {
      updateGlobalFilter(newSelectedProjects);
    }
  };
  
  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      // Deselect all
      onChange([]);
      updateGlobalFilter(PROJECT_FILTERS.NONE);
    } else {
      // Select all
      onChange(projects.map(p => p.id));
      updateGlobalFilter(PROJECT_FILTERS.ALL);
    }
  };
  
  const handleSelectNone = () => {
    onChange([]);
    updateGlobalFilter(PROJECT_FILTERS.NONE);
  };
  
  // Format selected projects for summary display
  const getSelectionSummary = () => {
    if (selectedProjects.length === 0) {
      return 'No projects selected';
    } else if (selectedProjects.length === projects.length) {
      return 'All projects';
    } else if (selectedProjects.length === 1) {
      const project = projects.find(p => p.id === selectedProjects[0]);
      return project ? project.name : 'Unknown project';
    } else {
      return `${selectedProjects.length} projects selected`;
    }
  };
  
  return (
    <div>
      <div>
        <div className="flex items-center mb-1">
          <label className="form-label mr-2">Projects</label>
          <ClickableId
            id="CO_9102"
            filePath="/src/components/ProjectSelector.tsx"
            className="self-center ml-2 px-3"
          />
        </div>
        
        {/* Collapsed view */}
        <div 
          className="border border-gray-300 rounded-md p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="text-sm text-gray-700">{getSelectionSummary()}</div>
          <div className="text-xs text-blue-600">{isExpanded ? 'Collapse' : 'Edit'}</div>
        </div>
      </div>
      
      {/* Expanded view */}
      {isExpanded && (
        <div className="border border-gray-300 border-t-0 rounded-b-md p-2 bg-gray-50">
          {/* Quick selection buttons */}
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-2 py-1 text-xs rounded ${
                selectedProjects.length === projects.length 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            
            <button
              type="button"
              onClick={handleSelectNone}
              className={`px-2 py-1 text-xs rounded ${
                selectedProjects.length === 0 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              None
            </button>
          </div>
          
          {/* Project checkboxes */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {sortedProjects.map((project, index) => (
              <div 
                key={project.id} 
                className={`flex items-center ${project._isNew ? 'animate-fade-in' : ''}`}
                style={project._isNew ? { animationDelay: `${index * 50}ms` } : {}}
              >
                <input
                  type="checkbox"
                  id={`project-${project.id}`}
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleProjectSelection(project.id)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`project-${project.id}`} className="text-sm text-gray-700">
                  {project.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}