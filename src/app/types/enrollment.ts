export interface IEnrollmentData {
  ort: string,
  enrollmentScores: any,  // Haven't figured out how to properly type this shit.
}

export interface IEnrollmentScoresMinMax {
  kindergarten: {
    total: {
      min: number;
      max: number;
    },
    diff: {
      min: number;
      max: number;
    }
  };
  primar: {
    total: {
      min: number;
      max: number;
    },
    diff: {
      min: number;
      max: number;
    }
  };
  sekundar: {
    total: {
      min: number;
      max: number;
    },
    diff: {
      min: number;
      max: number;
    }
  };
}