import React from 'react';
import { BusinessCase, TasksConfig } from '../types';
interface VerificationStepsProps {
    /**
     * Task data (containing verificationSteps array)
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
     * Whether steps are editable
     */
    editable?: boolean;
    /**
     * Change handler
     */
    onChange?: (steps: any[]) => void;
}
/**
 * VerificationSteps Component
 *
 * Displays and optionally edits verification steps with business-case specific rendering.
 * This component demonstrates fixing the infinite reload issue that occurs in the tasks app.
 */
export declare const VerificationSteps: React.FC<VerificationStepsProps>;
export default VerificationSteps;
