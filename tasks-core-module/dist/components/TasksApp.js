var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
/**
 * TasksApp Component
 *
 * Core implementation of the Tasks app that can be customized for different
 * business cases using conditional rendering.
 */
export var TasksApp = function (_a) {
    var _b = _a.businessCase, businessCase = _b === void 0 ? 'tasks' : _b, _c = _a.customConfig, customConfig = _c === void 0 ? {} : _c, _d = _a.className, className = _d === void 0 ? '' : _d;
    // Set document title based on business case
    useEffect(function () {
        var titles = {
            tasks: 'Tasks',
            support: 'Support Desk',
            recruitment: 'Recruitment',
            project: 'Project Management'
        };
        if (typeof document !== 'undefined') {
            document.title = titles[businessCase] || 'Tasks';
        }
    }, [businessCase]);
    // Get terminology with defaults based on business case
    var getTerminology = function () {
        // Default terminology by business case
        var defaultTerminology = {
            tasks: {
                task: 'Task',
                tasks: 'Tasks',
                requirements: 'Requirements',
                verificationSteps: 'Verification Steps'
            },
            support: {
                task: 'Ticket',
                tasks: 'Tickets',
                requirements: 'Customer Needs',
                verificationSteps: 'Resolution Steps'
            },
            recruitment: {
                task: 'Candidate',
                tasks: 'Candidates',
                requirements: 'Qualifications',
                verificationSteps: 'Interview Questions'
            },
            project: {
                task: 'Task',
                tasks: 'Tasks',
                requirements: 'Deliverables',
                verificationSteps: 'Acceptance Criteria'
            }
        };
        // Merge default with custom terminology
        return __assign(__assign({}, defaultTerminology[businessCase]), customConfig.terminology);
    };
    var terminology = getTerminology();
    // Render specific business case UI
    if (businessCase === 'support') {
        return (_jsxs("div", __assign({ className: "support-desk-container ".concat(className) }, { children: [_jsx("h1", { children: "Support Desk" }), _jsx("p", { children: "This is the Support Desk implementation." }), _jsxs("p", { children: ["A ", terminology.task, " contains ", terminology.requirements, " and ", terminology.verificationSteps, "."] }), _jsx("pre", { children: JSON.stringify({ businessCase: businessCase, customConfig: customConfig }, null, 2) })] })));
    }
    if (businessCase === 'recruitment') {
        return (_jsxs("div", __assign({ className: "recruitment-container ".concat(className) }, { children: [_jsx("h1", { children: "Recruitment Pipeline" }), _jsx("p", { children: "This is the Recruitment implementation." }), _jsxs("p", { children: ["A ", terminology.task, " contains ", terminology.requirements, " and ", terminology.verificationSteps, "."] }), _jsx("pre", { children: JSON.stringify({ businessCase: businessCase, customConfig: customConfig }, null, 2) })] })));
    }
    if (businessCase === 'project') {
        return (_jsxs("div", __assign({ className: "project-container ".concat(className) }, { children: [_jsx("h1", { children: "Project Management" }), _jsx("p", { children: "This is the Project Management implementation." }), _jsxs("p", { children: ["A ", terminology.task, " contains ", terminology.requirements, " and ", terminology.verificationSteps, "."] }), _jsx("pre", { children: JSON.stringify({ businessCase: businessCase, customConfig: customConfig }, null, 2) })] })));
    }
    // Default Tasks implementation
    return (_jsxs("div", __assign({ className: "tasks-container ".concat(className) }, { children: [_jsx("h1", { children: "Tasks" }), _jsx("p", { children: "This is the standard Tasks implementation." }), _jsxs("p", { children: ["A ", terminology.task, " contains ", terminology.requirements, " and ", terminology.verificationSteps, "."] }), _jsx("pre", { children: JSON.stringify({ businessCase: businessCase, customConfig: customConfig }, null, 2) })] })));
};
export default TasksApp;
