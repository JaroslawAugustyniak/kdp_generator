/**
 * KDP Math Utilities
 * Precise calculations for print-ready PDF dimensions
 */

export interface PageDimensions {
  width: number;
  height: number;
}

export interface CoverDimensions {
  width: number;
  height: number;
  bleedWidth: number;
  bleedHeight: number;
}

export interface InteriorDimensions {
  width: number;
  height: number;
  pageCount: number;
}

const BLEED_SIZE = 0.125; // inches
const SPINE_MULTIPLIER = 0.002252; // inches per page (for standard white paper)
const POINTS_PER_INCH = 72;

export class KDPMath {
  /**
   * Convert inches to points (used by PDF standards)
   */
  static inchesToPoints(inches: number): number {
    return inches * POINTS_PER_INCH;
  }

  /**
   * Convert points to inches
   */
  static pointsToInches(points: number): number {
    return points / POINTS_PER_INCH;
  }

  /**
   * Get interior page dimensions in points
   * Common trim sizes: 5x8, 5.5x8.5, 6x9, 7x10, 8x10, 8.5x11
   */
  static getInteriorDimensions(widthInches: number, heightInches: number): PageDimensions {
    return {
      width: this.inchesToPoints(widthInches),
      height: this.inchesToPoints(heightInches),
    };
  }

  /**
   * Calculate spine width based on page count and paper type
   * Formula: pageCount * 0.002252 inches (for standard white paper)
   */
  static calculateSpineWidth(pageCount: number): number {
    return pageCount * SPINE_MULTIPLIER;
  }

  /**
   * Calculate cover dimensions with bleed
   * Front + Spine + Back = Width
   * Height + 2*Bleed = Total Height
   */
  static getCoverDimensions(
    interiorWidthInches: number,
    interiorHeightInches: number,
    pageCount: number
  ): CoverDimensions {
    const spineWidth = this.calculateSpineWidth(pageCount);

    // Cover width = front + spine + back + 2*bleed
    const coverWidth = interiorWidthInches + spineWidth + interiorWidthInches + 2 * BLEED_SIZE;

    // Cover height = interior height + 2*bleed
    const coverHeight = interiorHeightInches + 2 * BLEED_SIZE;

    return {
      width: this.inchesToPoints(coverWidth),
      height: this.inchesToPoints(coverHeight),
      bleedWidth: this.inchesToPoints(BLEED_SIZE),
      bleedHeight: this.inchesToPoints(BLEED_SIZE),
    };
  }

  /**
   * Break down cover into regions for positioning
   * Returns pixel positions for front, spine, and back cover areas
   */
  static getCoverLayout(
    interiorWidthInches: number,
    interiorHeightInches: number,
    pageCount: number
  ) {
    const spineWidth = this.calculateSpineWidth(pageCount);
    const bleedPts = this.inchesToPoints(BLEED_SIZE);
    const frontWidthPts = this.inchesToPoints(interiorWidthInches);
    const spineWidthPts = this.inchesToPoints(spineWidth);
    const backWidthPts = this.inchesToPoints(interiorWidthInches);

    return {
      backCover: {
        x: bleedPts,
        y: bleedPts,
        width: backWidthPts,
        height: this.inchesToPoints(interiorHeightInches),
      },
      spine: {
        x: bleedPts + backWidthPts,
        y: bleedPts,
        width: spineWidthPts,
        height: this.inchesToPoints(interiorHeightInches),
      },
      frontCover: {
        x: bleedPts + backWidthPts + spineWidthPts,
        y: bleedPts,
        width: frontWidthPts,
        height: this.inchesToPoints(interiorHeightInches),
      },
    };
  }

  /**
   * Validate print specifications
   */
  static validatePrintSpecs(width: number, height: number, pageCount: number): string[] {
    const errors: string[] = [];

    if (width < 2.5 || width > 8.5) {
      errors.push(`Width ${width}" is outside KDP limits (2.5"-8.5")`);
    }

    if (height < 4 || height > 11) {
      errors.push(`Height ${height}" is outside KDP limits (4"-11")`);
    }

    if (pageCount < 24) {
      errors.push(`Page count ${pageCount} is below minimum (24 pages)`);
    }

    if (pageCount > 828) {
      errors.push(`Page count ${pageCount} exceeds maximum (828 pages)`);
    }

    return errors;
  }
}
