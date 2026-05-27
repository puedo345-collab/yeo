export interface SurveyResponses {
  occupation: string;
  debtAmount: string;
  monthlyIncome?: string;
  dependentsCount?: string;
  hasMoreDebtThanAssets: string;
  region: string;
  difficulties: string[];
  name: string;
  ageGroup: string;
  phone: string;
}

export interface SuccessStory {
  id: number;
  category: string;
  title: string;
  age: string;
  job: string;
  originalDebt: string;
  reducedDebt: string;
  monthlyPayment: string;
  reductionRate: number;
  description: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}
