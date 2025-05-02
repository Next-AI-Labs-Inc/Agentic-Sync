import React from 'react';
import { BusinessCase, TasksConfig } from '../types';
interface TaskProps {
    /**
     * Task data
     */
    task: any;
    /**
     * Business case
     */
    businessCase?: BusinessCase;
    /**
     * Custom configuration
     */
    customConfig?: TasksConfig;
    /**
     * Click handler
     */
    onClick?: () => void;
}
/**
 * TaskCard Component
 *
 * Displays a task with business-case specific rendering.
 */
export declare const TaskCard: React.FC<TaskProps>;
export default TaskCard;
