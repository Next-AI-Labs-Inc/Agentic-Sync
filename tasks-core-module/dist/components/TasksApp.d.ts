import React from 'react';
import { BusinessCase, TasksConfig } from '../types';
interface TasksAppProps {
    /**
     * Business case identifier
     * @default "tasks"
     */
    businessCase?: BusinessCase;
    /**
     * Configuration options
     */
    customConfig?: TasksConfig;
    /**
     * Optional class name
     */
    className?: string;
}
/**
 * TasksApp Component
 *
 * Core implementation of the Tasks app that can be customized for different
 * business cases using conditional rendering.
 */
export declare const TasksApp: React.FC<TasksAppProps>;
export default TasksApp;
