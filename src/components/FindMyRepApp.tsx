/**
 * Main application component for the Find My Rep plugin.
 * Note: Uses alert() for error messages to maintain consistency with original implementation.
 * Future enhancement: Replace with inline error messages or toast notifications.
 */
import React, { useState } from "react";
import { useSessionStorage } from "../hooks/useSessionStorage";
import type {
  SelectableRepresentative,
  WPAjaxResponse,
  ErrorData,
  SuccessData,
  RepresentativesApiResponse,
  AreaInfo,
} from "../types";
import { apiResponseToSelectableReps } from "../types";
import { PostcodeStep } from "./PostcodeStep";
import { SelectStep } from "./SelectStep";
import { LetterStep } from "./LetterStep";
import { SuccessStep } from "./SuccessStep";
import { LoadingSpinner } from "./LoadingSpinner";

type Step = "postcode" | "select" | "letter";

interface FindMyRepAppProps {
  blockId: string;
  storageKey: string;
  perBlockTemplate: string;
}

export const FindMyRepApp: React.FC<FindMyRepAppProps> = ({
  blockId,
  storageKey,
  perBlockTemplate,
}) => {
  const [currentStep, setCurrentStep, clearStep] = useSessionStorage<Step>(
    `${storageKey}-step`,
    "postcode",
  );
  const [representatives, setRepresentatives, clearReps] = useSessionStorage<
    SelectableRepresentative[]
  >(`${storageKey}-reps`, []);
  const [selectedReps, setSelectedReps, clearSelected] = useSessionStorage<
    SelectableRepresentative[]
  >(`${storageKey}-selected`, []);
  const [postcode, setPostcode, clearPostcode] = useSessionStorage<string>(
    `${storageKey}-postcode`,
    "",
  );
  const [areaInfo, setAreaInfo, clearAreaInfo] =
    useSessionStorage<AreaInfo | null>(`${storageKey}-area`, null);
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
    clearReps();
    clearSelected();
    clearPostcode();
    clearAreaInfo();
    // Also clear LetterStep-owned keys
    try {
      sessionStorage.removeItem(`${storageKey}-name`);
      sessionStorage.removeItem(`${storageKey}-email`);
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
          postcode,
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
          setRepresentatives(reps);
          setPostcode(apiData.postcode || "");
          setAreaInfo(apiData.areaInfo || null);
          setCurrentStep("select");
        } else {
          const errorData = data.data as ErrorData;
          setError(errorData?.message || "Failed to fetch representatives.");
        }
      } else {
        const errorData = data.data as ErrorData;
        setError(errorData?.message || "Failed to fetch representatives.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (reps: SelectableRepresentative[]) => {
    setSelectedReps(reps);
    setCurrentStep("letter");
  };

  const handleBackToPostcode = () => {
    setCurrentStep("postcode");
    setError("");
  };

  const handleBackToSelect = () => {
    setCurrentStep("select");
  };

  const handleSend = async (
    senderName: string,
    senderEmail: string,
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
          sender_name: senderName,
          sender_email: senderEmail,
          letter_content: letterContent,
          postcode,
          website_url: honeypot,
          representatives: JSON.stringify(selectedReps),
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
            "\n\nSome letters could not be delivered:\n" +
            successData.errors.join("\n");
        }
        // Capture before clearing so SuccessStep can show recipients
        const sentReps = [...selectedReps];
        clearAllProgress();
        setSuccessInfo({ message, reps: sentReps, senderEmail });
      } else {
        const errorData = data.data as ErrorData;
        // eslint-disable-next-line no-alert
        alert(errorData?.message || "Failed to send letters.");
      }
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert("An error occurred. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="find-my-rep-container" id={blockId}>
      {successInfo ? (
        <SuccessStep
          message={successInfo.message}
          reps={successInfo.reps}
          senderEmail={successInfo.senderEmail}
          onStartOver={() => setSuccessInfo(null)}
        />
      ) : (
        <>
          {currentStep === "postcode" && (
            <PostcodeStep
              onFindReps={handleFindReps}
              error={error}
              loading={loading}
            />
          )}
          {currentStep === "select" && (
            <SelectStep
              representatives={representatives}
              areaInfo={areaInfo}
              initialSelectedReps={selectedReps}
              onContinue={handleContinue}
              onBack={handleBackToPostcode}
            />
          )}
          {currentStep === "letter" && (
            <LetterStep
              blockId={blockId}
              storageKey={storageKey}
              selectedReps={selectedReps}
              letterTemplate={effectiveTemplate}
              onSend={handleSend}
              onBack={handleBackToSelect}
              loading={loading}
            />
          )}
        </>
      )}
      <LoadingSpinner visible={loading} />
    </div>
  );
};
