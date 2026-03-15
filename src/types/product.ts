export type ProductConfiguration = {
  type: 'HABITACIONAL' | 'HOME_EQUITY' | 'CONSTRUCASA' | 'FHE_POUPEX' | 'MAG_HABITACIONAL';
  names: string[];
  ageConfig: {
    minAge: number;
    maxAge: number;
    finalAgeLimit: {
      years: number;
      months: number;
      days: number;
    };
  };
  capitalConfig: {
    fixedLimit?: number | null;
    absoluteMax?: number | null;
    variableLimit?: {
      under60: number | null;
      over60: number | null;
      ageThreshold: number;
    } | null;
    mipLimit?: number | null;
    dfiLimit?: number | null;
  };
  examRules: {
    rules: Array<{
      triggerType: string;
      capitalThreshold?: number | null;
      ageThreshold?: number | null;
      examType: string;
      gender?: string | null;
      productTypes?: string[] | null;
      description?: string | null;
    }>;
  };
  dpsConfig?: {
    questions?: Array<{ code: string; description: string }>;
  };
};

export type Product = {
  uid: string;
  name: string;
  description: string | null;
  status: string;
  configuration: ProductConfiguration | null;
};

export type ProductListResponse = {
  success: boolean;
  message: string;
  data: Product[];
};

