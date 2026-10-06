import type { GameEvent } from '../../game/models/types';

export const EVENTS: GameEvent[] = [
  // EMERGENCY EVENTS
  {
    id: 'car_breakdown_minor',
    title: 'Car Trouble',
    description: 'Your car is making a strange noise. The mechanic says you need new brakes.',
    category: 'emergency',
    rarity: 'common',
    requirements: { hasVehicle: true },
    cooldownMonths: 8,
    choices: [
      {
        id: 'fix_brakes',
        text: 'Pay for the repair ($450)',
        effects: { cash: -450, stress: 5 },
        requirements: { minCash: 450 },
      },
      {
        id: 'delay_brakes',
        text: 'Put it off for now',
        effects: { stress: 10 },
      },
    ],
  },
  {
    id: 'car_breakdown_major',
    title: 'Transmission Problems',
    description: 'Your car needs a new transmission. The repair will be expensive.',
    category: 'emergency',
    rarity: 'uncommon',
    requirements: { hasVehicle: true },
    cooldownMonths: 24,
    choices: [
      {
        id: 'repair_transmission',
        text: 'Repair it ($3,200)',
        effects: { cash: -3200, stress: 15 },
        requirements: { minCash: 3200 },
      },
      {
        id: 'sell_car',
        text: 'Sell the car for parts',
        effects: { removeVehicle: true, cash: 800, stress: 20 },
      },
      {
        id: 'finance_repair',
        text: 'Put it on a credit card',
        effects: {
          stress: 10,
          addLoan: { type: 'credit_card', principal: 3200, balance: 3200, apr: 0.219, minimumPayment: 96, monthlyPayment: 96, termMonths: 60, remainingMonths: 60 },
        },
        requirements: { minCreditScore: 580 },
      },
    ],
  },
  {
    id: 'car_totaled',
    title: 'Car Accident',
    description: "You were in an accident. Thankfully you're okay, but your car is totaled.",
    category: 'emergency',
    rarity: 'rare',
    requirements: { hasVehicle: true },
    cooldownMonths: 60,
    choices: [
      {
        id: 'insurance_payout',
        text: 'File insurance claim',
        effects: { removeVehicle: true, cash: 2500, stress: 25, health: -5 },
      },
    ],
  },
  {
    id: 'medical_bill_small',
    title: 'Unexpected Medical Bill',
    description: "You went to urgent care for an illness. Here's the bill.",
    category: 'emergency',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      {
        id: 'pay_medical',
        text: 'Pay the bill ($380)',
        effects: { cash: -380, health: 10 },
        requirements: { minCash: 380 },
      },
      {
        id: 'payment_plan',
        text: 'Set up a payment plan',
        effects: {
          health: 10,
          addLoan: { type: 'personal', principal: 380, balance: 380, apr: 0.0, minimumPayment: 40, monthlyPayment: 40, termMonths: 10, remainingMonths: 10 },
        },
      },
      {
        id: 'ignore_medical',
        text: 'Ignore the bill',
        effects: { creditScore: -25, stress: 15 },
      },
    ],
  },
  {
    id: 'medical_bill_large',
    title: 'Emergency Room Visit',
    description: 'You had to visit the ER. The bills are substantial.',
    category: 'emergency',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      {
        id: 'pay_er',
        text: 'Pay the bill ($2,800)',
        effects: { cash: -2800, health: 15 },
        requirements: { minCash: 2800 },
      },
      {
        id: 'payment_plan_er',
        text: 'Set up a payment plan',
        effects: {
          health: 15,
          addLoan: { type: 'personal', principal: 2800, balance: 2800, apr: 0.05, minimumPayment: 150, monthlyPayment: 150, termMonths: 20, remainingMonths: 20 },
        },
      },
      {
        id: 'negotiate_er',
        text: 'Try to negotiate the bill down',
        effects: { cash: -1400, health: 15, stress: 10 },
        requirements: { minCash: 1400 },
      },
    ],
  },
  {
    id: 'phone_broke',
    title: 'Phone Screen Cracked',
    description: 'You dropped your phone and the screen is shattered.',
    category: 'emergency',
    rarity: 'common',
    cooldownMonths: 12,
    choices: [
      {
        id: 'repair_phone',
        text: 'Get it repaired ($180)',
        effects: { cash: -180 },
        requirements: { minCash: 180 },
      },
      {
        id: 'new_phone',
        text: 'Buy a new phone ($900)',
        effects: { cash: -900, happiness: 5 },
        requirements: { minCash: 900 },
      },
      {
        id: 'cheap_phone',
        text: 'Get a basic phone ($120)',
        effects: { cash: -120, happiness: -5 },
        requirements: { minCash: 120 },
      },
    ],
  },
  {
    id: 'laptop_died',
    title: 'Laptop Died',
    description: "Your laptop won't turn on anymore.",
    category: 'emergency',
    rarity: 'uncommon',
    cooldownMonths: 24,
    choices: [
      {
        id: 'new_laptop',
        text: 'Buy a new laptop ($800)',
        effects: { cash: -800 },
        requirements: { minCash: 800 },
      },
      {
        id: 'cheap_laptop',
        text: 'Buy a budget laptop ($350)',
        effects: { cash: -350 },
        requirements: { minCash: 350 },
      },
      {
        id: 'no_laptop',
        text: 'Go without for now',
        effects: { stress: 10 },
      },
    ],
  },
  {
    id: 'rent_increase',
    title: 'Rent Increase Notice',
    description: 'Your landlord is raising rent by $150/month starting next month.',
    category: 'financial',
    rarity: 'common',
    requirements: { housingType: ['cheap_apartment', 'apartment', 'nice_apartment', 'rental_house', 'roommates'] },
    cooldownMonths: 12,
    choices: [
      {
        id: 'accept_increase',
        text: 'Accept the increase',
        effects: { stress: 10 },
      },
      {
        id: 'negotiate_rent',
        text: 'Try to negotiate',
        effects: { stress: 5 },
      },
      {
        id: 'look_elsewhere',
        text: 'Start looking for a new place',
        effects: { stress: 15, energy: -10 },
      },
    ],
  },
  {
    id: 'home_repair',
    title: 'Home Repair Needed',
    description: 'Your water heater just failed. You need to replace it.',
    category: 'emergency',
    rarity: 'uncommon',
    requirements: { housingType: ['owned_home', 'nice_home', 'luxury_home'] },
    cooldownMonths: 18,
    choices: [
      {
        id: 'replace_water_heater',
        text: 'Replace it ($1,400)',
        effects: { cash: -1400 },
        requirements: { minCash: 1400 },
      },
      {
        id: 'finance_repair',
        text: 'Finance the repair',
        effects: {
          addLoan: { type: 'personal', principal: 1400, balance: 1400, apr: 0.12, minimumPayment: 80, monthlyPayment: 80, termMonths: 20, remainingMonths: 20 },
        },
      },
    ],
  },
  {
    id: 'hvac_repair',
    title: 'HVAC System Failure',
    description: "Your heating/cooling system needs major repairs.",
    category: 'emergency',
    rarity: 'rare',
    requirements: { housingType: ['owned_home', 'nice_home', 'luxury_home'] },
    cooldownMonths: 36,
    choices: [
      {
        id: 'repair_hvac',
        text: 'Repair it ($3,500)',
        effects: { cash: -3500 },
        requirements: { minCash: 3500 },
      },
      {
        id: 'replace_hvac',
        text: 'Full replacement ($8,000)',
        effects: { cash: -8000, happiness: 5 },
        requirements: { minCash: 8000 },
      },
      {
        id: 'finance_hvac',
        text: 'Finance the repair',
        effects: {
          addLoan: { type: 'personal', principal: 3500, balance: 3500, apr: 0.10, minimumPayment: 150, monthlyPayment: 150, termMonths: 24, remainingMonths: 24 },
        },
        requirements: { minCreditScore: 620 },
      },
    ],
  },

  // CAREER EVENTS
  {
    id: 'overtime_offered',
    title: 'Overtime Available',
    description: 'Your manager asks if you want to pick up extra shifts this month.',
    category: 'career',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 3,
    choices: [
      {
        id: 'accept_overtime',
        text: 'Work the extra hours',
        effects: { cash: 600, stress: 15, energy: -15, happiness: -5 },
      },
      {
        id: 'decline_overtime',
        text: 'Decline politely',
        effects: { happiness: 5 },
      },
    ],
  },
  {
    id: 'promotion_opportunity',
    title: 'Promotion Opportunity',
    description: 'Your manager mentions a higher position may be opening up soon. They think you could be a good fit.',
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'express_interest',
        text: 'Express strong interest',
        effects: { stress: 10, happiness: 10, skill: { skill: 'leadership', amount: 2 } },
      },
      {
        id: 'wait_and_see',
        text: 'Wait and see',
        effects: {},
      },
    ],
  },
  {
    id: 'layoff_warning',
    title: 'Company Restructuring',
    description: 'Your company announces layoffs are coming. Your position might be affected.',
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 18,
    choices: [
      {
        id: 'update_resume',
        text: 'Start job searching quietly',
        effects: { stress: 20, skill: { skill: 'communication', amount: 1 } },
      },
      {
        id: 'work_harder',
        text: 'Work harder to prove your value',
        effects: { stress: 25, energy: -15 },
      },
      {
        id: 'stay_calm',
        text: 'Stay calm and wait',
        effects: { stress: 15 },
      },
    ],
  },
  {
    id: 'difficult_coworker',
    title: 'Workplace Conflict',
    description: 'A coworker is making your work life difficult.',
    category: 'career',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 6,
    choices: [
      {
        id: 'talk_to_hr',
        text: 'Talk to HR',
        effects: { stress: 10 },
      },
      {
        id: 'confront_coworker',
        text: 'Address it directly',
        effects: { stress: 15, skill: { skill: 'communication', amount: 2 } },
      },
      {
        id: 'ignore_coworker',
        text: 'Try to ignore it',
        effects: { stress: 20, happiness: -5 },
      },
    ],
  },
  {
    id: 'new_job_offer',
    title: 'Job Offer',
    description: "A recruiter reaches out with an interesting opportunity. It pays 15% more but requires longer hours.",
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'take_offer',
        text: 'Accept the new job',
        effects: { stress: 20, happiness: 10 },
      },
      {
        id: 'negotiate_current',
        text: 'Use it to negotiate a raise',
        effects: { stress: 15 },
      },
      {
        id: 'decline_offer',
        text: 'Decline the offer',
        effects: {},
      },
    ],
  },
  {
    id: 'work_from_home',
    title: 'Remote Work Option',
    description: 'Your company is offering optional remote work. This could save on commuting.',
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 24,
    choices: [
      {
        id: 'go_remote',
        text: 'Switch to remote',
        effects: { happiness: 10, stress: -10, cash: 150 },
      },
      {
        id: 'stay_office',
        text: 'Stay in the office',
        effects: { skill: { skill: 'communication', amount: 1 } },
      },
      {
        id: 'hybrid',
        text: 'Do hybrid (3 days office)',
        effects: { happiness: 5, stress: -5, cash: 75 },
      },
    ],
  },
  {
    id: 'training_opportunity',
    title: 'Training Program',
    description: "Your employer offers a professional development program. It's free but requires extra hours.",
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'take_training',
        text: 'Enroll in the program',
        effects: { energy: -10, skill: { skill: 'technical', amount: 5 } },
      },
      {
        id: 'skip_training',
        text: 'Pass on this one',
        effects: {},
      },
    ],
  },

  // FINANCIAL EVENTS
  {
    id: 'tax_refund',
    title: 'Tax Refund',
    description: 'Your tax return has been processed. You have a refund coming.',
    category: 'financial',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'receive_refund',
        text: 'Deposit the refund',
        effects: { cash: 1200, happiness: 5 },
      },
    ],
  },
  {
    id: 'credit_card_offer',
    title: 'Credit Card Offer',
    description: "You've been pre-approved for a credit card with a $5,000 limit.",
    category: 'financial',
    rarity: 'common',
    requirements: { minCreditScore: 620 },
    cooldownMonths: 6,
    choices: [
      {
        id: 'accept_card',
        text: 'Accept the card',
        effects: { creditScore: 3 },
      },
      {
        id: 'decline_card',
        text: 'Decline',
        effects: {},
      },
    ],
  },
  {
    id: 'unexpected_inheritance',
    title: 'Unexpected Inheritance',
    description: 'A distant relative you barely knew has passed away and left you some money.',
    category: 'financial',
    rarity: 'very_rare',
    cooldownMonths: 120,
    choices: [
      {
        id: 'receive_inheritance',
        text: 'Receive the inheritance',
        effects: { cash: 15000, happiness: 5, stress: 5 },
      },
    ],
  },
  {
    id: 'small_windfall',
    title: 'Found Money',
    description: 'You found $50 in an old jacket pocket!',
    category: 'financial',
    rarity: 'common',
    cooldownMonths: 4,
    choices: [
      {
        id: 'keep_money',
        text: 'Nice! Pocket it.',
        effects: { cash: 50, happiness: 3 },
      },
    ],
  },
  {
    id: 'side_gig_opportunity',
    title: 'Side Gig Opportunity',
    description: 'A friend offers you some freelance work on weekends.',
    category: 'opportunity',
    rarity: 'uncommon',
    cooldownMonths: 8,
    choices: [
      {
        id: 'take_side_gig',
        text: 'Take the work',
        effects: { cash: 800, stress: 15, energy: -15 },
      },
      {
        id: 'decline_gig',
        text: "I need my weekends",
        effects: { happiness: 5 },
      },
    ],
  },
  {
    id: 'investment_opportunity',
    title: 'Investment Opportunity',
    description: "You've saved enough to start investing. A financial advisor recommends index funds.",
    category: 'opportunity',
    rarity: 'uncommon',
    requirements: { minCash: 1000 },
    cooldownMonths: 24,
    choices: [
      {
        id: 'start_investing',
        text: 'Open an investment account',
        effects: { skill: { skill: 'financial', amount: 3 }, happiness: 5 },
      },
      {
        id: 'wait_to_invest',
        text: 'Wait until you have more saved',
        effects: {},
      },
    ],
  },
  {
    id: 'bank_bonus',
    title: 'Bank Account Bonus',
    description: 'A new bank is offering a $300 bonus for opening an account.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 12,
    choices: [
      {
        id: 'get_bonus',
        text: 'Open the account',
        effects: { cash: 300 },
      },
      {
        id: 'skip_bonus',
        text: 'Too much hassle',
        effects: {},
      },
    ],
  },
  {
    id: 'bonus_at_work',
    title: 'Performance Bonus',
    description: 'You received an unexpected bonus at work!',
    category: 'financial',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'receive_bonus',
        text: 'Accept graciously',
        effects: { cash: 2000, happiness: 15 },
      },
    ],
  },

  // OPPORTUNITY EVENTS
  {
    id: 'scholarship_opportunity',
    title: 'Scholarship Available',
    description: "You qualify for an educational scholarship that could cover part of your tuition.",
    category: 'opportunity',
    rarity: 'rare',
    requirements: { maxAge: 35 },
    cooldownMonths: 24,
    choices: [
      {
        id: 'apply_scholarship',
        text: 'Apply for it',
        effects: { cash: 3000, happiness: 10 },
      },
    ],
  },
  {
    id: 'certification_program',
    title: 'Certification Opportunity',
    description: "There's a certification program that could boost your career. It costs $1,200.",
    category: 'opportunity',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 18,
    choices: [
      {
        id: 'get_certified',
        text: 'Enroll in the program',
        effects: { cash: -1200, skill: { skill: 'technical', amount: 8 }, stress: 10 },
        requirements: { minCash: 1200 },
      },
      {
        id: 'skip_cert',
        text: 'Not right now',
        effects: {},
      },
    ],
  },
  {
    id: 'networking_event',
    title: 'Industry Networking Event',
    description: 'A professional networking event is happening this weekend.',
    category: 'opportunity',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 4,
    choices: [
      {
        id: 'attend_networking',
        text: 'Attend ($50 ticket)',
        effects: { cash: -50, skill: { skill: 'communication', amount: 2 }, energy: -10 },
        requirements: { minCash: 50 },
      },
      {
        id: 'skip_networking',
        text: 'Skip it',
        effects: {},
      },
    ],
  },
  {
    id: 'business_idea',
    title: 'Business Idea',
    description: 'A friend pitches you a business idea. They want you to be a partner.',
    category: 'opportunity',
    rarity: 'rare',
    requirements: { minCash: 5000, minAge: 22 },
    cooldownMonths: 36,
    choices: [
      {
        id: 'join_business',
        text: 'Invest and become a partner',
        effects: { cash: -5000, stress: 20, skill: { skill: 'entrepreneurship', amount: 5 } },
        requirements: { minCash: 5000 },
      },
      {
        id: 'decline_business',
        text: 'Too risky for me right now',
        effects: {},
      },
    ],
  },
  {
    id: 'real_estate_seminar',
    title: 'Real Estate Seminar',
    description: "There's a local seminar on real estate investing.",
    category: 'opportunity',
    rarity: 'uncommon',
    requirements: { minNetWorth: 20000 },
    cooldownMonths: 12,
    choices: [
      {
        id: 'attend_seminar',
        text: 'Attend ($200)',
        effects: { cash: -200, skill: { skill: 'financial', amount: 3 } },
        requirements: { minCash: 200 },
      },
      {
        id: 'skip_seminar',
        text: 'Not interested',
        effects: {},
      },
    ],
  },
  {
    id: 'mentorship_offer',
    title: 'Mentorship Opportunity',
    description: 'A successful professional in your field offers to mentor you.',
    category: 'opportunity',
    rarity: 'rare',
    requirements: { hasJob: true },
    cooldownMonths: 36,
    choices: [
      {
        id: 'accept_mentorship',
        text: 'Accept gratefully',
        effects: { happiness: 10, skill: { skill: 'leadership', amount: 5 } },
      },
      {
        id: 'decline_mentorship',
        text: "I don't have time",
        effects: {},
      },
    ],
  },

  // RELATIONSHIP EVENTS
  {
    id: 'met_someone',
    title: 'New Connection',
    description: "You've met someone interesting at a social event.",
    category: 'relationship',
    rarity: 'common',
    requirements: { minAge: 18 },
    cooldownMonths: 6,
    choices: [
      {
        id: 'ask_out',
        text: 'Ask them out',
        effects: { happiness: 10, relationship: 'dating', cash: -100 },
      },
      {
        id: 'just_friends',
        text: 'Keep it friendly',
        effects: { happiness: 3 },
      },
    ],
  },
  {
    id: 'relationship_milestone',
    title: 'Getting Serious',
    description: 'Your relationship is progressing. They want to talk about the future.',
    category: 'relationship',
    rarity: 'uncommon',
    requirements: { hasPartner: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'commit_more',
        text: 'Commit to the relationship',
        effects: { happiness: 15, relationship: 'serious' },
      },
      {
        id: 'slow_down',
        text: "I'm not ready",
        effects: { happiness: -5, stress: 10 },
      },
    ],
  },
  {
    id: 'move_in_together',
    title: 'Moving In Together',
    description: 'Your partner suggests moving in together to save money.',
    category: 'relationship',
    rarity: 'uncommon',
    requirements: { hasPartner: true },
    cooldownMonths: 24,
    choices: [
      {
        id: 'move_in',
        text: 'Move in together',
        effects: { happiness: 10, stress: 10 },
      },
      {
        id: 'stay_separate',
        text: 'Keep living separately',
        effects: { happiness: -5 },
      },
    ],
  },
  {
    id: 'partner_job_loss',
    title: "Partner's Job Loss",
    description: 'Your partner just lost their job.',
    category: 'relationship',
    rarity: 'uncommon',
    requirements: { hasPartner: true },
    cooldownMonths: 24,
    choices: [
      {
        id: 'support_partner',
        text: 'Support them through this',
        effects: { stress: 15, happiness: -5 },
      },
    ],
  },
  {
    id: 'family_needs_help',
    title: 'Family Needs Help',
    description: 'A family member is going through hard times and asks for financial help.',
    category: 'relationship',
    rarity: 'uncommon',
    cooldownMonths: 12,
    choices: [
      {
        id: 'help_family',
        text: 'Help them out ($500)',
        effects: { cash: -500, happiness: 5, stress: 5 },
        requirements: { minCash: 500 },
      },
      {
        id: 'cant_afford',
        text: "I can't afford to right now",
        effects: { stress: 15, happiness: -10 },
      },
    ],
  },
  {
    id: 'wedding_invitation',
    title: 'Wedding Invitation',
    description: "A friend is getting married and you're invited.",
    category: 'relationship',
    rarity: 'common',
    cooldownMonths: 8,
    choices: [
      {
        id: 'attend_wedding',
        text: 'Attend ($350 with gift)',
        effects: { cash: -350, happiness: 10 },
        requirements: { minCash: 350 },
      },
      {
        id: 'send_gift',
        text: 'Just send a gift ($100)',
        effects: { cash: -100, happiness: 2 },
        requirements: { minCash: 100 },
      },
      {
        id: 'decline_wedding',
        text: 'Send regrets',
        effects: { happiness: -5 },
      },
    ],
  },
  {
    id: 'friend_group_vacation',
    title: 'Group Vacation',
    description: "Your friends are planning a trip. They want you to come.",
    category: 'lifestyle',
    rarity: 'uncommon',
    cooldownMonths: 12,
    choices: [
      {
        id: 'join_vacation',
        text: 'Join them ($1,500)',
        effects: { cash: -1500, happiness: 25, stress: -20, energy: 10 },
        requirements: { minCash: 1500 },
      },
      {
        id: 'skip_vacation',
        text: "Can't afford it this time",
        effects: { happiness: -10, stress: 5 },
      },
    ],
  },

  // HEALTH EVENTS
  {
    id: 'gym_membership',
    title: 'Gym Membership Deal',
    description: 'A local gym is offering a discounted annual membership.',
    category: 'health',
    rarity: 'common',
    cooldownMonths: 12,
    choices: [
      {
        id: 'join_gym',
        text: 'Sign up ($400/year)',
        effects: { cash: -400, health: 10, happiness: 5, stress: -5 },
        requirements: { minCash: 400 },
      },
      {
        id: 'skip_gym',
        text: 'Not right now',
        effects: {},
      },
    ],
  },
  {
    id: 'burnout',
    title: 'Feeling Burned Out',
    description: 'You feel exhausted and unmotivated. Something needs to change.',
    category: 'health',
    rarity: 'common',
    cooldownMonths: 8,
    choices: [
      {
        id: 'take_break',
        text: 'Take some personal time',
        effects: { happiness: 10, stress: -20, energy: 15 },
      },
      {
        id: 'push_through',
        text: 'Push through it',
        effects: { health: -5, stress: 10 },
      },
    ],
  },
  {
    id: 'dental_work',
    title: 'Dental Work Needed',
    description: 'Your dentist says you need some work done.',
    category: 'health',
    rarity: 'common',
    cooldownMonths: 12,
    choices: [
      {
        id: 'get_dental',
        text: 'Get it done ($600)',
        effects: { cash: -600, health: 5 },
        requirements: { minCash: 600 },
      },
      {
        id: 'delay_dental',
        text: 'Put it off',
        effects: { health: -3 },
      },
    ],
  },
  {
    id: 'therapy_recommended',
    title: 'Mental Health Support',
    description: "You've been stressed lately. A friend suggests talking to a therapist.",
    category: 'health',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      {
        id: 'start_therapy',
        text: 'Start therapy ($150/month)',
        effects: { stress: -15, happiness: 10, cash: -150 },
        requirements: { minCash: 150 },
      },
      {
        id: 'skip_therapy',
        text: "I'll manage on my own",
        effects: { stress: 5 },
      },
    ],
  },

  // LIFESTYLE EVENTS
  {
    id: 'lifestyle_upgrade_temptation',
    title: 'Lifestyle Upgrade',
    description: "With your recent raise, you could afford a nicer lifestyle. Friends are doing it.",
    category: 'lifestyle',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'upgrade_lifestyle',
        text: 'Treat yourself a bit more',
        effects: { happiness: 15 },
      },
      {
        id: 'stay_frugal',
        text: 'Stay disciplined',
        effects: { skill: { skill: 'financial', amount: 2 } },
      },
    ],
  },
  {
    id: 'new_car_envy',
    title: 'New Car Envy',
    description: 'Your neighbor just got a new car. Yours is looking pretty old...',
    category: 'lifestyle',
    rarity: 'common',
    requirements: { hasVehicle: true },
    cooldownMonths: 8,
    choices: [
      {
        id: 'appreciate_car',
        text: 'Your car works fine',
        effects: { happiness: 3, skill: { skill: 'financial', amount: 1 } },
      },
      {
        id: 'feel_inadequate',
        text: 'Feel a bit envious',
        effects: { happiness: -5 },
      },
    ],
  },
  {
    id: 'expensive_hobby',
    title: 'New Hobby Interest',
    description: "You've discovered an interest in photography. Good cameras aren't cheap though.",
    category: 'lifestyle',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      {
        id: 'start_hobby',
        text: 'Invest in the hobby ($800)',
        effects: { cash: -800, happiness: 15, stress: -10 },
        requirements: { minCash: 800 },
      },
      {
        id: 'affordable_version',
        text: 'Start with your phone',
        effects: { happiness: 5 },
      },
      {
        id: 'skip_hobby',
        text: 'Maybe later',
        effects: {},
      },
    ],
  },
  {
    id: 'concert_tickets',
    title: 'Concert Opportunity',
    description: 'Your favorite artist is coming to town. Tickets are $200.',
    category: 'lifestyle',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      {
        id: 'buy_tickets',
        text: 'Get tickets',
        effects: { cash: -200, happiness: 20 },
        requirements: { minCash: 200 },
      },
      {
        id: 'skip_concert',
        text: "Can't justify it",
        effects: { happiness: -5 },
      },
    ],
  },

  // ECONOMIC EVENTS
  {
    id: 'market_crash_warning',
    title: 'Market Volatility',
    description: 'The news is reporting major market declines. Your investments are affected.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 24,
    choices: [
      {
        id: 'stay_course',
        text: 'Stay the course',
        effects: { stress: 15, skill: { skill: 'financial', amount: 2 } },
      },
      {
        id: 'panic_sell',
        text: 'Sell everything',
        effects: { stress: 20, happiness: -10 },
      },
    ],
  },
  {
    id: 'interest_rate_change',
    title: 'Interest Rates Rising',
    description: 'The Federal Reserve raised interest rates. This affects savings and loans.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      {
        id: 'acknowledge_rates',
        text: 'Note the change',
        effects: { skill: { skill: 'financial', amount: 1 } },
      },
    ],
  },
  {
    id: 'housing_market_hot',
    title: 'Housing Market Heating Up',
    description: 'Home prices in your area have been rising rapidly.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 24,
    choices: [
      {
        id: 'consider_buying',
        text: 'Start thinking about buying',
        effects: { skill: { skill: 'financial', amount: 2 } },
      },
      {
        id: 'wait_it_out',
        text: 'Wait for prices to stabilize',
        effects: {},
      },
    ],
  },

  // RANDOM/MISC EVENTS
  {
    id: 'flat_tire',
    title: 'Flat Tire',
    description: 'You got a flat tire on your way to work.',
    category: 'emergency',
    rarity: 'common',
    requirements: { hasVehicle: true },
    cooldownMonths: 6,
    choices: [
      {
        id: 'new_tire',
        text: 'Buy a new tire ($120)',
        effects: { cash: -120, stress: 5 },
        requirements: { minCash: 120 },
      },
      {
        id: 'used_tire',
        text: 'Get a used tire ($40)',
        effects: { cash: -40, stress: 5 },
        requirements: { minCash: 40 },
      },
    ],
  },
  {
    id: 'parking_ticket',
    title: 'Parking Ticket',
    description: 'You got a parking ticket.',
    category: 'financial',
    rarity: 'common',
    requirements: { hasVehicle: true },
    cooldownMonths: 4,
    choices: [
      {
        id: 'pay_ticket',
        text: 'Pay it ($75)',
        effects: { cash: -75, stress: 5 },
        requirements: { minCash: 75 },
      },
      {
        id: 'contest_ticket',
        text: 'Try to contest it',
        effects: { stress: 10, energy: -5 },
      },
    ],
  },
  {
    id: 'speeding_ticket',
    title: 'Speeding Ticket',
    description: 'You got pulled over for speeding.',
    category: 'financial',
    rarity: 'uncommon',
    requirements: { hasVehicle: true },
    cooldownMonths: 12,
    choices: [
      {
        id: 'pay_speeding',
        text: 'Pay the fine ($250)',
        effects: { cash: -250, stress: 10 },
        requirements: { minCash: 250 },
      },
      {
        id: 'traffic_school',
        text: 'Take traffic school ($180)',
        effects: { cash: -180, stress: 5, energy: -10 },
        requirements: { minCash: 180 },
      },
    ],
  },
  {
    id: 'pet_consideration',
    title: 'Adopt a Pet?',
    description: "You've been thinking about getting a pet. A friend's cat just had kittens.",
    category: 'lifestyle',
    rarity: 'uncommon',
    cooldownMonths: 24,
    choices: [
      {
        id: 'get_pet',
        text: 'Adopt a kitten',
        effects: { happiness: 15, stress: -10 },
      },
      {
        id: 'not_ready',
        text: 'Not ready for that commitment',
        effects: {},
      },
    ],
  },
  {
    id: 'charitable_request',
    title: 'Charity Request',
    description: 'A local charity is asking for donations to help the community.',
    category: 'lifestyle',
    rarity: 'common',
    cooldownMonths: 4,
    choices: [
      {
        id: 'donate_large',
        text: 'Donate $100',
        effects: { cash: -100, happiness: 10 },
        requirements: { minCash: 100 },
      },
      {
        id: 'donate_small',
        text: 'Donate $20',
        effects: { cash: -20, happiness: 5 },
        requirements: { minCash: 20 },
      },
      {
        id: 'no_donation',
        text: 'Not this time',
        effects: {},
      },
    ],
  },
  {
    id: 'lucky_find',
    title: 'Lucky Find',
    description: 'You found a $20 bill on the ground!',
    category: 'financial',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      {
        id: 'keep_20',
        text: 'Your lucky day!',
        effects: { cash: 20, happiness: 3 },
      },
    ],
  },
  {
    id: 'appliance_sale',
    title: 'Appliance Sale',
    description: "There's a great sale on kitchen appliances. You've needed a new microwave.",
    category: 'lifestyle',
    rarity: 'common',
    cooldownMonths: 8,
    choices: [
      {
        id: 'buy_appliance',
        text: 'Get a new microwave ($80)',
        effects: { cash: -80, happiness: 3 },
        requirements: { minCash: 80 },
      },
      {
        id: 'skip_sale',
        text: 'The old one still works',
        effects: {},
      },
    ],
  },
  {
    id: 'subscription_review',
    title: 'Subscription Audit',
    description: 'You realize you have subscriptions you barely use.',
    category: 'financial',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      {
        id: 'cancel_subs',
        text: 'Cancel unused subscriptions',
        effects: { cash: 45, skill: { skill: 'financial', amount: 1 } },
      },
      {
        id: 'keep_subs',
        text: "I might use them eventually",
        effects: {},
      },
    ],
  },
  {
    id: 'old_friend_reconnect',
    title: 'Old Friend',
    description: 'An old friend from school reaches out. They want to catch up over dinner.',
    category: 'relationship',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      {
        id: 'meet_friend',
        text: 'Meet up ($40 for dinner)',
        effects: { cash: -40, happiness: 15, stress: -5 },
        requirements: { minCash: 40 },
      },
      {
        id: 'rain_check',
        text: 'Rain check',
        effects: { happiness: -3 },
      },
    ],
  },
  {
    id: 'professional_photo',
    title: 'Professional Headshot',
    description: 'Your LinkedIn profile could use a better photo. A photographer offers a deal.',
    category: 'career',
    rarity: 'uncommon',
    requirements: { hasJob: true },
    cooldownMonths: 24,
    choices: [
      {
        id: 'get_photo',
        text: 'Get professional photos ($150)',
        effects: { cash: -150, skill: { skill: 'communication', amount: 1 } },
        requirements: { minCash: 150 },
      },
      {
        id: 'skip_photo',
        text: 'Current photo is fine',
        effects: {},
      },
    ],
  },
  {
    id: 'utility_spike',
    title: 'Utility Bill Spike',
    description: 'A brutal month of weather doubled the utility bill.',
    category: 'financial',
    rarity: 'common',
    cooldownMonths: 8,
    choices: [
      { id: 'pay_utility', text: 'Pay the extra $160', effects: { cash: -160 }, requirements: { minCash: 160 } },
      { id: 'payment_plan_utility', text: 'Ask for a payment plan', effects: { stress: 6 } },
    ],
  },
  {
    id: 'roommate_offer',
    title: 'Roommate Offer',
    description: 'A coworker needs a roommate and the rent would be lower than living alone.',
    category: 'opportunity',
    rarity: 'uncommon',
    requirements: { housingType: ['cheap_apartment', 'apartment', 'nice_apartment'] },
    cooldownMonths: 18,
    choices: [
      { id: 'take_roommate', text: 'Split the place', effects: { cash: 200, happiness: -3, stress: 4 } },
      { id: 'keep_privacy', text: 'Keep your privacy', effects: { happiness: 2 } },
    ],
  },
  {
    id: 'childcare_increase',
    title: 'Childcare Rates Rise',
    description: 'The daycare raised rates. The new bill starts this month.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 12,
    choices: [
      { id: 'pay_childcare', text: 'Absorb the increase', effects: { cash: -180, stress: 6 } },
      { id: 'family_help_child', text: 'Ask family to watch the kids sometimes', effects: { stress: 4, happiness: 2 } },
    ],
  },
  {
    id: 'bonus_shift_holiday',
    title: 'Holiday Bonus Shift',
    description: 'The schedule has a holiday shift that pays extra.',
    category: 'career',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 10,
    choices: [
      { id: 'work_holiday', text: 'Work it', effects: { cash: 280, happiness: -4, stress: 6 } },
      { id: 'keep_holiday', text: 'Take the day', effects: { happiness: 6 } },
    ],
  },
  {
    id: 'identity_alert',
    title: 'Suspicious Charge',
    description: 'Your bank flagged a charge you do not recognize.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      { id: 'dispute_charge', text: 'Dispute it', effects: { stress: 5, cash: 40 } },
      { id: 'ignore_charge', text: 'Ignore it', effects: { cash: -75, creditScore: -5 } },
    ],
  },
  {
    id: 'community_class',
    title: 'Free Community Class',
    description: 'The library is running a free personal-finance workshop.',
    category: 'opportunity',
    rarity: 'common',
    cooldownMonths: 8,
    choices: [
      { id: 'attend_class', text: 'Go', effects: { skill: { skill: 'financial', amount: 3 }, energy: -4 } },
      { id: 'skip_class', text: 'Skip it', effects: {} },
    ],
  },
  {
    id: 'neighbor_tools',
    title: 'Borrowed Tools',
    description: 'A neighbor will lend tools if you help them move a couch.',
    category: 'opportunity',
    rarity: 'common',
    cooldownMonths: 10,
    choices: [
      { id: 'help_neighbor', text: 'Help out', effects: { happiness: 4, energy: -6, skill: { skill: 'trade', amount: 1 } } },
      { id: 'decline_neighbor', text: 'Not today', effects: {} },
    ],
  },
  {
    id: 'raise_rumor',
    title: 'Raise Rumor',
    description: 'People at work say annual reviews are coming, and budgets are tight.',
    category: 'career',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 8,
    choices: [
      { id: 'document_work', text: 'Write down your wins', effects: { stress: 3, skill: { skill: 'communication', amount: 1 } } },
      { id: 'ignore_rumor', text: 'Wait and see', effects: {} },
    ],
  },
  {
    id: 'bike_commute',
    title: 'Bike for Sale',
    description: 'Someone on your block is selling a used bike cheap.',
    category: 'lifestyle',
    rarity: 'common',
    cooldownMonths: 12,
    choices: [
      { id: 'buy_bike', text: 'Buy it ($90)', effects: { cash: -90, health: 4, happiness: 3 }, requirements: { minCash: 90 } },
      { id: 'skip_bike', text: 'Pass', effects: {} },
    ],
  },
  {
    id: 'family_dinner',
    title: 'Family Dinner',
    description: 'Your family wants everyone home for dinner. It is not really optional.',
    category: 'relationship',
    rarity: 'common',
    cooldownMonths: 6,
    choices: [
      { id: 'go_dinner', text: 'Show up ($40)', effects: { cash: -40, happiness: 8, stress: -4 }, requirements: { minCash: 40 } },
      { id: 'skip_dinner', text: 'Make an excuse', effects: { happiness: -6, stress: 4 } },
    ],
  },
  {
    id: 'credit_builder',
    title: 'Credit-Builder Account',
    description: 'A local credit union offers a small secured card to start a credit file.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 24,
    choices: [
      { id: 'open_builder', text: 'Open it with $200', effects: { cash: -200, creditScore: 12 }, requirements: { minCash: 200 } },
      { id: 'skip_builder', text: 'Not now', effects: {} },
    ],
  },
  {
    id: 'storm_damage',
    title: 'Storm Damage',
    description: 'A storm knocked a branch through a window at home.',
    category: 'emergency',
    rarity: 'rare',
    requirements: { housingType: ['owned_home', 'nice_home', 'luxury_home', 'rental_house'] },
    cooldownMonths: 24,
    choices: [
      { id: 'fix_window', text: 'Repair it ($900)', effects: { cash: -900, stress: 8 }, requirements: { minCash: 900 } },
      { id: 'patch_window', text: 'Patch it yourself ($150)', effects: { cash: -150, stress: 6, skill: { skill: 'trade', amount: 1 } }, requirements: { minCash: 150 } },
    ],
  },
  {
    id: 'second_job_lead',
    title: 'Weekend Job Lead',
    description: 'A friend knows a place hiring weekend help.',
    category: 'opportunity',
    rarity: 'uncommon',
    cooldownMonths: 8,
    choices: [
      { id: 'take_weekend', text: 'Take the shifts this month', effects: { cash: 700, energy: -12, stress: 10, happiness: -4 } },
      { id: 'protect_weekend', text: 'Protect your weekends', effects: { happiness: 4 } },
    ],
  },
  {
    id: 'lost_wallet',
    title: 'Lost Wallet',
    description: 'Your wallet is gone. Cards, cash, and an afternoon of phone calls.',
    category: 'emergency',
    rarity: 'uncommon',
    cooldownMonths: 18,
    choices: [
      { id: 'replace_cards', text: 'Cancel cards and move on', effects: { cash: -60, stress: 12 } },
    ],
  },
  {
    id: 'mentor_pay_it',
    title: 'Someone Asks for Advice',
    description: 'A newer coworker wants advice about getting promoted.',
    category: 'career',
    rarity: 'common',
    requirements: { hasJob: true },
    cooldownMonths: 8,
    choices: [
      { id: 'give_advice', text: 'Share what you know', effects: { skill: { skill: 'leadership', amount: 2 }, happiness: 3 } },
      { id: 'too_busy_advice', text: 'You are slammed', effects: { stress: 2 } },
    ],
  },
  {
    id: 'market_rally_news',
    title: 'Markets Rally',
    description: 'The news is full of people who suddenly feel rich. Your own accounts move with the month, not the headlines.',
    category: 'financial',
    rarity: 'uncommon',
    cooldownMonths: 10,
    choices: [
      { id: 'stay_invested', text: 'Leave the plan alone', effects: { skill: { skill: 'financial', amount: 1 } } },
      { id: 'check_accounts', text: 'Refresh your balances all night', effects: { stress: 6 } },
    ],
  },
];

export function getEventById(id: string): GameEvent | undefined {
  return EVENTS.find(e => e.id === id);
}

export function getEventsByCategory(category: string): GameEvent[] {
  return EVENTS.filter(e => e.category === category);
}

export function getEventsByRarity(rarity: string): GameEvent[] {
  return EVENTS.filter(e => e.rarity === rarity);
}
