/**
 * Main application component for the Find My Rep plugin.
 * Note: Uses alert() for error messages to maintain consistency with original implementation.
 * Future enhancement: Replace with inline error messages or toast notifications.
 */
import React, { useState } from "react";
import { __ } from "@wordpress/i18n";
import { useSessionStorage } from "../hooks/useSessionStorage";
import type {
  SelectableRepresentative,
  WPAjaxResponse,
  ErrorData,
  SuccessData,
  RepresentativesApiResponse,
  RepresentativeType,
} from "../types";
import { apiResponseToSelectableReps } from "../types";
import { PostcodeStep } from "./PostcodeStep";
import { QuestionStep } from "./QuestionStep";
import { LetterStep } from "./LetterStep";
import { SuccessStep } from "./SuccessStep";
import { LoadingSpinner } from "./LoadingSpinner";
import { RecipientSummary } from "./RecipientSummary";

type Step = "postcode" | "select" | "question" | "letter";

interface FindMyRepAppProps {
  blockId: string;
  storageKey: string;
  perBlockTemplate: string;
  includeQuestion?: boolean;
  questionText?: string;
  representativeTypes?: RepresentativeType[];
  representativeTypesSignature?: string;
}

export const FindMyRepApp: React.FC<FindMyRepAppProps> = ({
  blockId,
  storageKey,
  perBlockTemplate,
  includeQuestion = false,
  questionText = "",
  representativeTypes = ["MP", "MS", "PCC", "Councillor"],
  representativeTypesSignature = "",
}) => {
  const hasQuestion = includeQuestion && !!questionText.trim();
  const [currentStep, setCurrentStep, clearStep] = useSessionStorage<Step>(
    `${storageKey}-step`,
    "postcode",
  );
  const [selectedReps, setSelectedReps, clearSelected] = useSessionStorage<
    SelectableRepresentative[]
  >(`${storageKey}-selected`, []);
  const [postcode, setPostcode, clearPostcode] = useSessionStorage<string>(
    `${storageKey}-postcode`,
    "",
  );
  const [questionResponse, setQuestionResponse, clearQuestionResponse] =
    useSessionStorage<string>(`${storageKey}-question-response`, "");
  const [error, setError] = useState<string>("");
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    reps: SelectableRepresentative[];
    senderEmail: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  /** Remove all persisted progress for this block. Called after a successful send. */
  const clearAllProgress = () => {
    clearStep();
    clearSelected();
    clearPostcode();
    clearQuestionResponse();
    // Also clear LetterStep-owned keys
    try {
      sessionStorage.removeItem(`${storageKey}-name`);
      sessionStorage.removeItem(`${storageKey}-email`);
      sessionStorage.removeItem(`${storageKey}-address`);
      sessionStorage.removeItem(`${storageKey}-content`);
    } catch {
      // ignore
    }
  };

  const { ajaxUrl, nonce, letterTemplate } = window.findMyRepData;

  // Use per-block template if available, otherwise use global template
  const effectiveTemplate = perBlockTemplate || letterTemplate;

  const handleFindReps = async (postcode: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(ajaxUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "find_my_rep_get_representatives",
          nonce,
          block_id: blockId,
          postcode,
          representative_types: JSON.stringify(representativeTypes),
          representative_types_signature: representativeTypesSignature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WPAjaxResponse<RepresentativesApiResponse | ErrorData> =
        await response.json();

      if (
        typeof data !== "object" ||
        data === null ||
        typeof data.success !== "boolean"
      ) {
        throw new Error("Invalid response format");
      }

      if (data.success) {
        // Check if this is the API response format (has postcode field)
        if (
          typeof data.data === "object" &&
          data.data !== null &&
          "postcode" in data.data
        ) {
          const apiData = data.data as RepresentativesApiResponse;
          const reps = apiResponseToSelectableReps(apiData);
          setSelectedReps(reps);
          setPostcode(apiData.postcode || "");
          setCurrentStep(hasQuestion ? "question" : "letter");
        } else {
          const errorData = data.data as ErrorData;
          setError(
            errorData?.message ||
              __("Failed to fetch representatives.", "find-my-rep"),
          );
        }
      } else {
        const errorData = data.data as ErrorData;
        setError(
          errorData?.message ||
            __("Failed to fetch representatives.", "find-my-rep"),
        );
      }
    } catch (err) {
      setError(__("An error occurred. Please try again.", "find-my-rep"));
      // eslint-disable-next-line no-console
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPostcode = () => {
    setCurrentStep("postcode");
    setError("");
  };

  const handleBackFromLetter = () => {
    setCurrentStep(hasQuestion ? "question" : "postcode");
  };

  const handleSend = async (
    senderName: string,
    senderEmail: string,
    senderAddress: string,
    letterContent: string,
    honeypot: string,
  ) => {
    setLoading(true);

    try {
      const response = await fetch(ajaxUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "find_my_rep_send_letter",
          nonce,
          block_id: blockId,
          sender_name: senderName,
          sender_email: senderEmail,
          sender_address: senderAddress,
          letter_content: letterContent,
          postcode,
          question_response: questionResponse,
          website_url: honeypot,
          representative_types: JSON.stringify(representativeTypes),
          representative_types_signature: representativeTypesSignature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WPAjaxResponse<SuccessData | ErrorData> =
        await response.json();

      if (
        typeof data !== "object" ||
        data === null ||
        typeof data.success !== "boolean"
      ) {
        throw new Error("Invalid response format");
      }

      if (data.success) {
        const successData = data.data as SuccessData;
        let message = successData.message;
        if (successData.errors && successData.errors.length > 0) {
          message +=
            "\n\n" +
            __("Some letters could not be delivered:", "find-my-rep") +
            "\n" +
            successData.errors.join("\n");
        }
        // Capture before clearing so SuccessStep can show recipients
        const sentReps = [...selectedReps];
        clearAllProgress();
        setSuccessInfo({ message, reps: sentReps, senderEmail });
      } else {
        const errorData = data.data as ErrorData;
        // eslint-disable-next-line no-alert
        alert(
          errorData?.message || __("Failed to send letters.", "find-my-rep"),
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(__("An error occurred. Please try again.", "find-my-rep"));
      // eslint-disable-next-line no-console
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-my-rep-app">
      {successInfo ? (
        <SuccessStep
          message={successInfo.message}
          reps={successInfo.reps}
          senderEmail={successInfo.senderEmail}
          onStartOver={() => setSuccessInfo(null)}
        />
      ) : (
        <>
          {(currentStep === "postcode" || currentStep === "select") && (
            <PostcodeStep
              onFindReps={handleFindReps}
              error={error}
              loading={loading}
            />
          )}
          {(currentStep === "question" || currentStep === "letter") && (
            <RecipientSummary
              postcode={postcode}
              representatives={selectedReps}
            />
          )}
          {(currentStep === "letter" ||
            (currentStep === "question" && !hasQuestion)) && (
            <LetterStep
              blockId={blockId}
              storageKey={storageKey}
              selectedReps={selectedReps}
              letterTemplate={effectiveTemplate}
              questionResponse={questionResponse}
              onSend={handleSend}
              onBack={handleBackFromLetter}
              loading={loading}
            />
          )}
          {currentStep === "question" && hasQuestion && (
            <QuestionStep
              question={questionText}
              response={questionResponse}
              onChange={setQuestionResponse}
              onContinue={() => setCurrentStep("letter")}
              onBack={handleBackToPostcode}
            />
          )}
        </>
      )}
      <LoadingSpinner visible={loading} />
    </div>
  );
};
