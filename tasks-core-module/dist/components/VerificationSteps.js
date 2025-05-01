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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VerificationSteps Component
 *
 * Displays and optionally edits verification steps with business-case specific rendering.
 * This component demonstrates fixing the infinite reload issue that occurs in the tasks app.
 */
export var VerificationSteps = function (_a) {
    var task = _a.task, _b = _a.businessCase, businessCase = _b === void 0 ? 'tasks' : _b, _c = _a.customConfig, customConfig = _c === void 0 ? {} : _c, _d = _a.editable, editable = _d === void 0 ? false : _d, onChange = _a.onChange;
    // Get terminology based on business case
    var getTerminology = function () {
        // Default terminology by business case
        var defaultTerminology = {
            tasks: {
                verificationSteps: 'Verification Steps'
            },
            support: {
                verificationSteps: 'Resolution Steps'
            },
            recruitment: {
                verificationSteps: 'Interview Questions'
            },
            project: {
                verificationSteps: 'Acceptance Criteria'
            }
        };
        // Merge default with custom terminology
        return __assign(__assign({}, defaultTerminology[businessCase]), customConfig.terminology);
    };
    var terminology = getTerminology();
    // Get steps with reasonable defaults if missing
    var steps = task.verificationSteps || [];
    // FIX FOR INFINITE RELOAD: Use a stable state updater function
    var handleStepChange = function (index, value) {
        if (!editable || !onChange)
            return;
        // Create a new array to avoid reference issues that cause infinite reloads
        var newSteps = steps.map(function (step, i) {
            if (i === index) {
                return __assign(__assign({}, step), { text: value });
            }
            return step;
        });
        // Call onChange with the new array
        onChange(newSteps);
    };
    // Handle adding a new step
    var handleAddStep = function () {
        if (!editable || !onChange)
            return;
        // Create a new array with the added step
        var newSteps = __spreadArray(__spreadArray([], steps, true), [{ id: Date.now().toString(), text: '', completed: false }], false);
        onChange(newSteps);
    };
    // Handle removing a step
    var handleRemoveStep = function (index) {
        if (!editable || !onChange)
            return;
        // Filter out the step to remove
        var newSteps = steps.filter(function (_, i) { return i !== index; });
        onChange(newSteps);
    };
    // Apply different UIs based on business case
    if (businessCase === 'support') {
        return (_jsxs("div", __assign({ className: "resolution-steps" }, { children: [_jsx("h3", { children: terminology.verificationSteps }), steps.length === 0 ? (_jsx("p", { children: "No resolution steps defined yet." })) : (_jsx("ol", __assign({ className: "resolution-steps-list" }, { children: steps.map(function (step, index) { return (_jsx("li", __assign({ className: step.completed ? 'completed' : '' }, { children: editable ? (_jsxs("div", __assign({ className: "editable-step" }, { children: [_jsx("input", { type: "text", value: step.text || '', onChange: function (e) { return handleStepChange(index, e.target.value); }, placeholder: "Add resolution step" }), _jsx("button", __assign({ onClick: function () { return handleRemoveStep(index); } }, { children: "Remove" }))] }))) : (_jsx("span", { children: step.text })) }), step.id || index)); }) }))), editable && (_jsx("button", __assign({ onClick: handleAddStep }, { children: "Add Resolution Step" })))] })));
    }
    // Default verification steps UI
    return (_jsxs("div", __assign({ className: "verification-steps" }, { children: [_jsx("h3", { children: terminology.verificationSteps }), steps.length === 0 ? (_jsxs("p", { children: ["No ", terminology.verificationSteps.toLowerCase(), " defined yet."] })) : (_jsx("ol", __assign({ className: "steps-list" }, { children: steps.map(function (step, index) { return (_jsx("li", __assign({ className: step.completed ? 'completed' : '' }, { children: editable ? (_jsxs("div", __assign({ className: "editable-step" }, { children: [_jsx("input", { type: "text", value: step.text || '', onChange: function (e) { return handleStepChange(index, e.target.value); }, placeholder: "Add ".concat(terminology.verificationSteps.toLowerCase().slice(0, -1)) }), _jsx("button", __assign({ onClick: function () { return handleRemoveStep(index); } }, { children: "Remove" }))] }))) : (_jsx("span", { children: step.text })) }), step.id || index)); }) }))), editable && (_jsxs("button", __assign({ onClick: handleAddStep }, { children: ["Add ", terminology.verificationSteps.slice(0, -1)] })))] })));
};
export default VerificationSteps;
