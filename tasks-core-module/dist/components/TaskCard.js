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
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * TaskCard Component
 *
 * Displays a task with business-case specific rendering.
 */
export var TaskCard = function (_a) {
    var task = _a.task, _b = _a.businessCase, businessCase = _b === void 0 ? 'tasks' : _b, _c = _a.customConfig, customConfig = _c === void 0 ? {} : _c, onClick = _a.onClick;
    // Get terminology with defaults based on business case
    var getTerminology = function () {
        // Default terminology by business case
        var defaultTerminology = {
            tasks: {
                task: 'Task',
                requirements: 'Requirements',
            },
            support: {
                task: 'Ticket',
                requirements: 'Customer Needs',
            },
            recruitment: {
                task: 'Candidate',
                requirements: 'Qualifications',
            },
            project: {
                task: 'Task',
                requirements: 'Deliverables',
            }
        };
        // Merge default with custom terminology
        return __assign(__assign({}, defaultTerminology[businessCase]), customConfig.terminology);
    };
    var terminology = getTerminology();
    // Render support ticket view
    if (businessCase === 'support') {
        return (_jsxs("div", __assign({ className: "support-ticket-card", onClick: onClick }, { children: [_jsxs("div", __assign({ className: "ticket-header" }, { children: [_jsxs("h3", { children: [terminology.task, " #", task.id, ": ", task.title] }), _jsxs("span", __assign({ className: "ticket-priority" }, { children: ["Priority: ", task.priority || 'Medium'] }))] })), _jsxs("div", __assign({ className: "ticket-body" }, { children: [_jsx("p", { children: task.description }), task.requirements && task.requirements.length > 0 && (_jsxs("div", __assign({ className: "ticket-requirements" }, { children: [_jsxs("h4", { children: [terminology.requirements, ":"] }), _jsx("ul", { children: task.requirements.map(function (req, index) { return (_jsx("li", { children: req.text }, index)); }) })] })))] })), _jsxs("div", __assign({ className: "ticket-footer" }, { children: [_jsxs("span", { children: ["Status: ", task.status] }), _jsxs("span", { children: ["Created: ", task.createdAt] })] }))] })));
    }
    // Render recruitment candidate view
    if (businessCase === 'recruitment') {
        return (_jsxs("div", __assign({ className: "candidate-card", onClick: onClick }, { children: [_jsxs("div", __assign({ className: "candidate-header" }, { children: [_jsx("h3", { children: task.title }), _jsx("span", __assign({ className: "candidate-role" }, { children: task.role || 'Unspecified Role' }))] })), _jsxs("div", __assign({ className: "candidate-body" }, { children: [_jsx("p", { children: task.description }), task.requirements && task.requirements.length > 0 && (_jsxs("div", __assign({ className: "candidate-qualifications" }, { children: [_jsxs("h4", { children: [terminology.requirements, ":"] }), _jsx("ul", { children: task.requirements.map(function (req, index) { return (_jsx("li", { children: req.text }, index)); }) })] })))] })), _jsxs("div", __assign({ className: "candidate-footer" }, { children: [_jsxs("span", { children: ["Status: ", task.status] }), _jsxs("span", { children: ["Applied: ", task.createdAt] })] }))] })));
    }
    // Render project task view
    if (businessCase === 'project') {
        return (_jsxs("div", __assign({ className: "project-task-card", onClick: onClick }, { children: [_jsxs("div", __assign({ className: "project-task-header" }, { children: [_jsx("h3", { children: task.title }), _jsx("span", __assign({ className: "project-name" }, { children: task.project || 'No Project' }))] })), _jsxs("div", __assign({ className: "project-task-body" }, { children: [_jsx("p", { children: task.description }), task.requirements && task.requirements.length > 0 && (_jsxs("div", __assign({ className: "project-deliverables" }, { children: [_jsxs("h4", { children: [terminology.requirements, ":"] }), _jsx("ul", { children: task.requirements.map(function (req, index) { return (_jsx("li", { children: req.text }, index)); }) })] })))] })), _jsxs("div", __assign({ className: "project-task-footer" }, { children: [_jsxs("span", { children: ["Status: ", task.status] }), _jsxs("span", { children: ["Due: ", task.dueDate || 'No due date'] })] }))] })));
    }
    // Default task view
    return (_jsxs("div", __assign({ className: "task-card", onClick: onClick }, { children: [_jsxs("div", __assign({ className: "task-header" }, { children: [_jsx("h3", { children: task.title }), _jsxs("span", __assign({ className: "task-id" }, { children: ["#", task.id] }))] })), _jsxs("div", __assign({ className: "task-body" }, { children: [_jsx("p", { children: task.description }), task.requirements && task.requirements.length > 0 && (_jsxs("div", __assign({ className: "task-requirements" }, { children: [_jsxs("h4", { children: [terminology.requirements, ":"] }), _jsx("ul", { children: task.requirements.map(function (req, index) { return (_jsx("li", { children: req.text }, index)); }) })] })))] })), _jsxs("div", __assign({ className: "task-footer" }, { children: [_jsxs("span", { children: ["Status: ", task.status] }), _jsxs("span", { children: ["Created: ", task.createdAt] })] }))] })));
};
export default TaskCard;
