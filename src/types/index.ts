/**
 * Core TypeScript types and interfaces
 */

export type ContentType = 'lined' | 'dotted' | 'graph' | 'blank' | 'checkboxes';

export type PaperColor = 'white' | 'cream' | 'yellow';

export interface PageConfig {
  contentType: ContentType;
  paperColor?: PaperColor;
  lineHeight?: number; // in points
  lineColor?: string; // hex color
}

export interface InteriorConfig {
  title: string;
  pageCount: number;
  width: number; // inches
  height: number; // inches
  pages: PageConfig[];
  marginTop?: number; // in points
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

export interface CoverConfig {
  title: string;
  subtitle?: string;
  author?: string;
  description?: string;
  keywords?: string[];
  coverImagePath?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface KDPProjectConfig {
  interior: InteriorConfig;
  cover: CoverConfig;
  pageCount: number;
  width: number; // inches
  height: number; // inches
  outputDir: string;
}

export interface GeneratedAssets {
  interiorPdfPath: string;
  coverPdfPath: string;
  metadata?: Record<string, any>;
}

export interface Metadata {
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  author: string;
  niche: string;
}
