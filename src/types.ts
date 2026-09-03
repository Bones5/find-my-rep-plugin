/**
 * Type definitions for the Find My Rep plugin
 *
 * Uses the external API format directly without transformation.
 */

// WordPress localized script data
export interface FindMyRepData {
  ajaxUrl: string;
  nonce: string;
  letterTemplate: string;
}

// =============================================================================
// API Response Types (from find-my-rep-api)
// =============================================================================

export interface Councillor {
  id: number;
  name: string;
  party: string;
  ward: string;
  council: string;
  email: string;
}

export interface PCC {
  id: number;
  name: string;
  party?: string;
  force: string;
  area: string;
  email: string;
}

export interface MP {
  id: number;
  name: string;
  party: string;
  constituency: string;
  email: string;
}

export interface MS {
  id: number;
  name: string;
  party: string;
  constituency: string;
  email: string;
}

export interface AreaInfoDetail {
  id: number;
  name: string;
  code: string;
  type?: string;
}

export interface AreaInfo {
  constituency?: AreaInfoDetail;
  localAuthority?: AreaInfoDetail;
  ward?: AreaInfoDetail;
  region?: AreaInfoDetail;
}

// Main API response format
export interface RepresentativesApiResponse {
  postcode: string;
  councillors?: Councillor[];
  pcc?: PCC | null;
  mp?: MP | null;
  mss?: MS[];
  areaInfo?: AreaInfo | null;
}

// =============================================================================
// Selectable Representative Types (for UI selection)
// =============================================================================

export type RepresentativeType = "MP" | "MS" | "PCC" | "Councillor";

// Union type for any representative that can be selected
export interface SelectableRepresentative {
  type: RepresentativeType;
  id: number;
  name: string;
  email: string;
  party?: string;
  // Context-specific fields
  constituency?: string; // MP, MS
  ward?: string; // Councillor
  council?: string; // Councillor
  force?: string; // PCC
  area?: string; // PCC
}

// Helper function type to convert API types to selectable format
export function mpToSelectable(mp: MP): SelectableRepresentative {
  return {
    type: "MP",
    id: mp.id,
    name: mp.name,
    email: mp.email,
    party: mp.party,
    constituency: mp.constituency,
  };
}

export function msToSelectable(ms: MS): SelectableRepresentative {
  return {
    type: "MS",
    id: ms.id,
    name: ms.name,
    email: ms.email,
    party: ms.party,
    constituency: ms.constituency,
  };
}

export function pccToSelectable(pcc: PCC): SelectableRepresentative {
  return {
    type: "PCC",
    id: pcc.id,
    name: pcc.name,
    email: pcc.email,
    party: pcc.party,
    force: pcc.force,
    area: pcc.area,
  };
}

export function councillorToSelectable(
  councillor: Councillor,
): SelectableRepresentative {
  return {
    type: "Councillor",
    id: councillor.id,
    name: councillor.name,
    email: councillor.email,
    party: councillor.party,
    ward: councillor.ward,
    council: councillor.council,
  };
}

/**
 * Convert API response to array of selectable representatives
 */
export function apiResponseToSelectableReps(
  data: RepresentativesApiResponse,
): SelectableRepresentative[] {
  const reps: SelectableRepresentative[] = [];

  if (data.mp) {
    reps.push(mpToSelectable(data.mp));
  }

  if (data.mss) {
    for (const ms of data.mss) {
      reps.push(msToSelectable(ms));
    }
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

export interface WPAjaxResponse<T> {
  success: boolean;
  data: T;
}

export interface ErrorData {
  message: string;
  errors?: string[];
}

export interface SuccessData {
  message: string;
  errors?: string[];
  partial?: boolean;
}

// =============================================================================
// Block Attributes
// =============================================================================

export interface BlockAttributes {
  blockId: string;
  letterTemplate?: string;
  includeQuestion?: boolean;
  questionText?: string;
}

// Declare global WordPress data
declare global {
  interface Window {
    findMyRepData: FindMyRepData;
  }
}
