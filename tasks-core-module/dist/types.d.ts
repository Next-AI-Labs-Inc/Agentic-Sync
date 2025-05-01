/**
 * Simple configuration types for Tasks Core
 */
/**
 * Terminology configuration
 */
export interface TerminologyConfig {
    task?: string;
    tasks?: string;
    requirements?: string;
    verificationSteps?: string;
    technicalPlan?: string;
    projects?: string;
    initiative?: string;
    status?: string;
}
/**
 * API configuration
 */
export interface ApiConfig {
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    timeout?: number;
}
/**
 * Tasks configuration object
 */
export interface TasksConfig {
    terminology?: TerminologyConfig;
    api?: ApiConfig;
    onTaskCreate?: (task: any) => void;
    onTaskUpdate?: (task: any) => void;
    onTaskDelete?: (id: string) => void;
}
/**
 * Business case types
 */
export type BusinessCase = 'tasks' | 'support' | 'recruitment' | 'project';
