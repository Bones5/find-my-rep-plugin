/**
 * Type definitions for the Find My Rep plugin
 */

// WordPress localized script data
export interface FindMyRepData {
	ajaxUrl: string;
	nonce: string;
	letterTemplate: string;
}

// Representative data structure (internal, normalized format)
export interface Representative {
	name: string;
	email: string;
	title?: string;
	type?: string;
}

// Geographic location data (legacy format, still used internally)
export interface GeographicInfo {
	area?: string;
	ward?: string;
	westminster_constituency?: string;
	devolved_constituency?: string;
}

// New API Response structures
export interface Councillor {
	id: number;
	name: string;
	party: string;
	ward: string;
	council: string;
	email: string;
	phone: string;
}

export interface PCC {
	id: number;
	name: string;
	force: string;
	area: string;
	email: string;
	website: string;
}

export interface MP {
	id: number;
	name: string;
	party: string;
	constituency: string;
	email: string;
	phone: string;
	website: string;
}

export interface MS {
	id: number;
	name: string;
	party: string;
	constituency: string;
	email: string;
	phone: string;
	website: string;
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

// API Response for representatives (new format from external API)
export interface ExternalApiResponse {
	postcode: string;
	councillors?: Councillor[];
	pcc?: PCC;
	mp?: MP;
	ms?: MS;
	areaInfo?: AreaInfo;
}

// API Response for representatives with geographic info (internal format)
export interface RepresentativesResponse {
	geographic_info?: GeographicInfo;
	representatives: Representative[];
}

// API Response structures
export interface WPAjaxResponse< T > {
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

// Block attributes
export interface BlockAttributes {
	blockId: string;
}

// Declare global WordPress data
declare global {
	interface Window {
		findMyRepData: FindMyRepData;
	}
}
