export type SocioeconomicClass = 
  | 'struggling'
  | 'working_class'
  | 'lower_middle'
  | 'middle'
  | 'upper_middle'
  | 'privileged';

export type EducationLevel = 
  | 'no_diploma'
  | 'ged'
  | 'high_school'
  | 'some_college'
  | 'associate'
  | 'trade_cert'
  | 'bachelor'
  | 'master'
  | 'doctorate';

export type HousingType = 
  | 'homeless'
  | 'with_family'
  | 'roommates'
  | 'cheap_apartment'
  | 'apartment'
  | 'nice_apartment'
  | 'rental_house'
  | 'owned_home'
  | 'nice_home'
  | 'luxury_home';

export type VehicleType = 
  | 'none'
  | 'public_transit'
  | 'beater'
  | 'used_economy'
  | 'used_midrange'
  | 'new_economy'
  | 'new_midrange'
  | 'luxury';

export type LifestyleTier = 
  | 'bare_bones'
  | 'frugal'
  | 'comfortable'
  | 'expensive'
  | 'luxury';

export type EconomicState = 
  | 'boom'
  | 'normal'
  | 'slowdown'
  | 'recession'
  | 'recovery';

export type RelationshipStatus = 
  | 'single'
  | 'dating'
  | 'serious'
  | 'engaged'
  | 'married'
  | 'divorced'
  | 'widowed';

export type CareerAction = 
  | 'work_hard'
  | 'normal'
  | 'coast'
  | 'network'
  | 'ask_raise'
  | 'apply_elsewhere'
  | 'overtime';

export interface DateInfo {
  year: number;
  month: number;
}

export interface PlayerStats {
  health: number;
  stress: number;
  happiness: number;
  energy: number;
}

export interface Skills {
  technical: number;
  communication: number;
  leadership: number;
  sales: number;
  financial: number;
  trade: number;
  entrepreneurship: number;
}

export interface Job {
  id: string;
  title: string;
  industry: string;
  isHourly: boolean;
  basePayMin: number;
  basePayMax: number;
  hoursPerWeek: number;
  requiredEducation: EducationLevel[];
  requiredExperience: number;
  stressLevel: number;
  advancementPotential: number;
  benefits: boolean;
  stability: number;
  skillRequirements: Partial<Skills>;
  skillGrowth: Partial<Skills>;
  careerPathId: string;
  tier: number;
}

export interface Employment {
  jobId: string;
  title: string;
  monthlyPay: number;
  hoursPerWeek: number;
  monthsEmployed: number;
  performance: number;
  lastRaise: DateInfo | null;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  purchasePrice: number;
  currentValue: number;
  monthlyInsurance: number;
  monthlyFuel: number;
  reliability: number;
  age: number;
  loanId: string | null;
}

export interface Loan {
  id: string;
  type: 'auto' | 'student' | 'personal' | 'mortgage' | 'business' | 'credit_card';
  principal: number;
  balance: number;
  apr: number;
  minimumPayment: number;
  monthlyPayment: number;
  termMonths: number;
  remainingMonths: number;
  assetId?: string;
}

export interface Property {
  id: string;
  type: 'primary' | 'rental';
  purchasePrice: number;
  currentValue: number;
  monthlyRent?: number;
  mortgageId: string | null;
  monthlyExpenses: number;
  vacancy: number;
}

export interface Investment {
  id: string;
  type: 'index_fund' | 'bonds' | 'high_yield_savings' | 'individual_stock' | 'retirement';
  name: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  isRetirement: boolean;
  employerMatch?: number;
}

export interface Partner {
  name: string;
  age: number;
  monthlyIncome: number;
  spendingTendency: number;
  compatibility: number;
  financialHabits: number;
}

export interface Child {
  name: string;
  age: number;
  monthlyExpenses: number;
}

export interface TimelineEntry {
  date: DateInfo;
  age: number;
  type: 'career' | 'education' | 'financial' | 'relationship' | 'milestone' | 'event' | 'business';
  title: string;
  description?: string;
  netWorthAtTime?: number;
}

export interface MajorDecision {
  date: DateInfo;
  type: 'vehicle' | 'housing' | 'education' | 'investment' | 'business';
  description: string;
  actualCost: number;
  alternativeCost?: number;
  alternativeDescription?: string;
}

export interface Business {
  id: string;
  type: string;
  name: string;
  monthsOperating: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  employees: number;
  reputation: number;
  customers: number;
  loanId: string | null;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedDate?: DateInfo;
}

export interface NewsItem {
  date: DateInfo;
  headline: string;
  description: string;
  economicImpact?: Partial<Record<EconomicState, number>>;
}

export interface Education {
  id: string;
  type: 'ged' | 'community_college' | 'trade_school' | 'university' | 'graduate' | 'certification';
  name: string;
  monthsRemaining: number;
  totalMonths: number;
  monthlyCost: number;
  isPartTime: boolean;
  targetLevel: EducationLevel;
}

export interface City {
  id: string;
  name: string;
  costTier: 'low' | 'average' | 'high' | 'very_high';
  rentMultiplier: number;
  wageMultiplier: number;
  homeValueMultiplier: number;
  taxRate: number;
}

export interface GameState {
  seed: number;
  currentSeed: number;
  name: string;
  hometown: string;
  cityId: string;
  
  date: DateInfo;
  age: number;
  birthYear: number;
  
  socioeconomicBackground: SocioeconomicClass;
  
  stats: PlayerStats;
  skills: Skills;
  
  cash: number;
  checking: number;
  savings: number;
  
  education: EducationLevel;
  currentEducation: Education | null;
  
  employment: Employment | null;
  careerAction: CareerAction;
  totalWorkExperience: number;
  industryExperience: Record<string, number>;
  
  housing: HousingType;
  monthlyRent: number;
  householdContribution: number;
  
  vehicle: Vehicle | null;
  
  loans: Loan[];
  
  creditScore: number;
  creditHistory: number;
  missedPayments: number;
  
  lifestyle: LifestyleTier;
  
  relationshipStatus: RelationshipStatus;
  partner: Partner | null;
  children: Child[];
  
  investments: Investment[];
  
  properties: Property[];
  
  businesses: Business[];
  
  economicState: EconomicState;
  economicCycleMonth: number;
  
  timeline: TimelineEntry[];
  majorDecisions: MajorDecision[];
  milestones: Milestone[];
  
  monthlyIncome: number;
  monthlyExpenses: number;
  
  eventCooldowns: Record<string, number>;
  
  isAlive: boolean;
  deathAge?: number;
  
  newsHistory: NewsItem[];
  
  version: number;
}

export interface MonthlyReport {
  date: DateInfo;
  age: number;
  
  income: {
    employment: number;
    partner: number;
    business: number;
    investments: number;
    rental: number;
    other: number;
    total: number;
  };
  
  expenses: {
    housing: number;
    transportation: number;
    food: number;
    utilities: number;
    debt: number;
    insurance: number;
    lifestyle: number;
    education: number;
    childcare: number;
    taxes: number;
    other: number;
    total: number;
  };
  
  netCashFlow: number;
  
  netWorthBefore: number;
  netWorthAfter: number;
  netWorthChange: number;
  
  creditScoreBefore: number;
  creditScoreAfter: number;
  
  events: GameEvent[];
  
  news: NewsItem[];
}

export interface EventChoice {
  id: string;
  text: string;
  effects: Partial<EventEffects>;
  requirements?: EventRequirements;
}

export interface EventEffects {
  cash: number;
  stress: number;
  happiness: number;
  health: number;
  energy: number;
  creditScore: number;
  addLoan?: Omit<Loan, 'id'>;
  removeLoanId?: string;
  addVehicle?: Omit<Vehicle, 'id'>;
  removeVehicle?: boolean;
  employment?: 'lose' | 'promotion' | Employment;
  education?: Education;
  relationship?: RelationshipStatus;
  housing?: { type: HousingType; rent: number };
  skill?: { skill: keyof Skills; amount: number };
  timeline?: Omit<TimelineEntry, 'date' | 'age'>;
}

export interface EventRequirements {
  minCash?: number;
  maxCash?: number;
  minCreditScore?: number;
  minNetWorth?: number;
  hasVehicle?: boolean;
  hasJob?: boolean;
  hasPartner?: boolean;
  educationLevel?: EducationLevel[];
  housingType?: HousingType[];
  minAge?: number;
  maxAge?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  category: 'career' | 'financial' | 'relationship' | 'health' | 'opportunity' | 'emergency' | 'lifestyle';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare';
  requirements?: EventRequirements;
  cooldownMonths?: number;
}

export interface CareerPath {
  id: string;
  name: string;
  industry: string;
  jobs: string[];
  requiredEducation: EducationLevel[];
  description: string;
}

export interface SaveGame {
  id: string;
  name: string;
  state: GameState;
  savedAt: number;
  version: number;
}
