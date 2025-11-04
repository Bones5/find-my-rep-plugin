/**
 * Type definitions for the Find My Rep plugin
 */

// WordPress localized script data
export interface FindMyRepData {
	ajaxUrl: string;
	nonce: string;
	letterTemplate: string;
}

// Representative data structure
export interface Representative {
	name: string;
	email: string;
	title?: string;
	type?: string;
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
