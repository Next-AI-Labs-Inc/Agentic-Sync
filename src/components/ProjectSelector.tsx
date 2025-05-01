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
    // Get valid project IDs
    const validProjectIds = projects.map(p => p.id);
    
    // Build new selected projects list
    const newSelectedProjects = selectedProjects.includes(projectId)
      ? selectedProjects.filter(id => id !== projectId)
      : [...selectedProjects, projectId];
    
    // Filter to only valid projects
    const validSelectedProjects = newSelectedProjects.filter(id => validProjectIds.includes(id));
    
    onChange(validSelectedProjects);
    
    // Update the global filter
    if (validSelectedProjects.length === 0) {
      updateGlobalFilter(PROJECT_FILTERS.NONE);
    } else if (validSelectedProjects.length === projects.length) {
      updateGlobalFilter(PROJECT_FILTERS.ALL);
    } else if (validSelectedProjects.length === 1) {
      updateGlobalFilter(validSelectedProjects[0]);
    } else {
      updateGlobalFilter(validSelectedProjects);
    }
  };
  
  // Handle select all/none
  const handleSelectAll = () => {
    // Get a list of valid project IDs
    const validProjectIds = projects.map(p => p.id);
    
    // Filter selected projects to only include valid ones
    const validSelectedProjects = selectedProjects.filter(id => validProjectIds.includes(id));
    
    if (validSelectedProjects.length === projects.length) {
      // Deselect all
      onChange([]);
      updateGlobalFilter(PROJECT_FILTERS.NONE);
    } else {
      // Select all
      onChange(validProjectIds);
      updateGlobalFilter(PROJECT_FILTERS.ALL);
    }
  };
  
  const handleSelectNone = () => {
    onChange([]);
    updateGlobalFilter(PROJECT_FILTERS.NONE);
  };
  
  // Format selected projects for summary display
  const getSelectionSummary = () => {
    // Get a list of valid project IDs from the current projects list
    const validProjectIds = projects.map(p => p.id);
    
    // Filter selected projects to only include valid ones
    const validSelectedProjects = selectedProjects.filter(id => validProjectIds.includes(id));
    
    if (validSelectedProjects.length === 0) {
      return 'No projects selected';
    } else if (validSelectedProjects.length === projects.length) {
      return 'All projects';
    } else if (validSelectedProjects.length === 1) {
      const project = projects.find(p => p.id === validSelectedProjects[0]);
      return project ? project.name : 'Unknown project';
    } else {
      return `${validSelectedProjects.length} projects selected`;
    }
  };
  
  return (
    <div>
      <div>
        <div className="flex items-center mb-1">
          <label className="form-label mr-2 text-lg font-medium">Areas of Concern</label>
          <ClickableId
            id="CO_9102"
            filePath="/src/components/ProjectSelector.tsx"
            className="self-center ml-2 px-3"
          />
        </div>
        
        {/* Collapsed view */}
        <div 
          className="border border-gray-300 rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="text-base font-medium text-gray-700">{getSelectionSummary()}</div>
          <div className="text-sm text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">{isExpanded ? 'Collapse' : 'Edit'}</div>
        </div>
      </div>
      
      {/* Expanded view */}
      {isExpanded && (
        <div className="border border-gray-300 border-t-0 rounded-b-md p-4 bg-gray-50 shadow-inner">
          {/* Quick selection buttons */}
          <div className="flex flex-wrap gap-3 mb-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                selectedProjects.length === projects.length 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Select All
            </button>
            
            <button
              type="button"
              onClick={handleSelectNone}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                selectedProjects.length === 0 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Clear Selection
            </button>
          </div>
          
          {/* Project checkboxes */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-2 pb-1">
            {sortedProjects.map((project, index) => (
              <div 
                key={project.id} 
                className={`flex items-center p-2 hover:bg-white rounded-md transition-colors ${
                  selectedProjects.includes(project.id) ? 'bg-blue-50' : ''
                } ${project._isNew ? 'animate-fade-in' : ''}`}
                style={project._isNew ? { animationDelay: `${index * 50}ms` } : {}}
              >
                <input
                  type="checkbox"
                  id={`project-${project.id}`}
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => handleProjectSelection(project.id)}
                  className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label 
                  htmlFor={`project-${project.id}`} 
                  className="text-base text-gray-700 cursor-pointer font-medium flex-grow truncate"
                >
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