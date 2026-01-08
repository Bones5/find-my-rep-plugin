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

/**
 * SVG icons for each representative type
 */
function RepresentativeIcon({
  type
}) {
  switch (type) {
    case 'MP':
      // UK Parliament portcullis icon
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
        className: "rep-icon",
        viewBox: "0 0 100 100",
        fill: "currentColor",
        "aria-hidden": "true"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M50 2c-1.5 0-3 2-3 4v6c0 1 .5 2 1.5 2.5L44 18l-4-6c-.5-.8-1.5-1-2.3-.5l-3 2c-.8.5-1 1.5-.5 2.3l4 6-5.2 2.2c-1 .4-1.5 1.5-1.5 2.5v3h36v-3c0-1-.5-2.1-1.5-2.5L61 21.8l4-6c.5-.8.3-1.8-.5-2.3l-3-2c-.8-.5-1.8-.3-2.3.5l-4 6-4.5-3.5c1-.5 1.5-1.5 1.5-2.5V6c0-2-1.5-4-3-4z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "50",
        cy: "8",
        r: "3"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "38",
        cy: "16",
        r: "2.5"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "62",
        cy: "16",
        r: "2.5"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "22",
        y: "32",
        width: "56",
        height: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "22",
        y: "44",
        width: "56",
        height: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "22",
        y: "56",
        width: "56",
        height: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "22",
        y: "68",
        width: "56",
        height: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "26",
        y: "32",
        width: "4",
        height: "48"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "38",
        y: "32",
        width: "4",
        height: "48"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "48",
        y: "32",
        width: "4",
        height: "48"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "58",
        y: "32",
        width: "4",
        height: "48"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
        x: "70",
        y: "32",
        width: "4",
        height: "48"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polygon", {
        points: "26,80 28,80 30,92 28,92"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polygon", {
        points: "38,80 40,80 42,92 40,92"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polygon", {
        points: "48,80 50,80 52,92 50,92"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polygon", {
        points: "58,80 60,80 62,92 60,92"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("polygon", {
        points: "70,80 72,80 74,92 72,92"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "36",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "36",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "46",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "46",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "56",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "56",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "66",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "66",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "76",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "76",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "86",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "18",
        cy: "86",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "36",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "36",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "46",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "46",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "56",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "56",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "66",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "66",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "76",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "76",
        r: "2",
        fill: "white"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "86",
        r: "4"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("circle", {
        cx: "82",
        cy: "86",
        r: "2",
        fill: "white"
      }));
    case 'MS':
      // Welsh dragon icon (Senedd)
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
        className: "rep-icon",
        viewBox: "0 0 115 115",
        fill: "currentColor",
        "aria-hidden": "true"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M14.344,28.454c0,0.187 1.592,2.471 2.166,3.08c0.902,0.984 1.522,1.276 3.126,1.499c0.726,0.105 1.44,0.246 1.592,0.328c0.246,0.129 0.164,0.176 -1.054,0.632c-0.726,0.269 -1.663,0.562 -2.084,0.667c-0.96,0.222 -2.564,0.222 -3.923,0c-0.574,-0.094 -1.464,-0.176 -1.955,-0.176c-0.913,0 -2.084,0.187 -2.084,0.328c0,0.047 0.211,0.199 0.457,0.34c0.597,0.351 1.85,1.51 2.061,1.92c0.152,0.293 0.141,0.351 -0.176,0.796c-0.199,0.258 -0.574,0.621 -0.843,0.796c-0.539,0.363 -0.796,0.375 -3.197,0.211c-1.03,-0.07 -1.253,-0.047 -1.815,0.164c-0.925,0.351 -1.054,0.457 -0.773,0.632c1.393,0.89 2.377,1.604 2.564,1.862c0.234,0.304 0.234,0.304 -0.035,0.667c-0.574,0.808 -1.955,1.159 -3.7,0.937c-1.581,-0.199 -3.103,-0.094 -3.969,0.258c-0.386,0.164 -0.703,0.375 -0.703,0.457c0,0.105 0.656,0.457 1.639,0.878c0.902,0.398 1.991,0.937 2.412,1.206c0.925,0.585 1.873,1.557 2.236,2.295c0.141,0.293 0.293,0.539 0.328,0.539c0.035,0 0.246,-0.492 0.468,-1.089c0.527,-1.429 1.698,-3.747 2.553,-5.058c1.417,-2.178 2.787,-3.63 4.754,-5.082c1.674,-1.229 1.838,-1.288 0.796,-0.316c-3.115,2.951 -5.374,6.979 -6.054,10.784c-0.246,1.358 -0.246,4.122 -0.012,5.445c0.492,2.752 1.733,5.187 3.571,7.037c1.522,1.522 3.372,2.576 5.351,3.044c1.628,0.386 4.239,0.316 5.41,-0.152c0.293,-0.105 0.222,-0.141 -0.679,-0.328c-3.314,-0.691 -5.691,-2.857 -6.557,-5.995c-0.48,-1.78 -0.503,-4.332 -0.047,-6.089c0.902,-3.524 3.864,-6.37 8.044,-7.763c4.098,-1.358 8.712,-1.276 12.611,0.222c1.054,0.41 3.759,1.768 4.707,2.365c0.246,0.152 0.492,0.281 0.55,0.281c0.059,0 0.023,-0.269 -0.07,-0.597c-0.281,-0.96 -0.164,-2.471 0.246,-3.314c0.386,-0.796 0.386,-0.796 -0.738,-1.03c-0.785,-0.152 -2.073,-0.176 -5.761,-0.082l-2.049,0.047l-0.691,-0.351c-0.562,-0.281 -0.738,-0.457 -0.972,-0.913c-0.281,-0.55 -0.293,-0.562 -0.082,-1.089c0.222,-0.585 0.808,-1.054 1.522,-1.218c0.574,-0.129 1.557,0.094 3.29,0.749c1.827,0.679 2.33,0.796 3.618,0.808c1.768,0.012 2.553,-0.492 2.763,-1.791c0.059,-0.41 0.222,-0.89 0.351,-1.077c0.48,-0.656 1.909,-1.147 3.372,-1.147c0.527,0 0.831,-0.047 0.761,-0.105c-0.152,-0.152 -2.541,-0.902 -4.016,-1.276c-1.101,-0.269 -1.464,-0.304 -3.29,-0.304l-2.049,-0.012l-2.166,0.562c-2.19,0.562 -3.407,0.703 -4.309,0.503c-0.515,-0.117 -0.691,-0.457 -0.386,-0.761c0.351,-0.351 1.323,-0.515 3.29,-0.55l1.815,-0.035l0.094,-0.386c0.258,-0.96 -0.34,-1.721 -1.522,-1.967c-1.253,-0.269 -3.606,-0.023 -6.639,0.703c-2.787,0.667 -3.478,0.609 -5.515,-0.468c-1.475,-0.785 -2.19,-0.995 -3.981,-1.171c-1.768,-0.164 -2.307,-0.304 -3.454,-0.855c-0.55,-0.269 -1.03,-0.503 -1.077,-0.527c-0.059,-0.023 -0.094,-0.012 -0.094,0.035Z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M83.837,31.627c-0.187,0.023 -0.855,0.105 -1.464,0.176c-5.726,0.644 -12.552,2.998 -19.027,6.545c-6.592,3.606 -12.716,8.138 -19.788,14.636c-7.037,6.463 -12.037,10.093 -16.615,12.06c-2.822,1.218 -5.304,1.628 -7.072,1.183c-0.34,-0.082 -0.644,-0.129 -0.679,-0.094c-0.105,0.105 0.866,1.007 1.592,1.475c1.581,1.019 3.501,1.487 5.679,1.382c4.426,-0.222 9.332,-2.517 15.269,-7.154c1.546,-1.206 3.501,-2.904 6.1,-5.328c9.391,-8.747 17.739,-14.847 26.053,-19.039c5.866,-2.951 11.03,-4.567 15.948,-4.976c1.475,-0.129 3.735,-0.023 4.286,0.187c0.105,0.035 0.199,0.023 0.199,-0.047c0,-0.117 -1.838,-0.597 -3.279,-0.855c-0.738,-0.129 -6.475,-0.246 -7.201,-0.152Z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M90.98,37.411c-8.583,0.761 -17.33,4.157 -26.697,10.363c-4.859,3.22 -8.712,6.311 -14.344,11.475c-5.222,4.801 -9.192,7.857 -13.138,10.117c-4.005,2.295 -7.693,3.267 -10.046,2.658c-0.351,-0.094 -0.667,-0.141 -0.703,-0.105c-0.035,0.035 0.269,0.363 0.679,0.738c0.831,0.773 1.92,1.382 3.185,1.78c0.796,0.246 1.089,0.269 3.044,0.258c2.049,0 2.236,-0.023 3.548,-0.375c5.14,-1.382 10.538,-4.871 17.353,-11.206c4.168,-3.876 6.885,-6.241 10.128,-8.84c11.826,-9.438 22.903,-14.953 32.024,-15.936c1.218,-0.129 4.075,-0.082 4.918,0.07c0.703,0.141 0.012,-0.152 -0.937,-0.398c-2.26,-0.562 -6.3,-0.831 -9.016,-0.597Z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M53.991,38.301c-1.206,0.48 -3.606,1.112 -5.269,1.393c-1.838,0.304 -4.297,0.422 -6.592,0.293c-1.136,-0.059 -2.084,-0.094 -2.108,-0.07c-0.059,0.059 0.422,0.176 3.887,0.948c1.616,0.363 2.986,0.667 3.056,0.691c0.094,0.035 0.094,0.258 0.012,0.761c-0.059,0.398 -0.094,0.749 -0.059,0.773c0.059,0.059 7.986,-4.859 8.232,-5.105c0.176,-0.176 -0.059,-0.117 -1.159,0.316Z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M97.537,43.336c-0.187,0.023 -0.855,0.105 -1.464,0.176c-1.51,0.164 -4.321,0.726 -6.089,1.218c-3.642,1.007 -6.674,2.19 -10.538,4.122c-7.588,3.782 -14.355,8.641 -22.54,16.194c-6.803,6.276 -12.224,10.14 -16.756,11.932c-2.482,0.984 -4.426,1.311 -6.077,1.019c-0.574,-0.094 -1.077,-0.152 -1.112,-0.105c-0.129,0.141 1.358,1.335 2.236,1.791c1.464,0.761 2.435,0.972 4.496,0.972c2.002,0 2.834,-0.141 5.058,-0.878c3.185,-1.054 6.885,-3.197 10.749,-6.241c1.862,-1.464 3.208,-2.646 6.03,-5.269c2.658,-2.471 3.923,-3.606 5.972,-5.339c13.512,-11.452 25.947,-17.915 36.064,-18.735c1.569,-0.129 3.794,-0.023 4.391,0.199c0.141,0.059 0.187,0.047 0.141,-0.035c-0.094,-0.152 -1.534,-0.55 -2.951,-0.808c-0.773,-0.141 -1.885,-0.199 -4.157,-0.222c-1.71,-0.023 -3.255,-0.012 -3.454,0.012Z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M104.914,49.19c-4.204,0.422 -7.447,1.124 -11.264,2.447c-5.374,1.838 -10.468,4.449 -16.194,8.302c-4.438,2.974 -8.606,6.335 -13.817,11.147c-10.245,9.449 -18.255,13.875 -23.055,12.751c-0.41,-0.105 -0.773,-0.152 -0.808,-0.129c-0.105,0.105 1.147,1.218 1.827,1.639c0.375,0.222 1.183,0.574 1.791,0.785c1.44,0.48 3.513,0.597 5.386,0.293c2.541,-0.422 6.042,-1.862 8.911,-3.665c3.407,-2.154 6.124,-4.321 10.515,-8.407c12.295,-11.463 23.02,-18.641 33.254,-22.271c1.756,-0.632 4.965,-1.464 6.733,-1.745c1.37,-0.222 5.035,-0.304 6.264,-0.129c1.663,0.222 -0.843,-0.503 -2.787,-0.808c-1.089,-0.176 -5.702,-0.316 -6.756,-0.211Z"
      }));
    case 'PCC':
      // Police badge/shield icon
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
        className: "rep-icon",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": "true"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.47-3.07 8.64-7 9.82-3.93-1.18-7-5.35-7-9.82V6.3l7-3.12zM12 7l-3 3h2v4h2v-4h2l-3-3z"
      }));
    case 'Councillor':
      // Local government/town hall icon
      return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
        className: "rep-icon",
        viewBox: "0 0 24 24",
        fill: "currentColor",
        "aria-hidden": "true"
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M12 3L4 9v12h16V9l-8-6zm6 16h-3v-5h-6v5H6v-9.5l6-4.5 6 4.5V19z"
      }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
        d: "M10 14h4v5h-4z"
      }));
    default:
      return null;
  }
}

/**
 * Get CSS class for representative type color
 */
function getTypeColorClass(type) {
  switch (type) {
    case 'MP':
      return 'rep-type-mp';
    case 'MS':
      return 'rep-type-ms';
    case 'PCC':
      return 'rep-type-pcc';
    case 'Councillor':
      return 'rep-type-councillor';
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
  }, areaInfo.localAuthority.name), areaInfo.ward && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "area-badge"
  }, areaInfo.ward.name), areaInfo.constituency && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "area-badge"
  }, areaInfo.constituency.name), representatives.find(r => r.type === 'PCC')?.area && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "area-badge"
  }, representatives.find(r => r.type === 'PCC')?.area)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "representatives-list"
  }, representatives.map((rep, index) => {
    const key = `${rep.type}-${rep.id}`;
    const typeLabel = getRepresentativeTypeLabel(rep.type);
    const context = getRepresentativeContext(rep);
    const colorClass = getTypeColorClass(rep.type);
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      key: key,
      className: `representative-item ${colorClass}`
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
      type: "checkbox",
      id: `rep-${index}`,
      checked: selectedIds.has(index),
      onChange: () => handleCheckboxChange(index)
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
      htmlFor: `rep-${index}`
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-header"
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(RepresentativeIcon, {
      type: rep.type
    }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "rep-type-title"
    }, typeLabel)), context && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
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