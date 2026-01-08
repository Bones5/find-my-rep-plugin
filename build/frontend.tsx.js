/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/react-dom/client.js":
/*!******************************************!*\
  !*** ./node_modules/react-dom/client.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var m = __webpack_require__(/*! react-dom */ "react-dom");
if (false) // removed by dead control flow
{} else {
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  exports.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  exports.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}


/***/ }),

/***/ "./src/components/FindMyRepApp.tsx":
/*!*****************************************!*\
  !*** ./src/components/FindMyRepApp.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FindMyRepApp: () => (/* binding */ FindMyRepApp)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types */ "./src/types.ts");
/* harmony import */ var _PostcodeStep__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PostcodeStep */ "./src/components/PostcodeStep.tsx");
/* harmony import */ var _SelectStep__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./SelectStep */ "./src/components/SelectStep.tsx");
/* harmony import */ var _LetterStep__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./LetterStep */ "./src/components/LetterStep.tsx");
/* harmony import */ var _LoadingSpinner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./LoadingSpinner */ "./src/components/LoadingSpinner.tsx");

/**
 * Main application component for the Find My Rep plugin.
 * Note: Uses alert() for error messages to maintain consistency with original implementation.
 * Future enhancement: Replace with inline error messages or toast notifications.
 */






const FindMyRepApp = ({
  blockId,
  perBlockTemplate
}) => {
  const [currentStep, setCurrentStep] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('postcode');
  const [representatives, setRepresentatives] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [selectedReps, setSelectedReps] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [areaInfo, setAreaInfo] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [success, setSuccess] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    ajaxUrl,
    nonce,
    letterTemplate
  } = window.findMyRepData;

  // Use per-block template if available, otherwise use global template
  const effectiveTemplate = perBlockTemplate || letterTemplate;
  const handleFindReps = async postcode => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'find_my_rep_get_representatives',
          nonce,
          postcode
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (typeof data !== 'object' || data === null || typeof data.success !== 'boolean') {
        throw new Error('Invalid response format');
      }
      if (data.success) {
        // Check if this is the API response format (has postcode field)
        if (typeof data.data === 'object' && data.data !== null && 'postcode' in data.data) {
          const apiData = data.data;
          const reps = (0,_types__WEBPACK_IMPORTED_MODULE_1__.apiResponseToSelectableReps)(apiData);
          setRepresentatives(reps);
          setAreaInfo(apiData.areaInfo || null);
          setCurrentStep('select');
        } else {
          const errorData = data.data;
          setError(errorData?.message || 'Failed to fetch representatives.');
        }
      } else {
        const errorData = data.data;
        setError(errorData?.message || 'Failed to fetch representatives.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleContinue = reps => {
    setSelectedReps(reps);
    setCurrentStep('letter');
  };
  const handleSend = async (senderName, senderEmail, letterContent) => {
    setLoading(true);
    try {
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          action: 'find_my_rep_send_letter',
          nonce,
          sender_name: senderName,
          sender_email: senderEmail,
          letter_content: letterContent,
          representatives: JSON.stringify(selectedReps)
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (typeof data !== 'object' || data === null || typeof data.success !== 'boolean') {
        throw new Error('Invalid response format');
      }
      if (data.success) {
        const successData = data.data;
        let message = successData.message;
        if (successData.errors && successData.errors.length > 0) {
          message += '\n\nErrors:\n' + successData.errors.join('\n');
        }
        setSuccess(message);
      } else {
        const errorData = data.data;
        // eslint-disable-next-line no-alert
        alert(errorData?.message || 'Failed to send letters.');
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('An error occurred. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "find-my-rep-container",
    id: blockId
  }, currentStep === 'postcode' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_PostcodeStep__WEBPACK_IMPORTED_MODULE_2__.PostcodeStep, {
    onFindReps: handleFindReps,
    error: error,
    loading: loading
  }), currentStep === 'select' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_SelectStep__WEBPACK_IMPORTED_MODULE_3__.SelectStep, {
    representatives: representatives,
    areaInfo: areaInfo,
    onContinue: handleContinue
  }), currentStep === 'letter' && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_LetterStep__WEBPACK_IMPORTED_MODULE_4__.LetterStep, {
    selectedReps: selectedReps,
    letterTemplate: effectiveTemplate,
    onSend: handleSend,
    loading: loading,
    success: success
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_LoadingSpinner__WEBPACK_IMPORTED_MODULE_5__.LoadingSpinner, {
    visible: loading
  }));
};

/***/ }),

/***/ "./src/components/LetterStep.tsx":
/*!***************************************!*\
  !*** ./src/components/LetterStep.tsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LetterStep: () => (/* binding */ LetterStep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const LetterStep = ({
  letterTemplate,
  onSend,
  loading,
  success
}) => {
  const [senderName, setSenderName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [senderEmail, setSenderEmail] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [letterContent, setLetterContent] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(letterTemplate);
  const isValidEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleSend = () => {
    if (!senderName.trim() || !senderEmail.trim() || !letterContent.trim()) {
      // eslint-disable-next-line no-alert
      alert('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(senderEmail)) {
      // eslint-disable-next-line no-alert
      alert('Please enter a valid email address.');
      return;
    }
    onSend(senderName, senderEmail, letterContent);
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "find-my-rep-step step-letter"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Review and Edit Your Letter"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "letter-fields"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    htmlFor: "sender-name"
  }, "Your Name:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    id: "sender-name",
    className: "sender-name",
    value: senderName,
    onChange: e => setSenderName(e.target.value),
    required: true,
    disabled: loading || !!success
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    htmlFor: "sender-email"
  }, "Your Email:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "email",
    id: "sender-email",
    className: "sender-email",
    value: senderEmail,
    onChange: e => setSenderEmail(e.target.value),
    required: true,
    disabled: loading || !!success
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("textarea", {
    className: "letter-content",
    rows: 15,
    value: letterContent,
    onChange: e => setLetterContent(e.target.value),
    disabled: loading || !!success
  }), !success && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "button button-primary send-btn send-button",
    onClick: handleSend,
    disabled: loading
  }, loading ? 'Sending...' : 'Send'), success && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "success-message",
    style: {
      display: 'block'
    }
  }, success));
};

/***/ }),

/***/ "./src/components/LoadingSpinner.tsx":
/*!*******************************************!*\
  !*** ./src/components/LoadingSpinner.tsx ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LoadingSpinner: () => (/* binding */ LoadingSpinner)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const LoadingSpinner = ({
  visible
}) => {
  if (!visible) {
    return null;
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "loading-spinner",
    style: {
      display: 'block'
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "spinner is-active"
  }));
};

/***/ }),

/***/ "./src/components/PostcodeStep.tsx":
/*!*****************************************!*\
  !*** ./src/components/PostcodeStep.tsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PostcodeStep: () => (/* binding */ PostcodeStep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const PostcodeStep = ({
  onFindReps,
  error,
  loading
}) => {
  const [postcode, setPostcode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const handleSubmit = () => {
    const trimmedPostcode = postcode.trim();
    if (!trimmedPostcode) {
      return;
    }
    onFindReps(trimmedPostcode);
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "find-my-rep-step step-postcode"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Find Your Representatives"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    htmlFor: "postcode-input"
  }, "Enter your postcode:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    id: "postcode-input",
    className: "postcode-input",
    placeholder: "e.g. SW1A 1AA",
    value: postcode,
    onChange: e => setPostcode(e.target.value),
    onKeyPress: handleKeyPress,
    disabled: loading
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "button button-primary find-reps-btn",
    onClick: handleSubmit,
    disabled: loading
  }, "Find Representatives"), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "error-message",
    style: {
      display: 'block'
    }
  }, error));
};

/***/ }),

/***/ "./src/components/SelectStep.tsx":
/*!***************************************!*\
  !*** ./src/components/SelectStep.tsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SelectStep: () => (/* binding */ SelectStep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Get descriptive title for a representative type
 */
function getRepresentativeTypeLabel(type) {
  switch (type) {
    case 'MP':
      return 'Member of Parliament';
    case 'MS':
      return 'Member of the Senedd';
    case 'PCC':
      return 'Police and Crime Commissioner';
    case 'Councillor':
      return 'Local Councillor';
    default:
      return type;
  }
}

/**
 * Get contextual information for a representative (constituency, ward, etc.)
 */
function getRepresentativeContext(rep) {
  switch (rep.type) {
    case 'MP':
    case 'MS':
      return rep.constituency || '';
    case 'PCC':
      return rep.force || rep.area || '';
    case 'Councillor':
      return [rep.ward, rep.council].filter(Boolean).join(', ');
    default:
      return '';
  }
}
const SelectStep = ({
  representatives,
  areaInfo,
  onContinue
}) => {
  const [selectedIds, setSelectedIds] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(new Set());
  const handleCheckboxChange = index => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(index)) {
      newSelectedIds.delete(index);
    } else {
      newSelectedIds.add(index);
    }
    setSelectedIds(newSelectedIds);
  };
  const handleContinue = () => {
    if (selectedIds.size === 0) {
      // eslint-disable-next-line no-alert
      alert('Please select at least one representative.');
      return;
    }
    const selectedReps = representatives.filter((_, index) => selectedIds.has(index));
    onContinue(selectedReps);
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "find-my-rep-step step-select"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, "Select Representatives to Contact"), areaInfo && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "area-info-summary"
  }, areaInfo.localAuthority && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "area-badge"
  }, areaInfo.localAuthority.name), areaInfo.constituency && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "area-badge"
  }, areaInfo.constituency.name)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "representatives-list"
  }, representatives.map((rep, index) => {
    const key = `${rep.type}-${rep.id}`;
    const typeLabel = getRepresentativeTypeLabel(rep.type);
    const context = getRepresentativeContext(rep);
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      key: key,
      className: "representative-item"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
      type: "checkbox",
      id: `rep-${index}`,
      checked: selectedIds.has(index),
      onChange: () => handleCheckboxChange(index)
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
      htmlFor: `rep-${index}`
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-type-title"
    }, typeLabel), context && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-context"
    }, context), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-details"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("strong", null, rep.name), rep.party && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "rep-party"
    }, rep.party), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-contact-info"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "rep-email"
    }, rep.email), rep.phone && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "rep-phone"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      href: `tel:${rep.phone}`
    }, rep.phone)), rep.website && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
      className: "rep-website"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
      href: rep.website,
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Website"))))));
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "button button-primary continue-btn",
    onClick: handleContinue
  }, "Continue"));
};

/***/ }),

/***/ "./src/types.ts":
/*!**********************!*\
  !*** ./src/types.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   apiResponseToSelectableReps: () => (/* binding */ apiResponseToSelectableReps),
/* harmony export */   councillorToSelectable: () => (/* binding */ councillorToSelectable),
/* harmony export */   mpToSelectable: () => (/* binding */ mpToSelectable),
/* harmony export */   msToSelectable: () => (/* binding */ msToSelectable),
/* harmony export */   pccToSelectable: () => (/* binding */ pccToSelectable)
/* harmony export */ });
/**
 * Type definitions for the Find My Rep plugin
 *
 * Uses the external API format directly without transformation.
 */

// WordPress localized script data

// =============================================================================
// API Response Types (from find-my-rep-api)
// =============================================================================

// Main API response format

// =============================================================================
// Selectable Representative Types (for UI selection)
// =============================================================================

// Union type for any representative that can be selected

// Helper function type to convert API types to selectable format
function mpToSelectable(mp) {
  return {
    type: 'MP',
    id: mp.id,
    name: mp.name,
    email: mp.email,
    party: mp.party,
    constituency: mp.constituency,
    phone: mp.phone,
    website: mp.website
  };
}
function msToSelectable(ms) {
  return {
    type: 'MS',
    id: ms.id,
    name: ms.name,
    email: ms.email,
    party: ms.party,
    constituency: ms.constituency,
    phone: ms.phone,
    website: ms.website
  };
}
function pccToSelectable(pcc) {
  return {
    type: 'PCC',
    id: pcc.id,
    name: pcc.name,
    email: pcc.email,
    force: pcc.force,
    area: pcc.area,
    website: pcc.website
  };
}
function councillorToSelectable(councillor) {
  return {
    type: 'Councillor',
    id: councillor.id,
    name: councillor.name,
    email: councillor.email,
    party: councillor.party,
    ward: councillor.ward,
    council: councillor.council,
    phone: councillor.phone
  };
}

/**
 * Convert API response to array of selectable representatives
 */
function apiResponseToSelectableReps(data) {
  const reps = [];
  if (data.mp) {
    reps.push(mpToSelectable(data.mp));
  }
  if (data.ms) {
    reps.push(msToSelectable(data.ms));
  }
  if (data.pcc) {
    reps.push(pccToSelectable(data.pcc));
  }
  if (data.councillors) {
    for (const councillor of data.councillors) {
      reps.push(councillorToSelectable(councillor));
    }
  }
  return reps;
}

// =============================================================================
// WordPress AJAX Response Types
// =============================================================================

// =============================================================================
// Block Attributes
// =============================================================================

// Declare global WordPress data

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************!*\
  !*** ./src/frontend.tsx ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom/client */ "./node_modules/react-dom/client.js");
/* harmony import */ var _components_FindMyRepApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/FindMyRepApp */ "./src/components/FindMyRepApp.tsx");

/**
 * Frontend React app for Find My Rep plugin
 */




// Wait for DOM to be ready
const initializeApp = () => {
  const containers = document.querySelectorAll('.find-my-rep-container');
  containers.forEach(container => {
    const blockId = container.id;
    const perBlockTemplate = container.getAttribute('data-letter-template') || '';
    const root = (0,react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot)(container);
    root.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_FindMyRepApp__WEBPACK_IMPORTED_MODULE_2__.FindMyRepApp, {
      blockId: blockId,
      perBlockTemplate: perBlockTemplate
    }));
  });
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
})();

/******/ })()
;
//# sourceMappingURL=frontend.tsx.js.map