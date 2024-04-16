/// <reference types="react-scripts" />

interface InvestorResponse {
  name: string;
  count: number;
}

interface DropDownType {
  key: string;
  text: string;
  value: string;
}

interface BarType {
  name: string;
  value: string;
}

interface Organization {
  uuid: string;
  company_name: string;
  homepage_url: string;
  country_code: string;
  city: string;
  short_description: string;
  description: string;
  funding_rounds: string;
  funding_total_usd: string;
  employee_count: string;
}

interface Funding {
  company_uuid: string;
  investment_type: string;
  raised_amount_usd: string;
  company_name: string;
  announced_on: string;
  ratio: number;
}
