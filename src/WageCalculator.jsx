import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Clock, DollarSign, TrendingUp, PieChart, AlertTriangle, Sun, Moon } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const THEME_KEY = 'wageCalc:theme';
const DARK_CSS = String.raw`
.wc-root.wc-dark { background-color: #0b1020; color: #e8edf6; color-scheme: dark; }
.wc-dark .bg-white { background-color: #131c33; }
.wc-dark .bg-slate-50 { background-color: #1b2642; }
.wc-dark .bg-slate-900 { background-color: #e2e8f0; color: #0f172a; }
.wc-dark .focus\:bg-white:focus { background-color: #222f52; }
.wc-dark .border-slate-200, .wc-dark .border-slate-300 { border-color: #2c3a5c; }
.wc-dark .ring-slate-200\/70 { --tw-ring-color: rgba(148, 163, 184, 0.16); }
.wc-dark .text-slate-900 { color: #f1f5f9; }
.wc-dark .hover\:text-slate-900:hover { color: #f1f5f9; }
.wc-dark .text-slate-800 { color: #e2e8f0; }
.wc-dark .text-slate-700 { color: #cbd5e1; }
.wc-dark .text-slate-600 { color: #aab6ca; }
.wc-dark .text-slate-500 { color: #94a3b8; }
.wc-dark .text-slate-400 { color: #7889a3; }
.wc-dark .text-black { color: #f1f5f9; }
.wc-dark input::placeholder { color: #64748b; }
.wc-dark select option { background-color: #131c33; color: #e8edf6; }
.wc-dark .bg-teal-50 { background-color: rgba(20, 184, 166, 0.12); }
.wc-dark .border-teal-200, .wc-dark .border-teal-300 { border-color: rgba(45, 212, 191, 0.3); }
.wc-dark .text-teal-600 { color: #2dd4bf; }
.wc-dark .text-teal-700 { color: #5eead4; }
.wc-dark .text-teal-800 { color: #99f6e4; }
.wc-dark .hover\:text-teal-800:hover { color: #ccfbf1; }
.wc-dark .hover\:bg-teal-50:hover { background-color: rgba(20, 184, 166, 0.14); }
.wc-dark .bg-red-50 { background-color: rgba(239, 68, 68, 0.1); }
.wc-dark .bg-red-100 { background-color: rgba(239, 68, 68, 0.18); }
.wc-dark .border-red-200, .wc-dark .border-red-300 { border-color: rgba(248, 113, 113, 0.32); }
.wc-dark .text-red-600 { color: #f87171; }
.wc-dark .text-red-700 { color: #fca5a5; }
.wc-dark .text-red-800 { color: #fecaca; }
.wc-dark .hover\:text-red-800:hover { color: #fee2e2; }
.wc-dark .hover\:bg-red-50:hover { background-color: rgba(239, 68, 68, 0.14); }
.wc-dark .bg-green-50 { background-color: rgba(34, 197, 94, 0.1); }
.wc-dark .bg-green-100 { background-color: rgba(34, 197, 94, 0.18); }
.wc-dark .border-green-200, .wc-dark .border-green-300 { border-color: rgba(74, 222, 128, 0.3); }
.wc-dark .text-green-600 { color: #4ade80; }
.wc-dark .text-green-700 { color: #86efac; }
.wc-dark .text-green-800 { color: #bbf7d0; }
.wc-dark .bg-yellow-50 { background-color: rgba(234, 179, 8, 0.1); }
.wc-dark .border-yellow-200, .wc-dark .border-yellow-300 { border-color: rgba(250, 204, 21, 0.3); }
.wc-dark .text-yellow-700 { color: #facc15; }
.wc-dark .text-yellow-800 { color: #fde68a; }
.wc-dark .bg-orange-50 { background-color: rgba(249, 115, 22, 0.1); }
.wc-dark .border-orange-200 { border-color: rgba(251, 146, 60, 0.3); }
.wc-dark .text-orange-600 { color: #fb923c; }
.wc-dark .text-orange-800 { color: #fed7aa; }
.wc-dark .text-purple-600 { color: #a78bfa; }
.wc-dark .text-purple-700 { color: #c4b5fd; }
.wc-dark .shadow-sm, .wc-dark .shadow-lg { --tw-shadow-color: rgba(0, 0, 0, 0.4); }
`;
const STORAGE_KEY = 'wageCalc:v1';
const PROFILES_KEY = 'wageCalc:profiles';
const EMPTY_EXPENSES = {
  rent: '', electricity: '', water: '', phone: '', wifi: '', groceries: '',
  homeInsurance: '', autoInsurance: '', healthInsurance: '', carPayment: '', entertainment: '', miscellaneous: ''
};
const loadStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export default function WageCalculator() {
  const saved = loadStored(STORAGE_KEY, {});
  const [wage, setWage] = useState(saved.wage ?? '');
  const [wagePeriod, setWagePeriod] = useState(saved.wagePeriod ?? 'hourly');
  const [hoursPerDay, setHoursPerDay] = useState(saved.hoursPerDay ?? '8');
  const [daysPerWeek, setDaysPerWeek] = useState(saved.daysPerWeek ?? '5');
  const [taxRate, setTaxRate] = useState(saved.taxRate ?? '26');
  const [itemCost, setItemCost] = useState('');
  const [hasLoan, setHasLoan] = useState(false);
  const [interestRate, setInterestRate] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('months');
  const [additionalPrincipal, setAdditionalPrincipal] = useState('');
  const [additionalPrincipalFreq, setAdditionalPrincipalFreq] = useState('monthly');
  const [currentRetirementSavings, setCurrentRetirementSavings] = useState(saved.currentRetirementSavings ?? '');
  
  // Monthly expenses
  const [monthlyExpenses, setMonthlyExpenses] = useState({ ...EMPTY_EXPENSES, ...(saved.monthlyExpenses || {}) });

  // Saved expense profiles
  const [savedExpenses, setSavedExpenses] = useState(() => loadStored(PROFILES_KEY, {}));
  const [profileName, setProfileName] = useState('');

  // Toast message (replaces alert())
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  // Theme: an explicit choice wins; otherwise follow the device setting
  const [theme, setTheme] = useState(() => loadStored(THEME_KEY, null));
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);
  const isDark = theme ? theme === 'dark' : systemDark;
  useEffect(() => {
    if (theme) {
      try { localStorage.setItem(THEME_KEY, JSON.stringify(theme)); } catch (e) { /* storage unavailable */ }
    }
    // keep overscroll areas and native form controls in step with the theme
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    document.body.style.backgroundColor = isDark ? '#0b1020' : '';
  }, [theme, isDark]);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Chart colors that need to change with the theme
  const themedColor = (c) => (isDark && String(c).toLowerCase() === '#000000' ? '#94a3b8' : c); // black "Taxes" slice would vanish
  const gridStroke = isDark ? '#2c3a5c' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1b2642' : '#ffffff',
    border: `1px solid ${isDark ? '#2c3a5c' : '#e2e8f0'}`,
    borderRadius: 12,
    color: isDark ? '#e8edf6' : '#0f172a'
  };
  const tooltipItemStyle = { color: isDark ? '#e8edf6' : '#0f172a' };

  const [results, setResults] = useState(null);

  const expenseLabels = {
    rent: 'Rent/Mortgage',
    electricity: 'Electricity',
    water: 'Water',
    phone: 'Phone',
    wifi: 'WiFi/Internet',
    groceries: 'Groceries',
    homeInsurance: 'Home Insurance',
    autoInsurance: 'Auto Insurance',
    carPayment: 'Car Payment',
    entertainment: 'Entertainment',
    healthInsurance: 'Health Insurance',
    miscellaneous: 'Miscellaneous/Subscriptions'
  };

  const pieColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#DC2626', // Dark Red (for new purchase)
    '#991B1B'  // Darker Red (for interest)
  ];

  const calculateHourlyWage = (wage, period, hoursPerDay, daysPerWeek) => {
    const wageNum = parseFloat(wage);
    const dailyHours = parseFloat(hoursPerDay) || 8;
    const weeklyDays = parseFloat(daysPerWeek) || 5;
    if (!wageNum) return 0;

    switch (period) {
      case 'hourly': return wageNum;
      case 'daily': return wageNum / dailyHours;
      case 'weekly': return wageNum / (dailyHours * weeklyDays);
      case 'monthly': return wageNum / (dailyHours * weeklyDays * 4.33); // Average weeks per month
      case 'yearly': return wageNum / (dailyHours * weeklyDays * 52); // 52 weeks per year
      default: return 0;
    }
  };

  const calculateTotalCost = (principal, rate, duration, unit, additionalPrincipalAmount, additionalPrincipalFrequency) => {
    if (!hasLoan || !rate || !duration || !principal) return parseFloat(principal) || 0;

    const principalValue = parseFloat(principal) || 0;
    const monthlyRate = parseFloat(rate) / 100 / 12;
    let months;

    switch (unit) {
      case 'months': months = parseFloat(duration); break;
      case 'years': months = parseFloat(duration) * 12; break;
      default: months = parseFloat(duration);
    }

    if (monthlyRate === 0 || months <= 0 || principalValue <= 0) return principalValue;

    // Base monthly payment without additional principal
    const baseMonthlyPayment = principalValue * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

    // Parse additional principal amount
    const additionalPrincipalValue = parseFloat(additionalPrincipalAmount) || 0;

    // If no additional principal payment, use original calculation
    if (additionalPrincipalValue <= 0) {
      return baseMonthlyPayment * months;
    }

    // Calculate with additional principal payments
    const additionalMonthly = additionalPrincipalFrequency === 'yearly' ? additionalPrincipalValue / 12 : additionalPrincipalValue;
    const totalMonthlyPayment = baseMonthlyPayment + additionalMonthly;

    // Simulate the loan with additional payments
    let balance = principalValue;
    let totalPaid = 0;
    let monthsPaid = 0;

    while (balance > 0.01 && monthsPaid < months) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(totalMonthlyPayment - interestPayment, balance);
      
      if (principalPayment <= 0) break; // Safety check
      
      balance -= principalPayment;
      totalPaid += interestPayment + principalPayment;
      monthsPaid++;
    }

    return totalPaid;
  };

  const calculateLoanDetails = (principal, rate, duration, unit, additionalPrincipalAmount, additionalPrincipalFrequency) => {
    if (!hasLoan || !rate || !duration) return { 
      totalCost: principal, 
      monthlyPayment: 0, 
      interestSaved: 0, 
      timeSaved: 0,
      effectiveMonthlyPayment: 0
    };

    const monthlyRate = parseFloat(rate) / 100 / 12;
    let months;

    switch (unit) {
      case 'months': months = parseFloat(duration); break;
      case 'years': months = parseFloat(duration) * 12; break;
      default: months = parseFloat(duration);
    }

    if (monthlyRate === 0) return { 
      totalCost: principal, 
      monthlyPayment: 0, 
      interestSaved: 0, 
      timeSaved: 0,
      effectiveMonthlyPayment: 0
    };

    // Base monthly payment without additional principal
    const baseMonthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const originalTotalCost = baseMonthlyPayment * months;

    // If no additional principal payment, use original calculation
    if (!additionalPrincipalAmount || additionalPrincipalAmount <= 0) {
      return {
        totalCost: originalTotalCost,
        monthlyPayment: baseMonthlyPayment,
        interestSaved: 0,
        timeSaved: 0,
        effectiveMonthlyPayment: baseMonthlyPayment
      };
    }

    // Calculate with additional principal payments
    const additionalMonthly = additionalPrincipalFrequency === 'yearly' ? additionalPrincipalAmount / 12 : additionalPrincipalAmount;
    const totalMonthlyPayment = baseMonthlyPayment + additionalMonthly;

    // Simulate the loan with additional payments
    let balance = principal;
    let totalPaid = 0;
    let monthsPaid = 0;

    while (balance > 0.01 && monthsPaid < months) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(totalMonthlyPayment - interestPayment, balance);
      
      if (principalPayment <= 0) break;
      
      balance -= principalPayment;
      totalPaid += interestPayment + principalPayment;
      monthsPaid++;
    }

    const interestSaved = originalTotalCost - totalPaid;
    const timeSaved = months - monthsPaid;

    return {
      totalCost: totalPaid,
      monthlyPayment: baseMonthlyPayment,
      interestSaved: Math.max(0, interestSaved),
      timeSaved: Math.max(0, timeSaved),
      effectiveMonthlyPayment: totalMonthlyPayment
    };
  };

  const handleExpenseChange = (field, value) => {
    setMonthlyExpenses(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveExpenseProfile = () => {
    if (!profileName.trim()) {
      showToast('Enter a profile name first');
      return;
    }
    setSavedExpenses(prev => ({
      ...prev,
      [profileName.trim()]: { ...monthlyExpenses }
    }));
    setProfileName('');
    showToast(`Saved "${profileName.trim()}"`);
  };

  const loadExpenseProfile = (name) => {
    if (savedExpenses[name]) {
      setMonthlyExpenses({ ...EMPTY_EXPENSES, ...savedExpenses[name] });
    }
  };

  const deleteExpenseProfile = (name) => {
    setSavedExpenses(prev => {
      const newSaved = { ...prev };
      delete newSaved[name];
      return newSaved;
    });
  };

  const clearAllExpenses = () => {
    setMonthlyExpenses({ ...EMPTY_EXPENSES });
  };

  const calculate = () => {
    const wageValue = parseFloat(wage);
    const costValue = parseFloat(itemCost) || 0; // Default to 0 if no purchase

    if (!wage || !wageValue || wageValue <= 0) {
      setResults(null);
      return;
    }

    const hourlyWage = calculateHourlyWage(wageValue, wagePeriod, hoursPerDay, daysPerWeek);
    const dailyHoursWorked = parseFloat(hoursPerDay) || 8;
    const weeklyDaysWorked = parseFloat(daysPerWeek) || 5;
    const taxRatePercent = parseFloat(taxRate) / 100;
    
    const grossDailyWage = hourlyWage * dailyHoursWorked;
    const dailyTaxes = grossDailyWage * taxRatePercent;
    const dailyWage = grossDailyWage - dailyTaxes; // Net daily wage after taxes
    
    // Calculate loan details with additional principal
    const additionalPrincipalValue = parseFloat(additionalPrincipal) || 0;
    const loanDetails = calculateLoanDetails(costValue, interestRate, loanDuration, durationUnit, additionalPrincipalValue, additionalPrincipalFreq);
    
    const totalCost = loanDetails.totalCost;
    const interestPaid = totalCost - costValue;
    
    // Calculate monthly expenses total
    const totalMonthlyExpenses = Object.values(monthlyExpenses)
      .reduce((sum, expense) => sum + (parseFloat(expense) || 0), 0);

    // Calculate work days per month based on user's schedule
    const workDaysPerMonth = (weeklyDaysWorked / 7) * 30; // Work days in a 30-day month
    const netMonthlyIncome = dailyWage * workDaysPerMonth;

    // Calculate monthly payment for new purchase
    let monthlyPurchasePayment = 0;
    if (costValue > 0) {
      if (hasLoan && interestRate && loanDuration) {
        monthlyPurchasePayment = loanDetails.effectiveMonthlyPayment;
      } else {
        // If no loan, spread the cost over 12 months for visualization
        monthlyPurchasePayment = costValue / 12;
      }
    }

    // Calculate shortfall/surplus
    const totalMonthlyExpenditure = totalMonthlyExpenses + monthlyPurchasePayment;
    const monthlyShortfall = totalMonthlyExpenditure - netMonthlyIncome;
    const hasShortfall = monthlyShortfall > 0;

    // Calculate daily portions for existing expenses
    const dailyExpenses = {};
    let dailyExpensesTotal = 0;
    
    Object.entries(monthlyExpenses).forEach(([key, value]) => {
      const monthlyAmount = parseFloat(value) || 0;
      const dailyAmount = monthlyAmount / workDaysPerMonth; // Spread over work days only
      dailyExpenses[key] = dailyAmount;
      dailyExpensesTotal += dailyAmount;
    });

    const dailyPurchaseCost = monthlyPurchasePayment / workDaysPerMonth; // Use work days per month

    // Create pie chart data
    const pieData = [];
    
    // Add taxes first (always present if tax rate > 0)
    if (dailyTaxes > 0) {
      pieData.push({
        name: 'Taxes',
        value: dailyTaxes,
        percentage: parseFloat(((dailyTaxes / grossDailyWage) * 100).toFixed(1)),
        color: '#000000' // Black color
      });
    }
    
    // Add existing expenses (only non-zero values)
    Object.entries(dailyExpenses).forEach(([key, dailyAmount]) => {
      if (dailyAmount > 0) {
        let color;
        // Set specific colors for certain expense types
        switch(key) {
          case 'rent': color = '#CC8899'; break; // Puce color
          case 'wifi': color = '#8B5CF6'; break; // Purple color
          case 'water': color = '#3B82F6'; break; // Blue color
          default: color = pieColors[pieData.length % pieColors.length]; break;
        }
        
        pieData.push({
          name: expenseLabels[key],
          value: dailyAmount,
          percentage: parseFloat(((dailyAmount / grossDailyWage) * 100).toFixed(1)),
          color: color
        });
      }
    });

    // Add new purchase (including interest as total cost) - only if there's a purchase
    if (dailyPurchaseCost > 0) {
      pieData.push({
        name: 'New Purchase (Total)',
        value: dailyPurchaseCost,
        percentage: parseFloat(((dailyPurchaseCost / grossDailyWage) * 100).toFixed(1)),
        color: '#DC2626'
      });
    }

    // Add remaining income or show shortfall
    const totalDailyExpenses = dailyExpensesTotal + dailyPurchaseCost;
    const remainingDaily = dailyWage - totalDailyExpenses;
    
    if (remainingDaily > 0) {
      pieData.push({
        name: 'Remaining Income',
        value: remainingDaily,
        percentage: parseFloat(((remainingDaily / grossDailyWage) * 100).toFixed(1)),
        color: '#10B981'
      });
    } else if (remainingDaily < 0) {
      // Show shortfall in the pie chart
      pieData.push({
        name: 'Shortfall (Deficit)',
        value: Math.abs(remainingDaily),
        percentage: parseFloat(((Math.abs(remainingDaily) / grossDailyWage) * 100).toFixed(1)),
        color: '#FF0000' // Bright red for deficit
      });
    }

    // Sort pie data by value (largest first) for better visualization
    pieData.sort((a, b) => b.value - a.value);

    const hoursToWork = costValue > 0 ? totalCost / (hourlyWage * (1 - taxRatePercent)) : 0;

    // Create loan breakdown data if there's a loan
    let loanBreakdownData = null;
    if (hasLoan && interestPaid > 0) {
      loanBreakdownData = [
        {
          name: 'Principal',
          value: costValue,
          percentage: parseFloat(((costValue / totalCost) * 100).toFixed(1)),
          color: '#10B981' // Green
        },
        {
          name: 'Interest',
          value: parseFloat(interestPaid),
          percentage: parseFloat(((parseFloat(interestPaid) / totalCost) * 100).toFixed(1)),
          color: '#EF4444' // Red
        }
      ];
    }

    // Create annual time breakdown data
    let annualTimeData = null;
    const hoursPerYear = 365 * 24; // Total hours in a year
    const sleepHoursPerYear = 365 * 8; // 8 hours sleep per night
    const workHoursPerYear = dailyHoursWorked * weeklyDaysWorked * 52; // Total work hours per year
    
    const netHourlyWage = hourlyWage * (1 - taxRatePercent);
    
    const timeData = [];
    
    // Add sleep time
    timeData.push({
      name: 'Sleep',
      value: sleepHoursPerYear,
      percentage: parseFloat(((sleepHoursPerYear / hoursPerYear) * 100).toFixed(1)),
      color: '#6B7280' // Gray color for sleep
    });
    
    // Add work time for each expense category
    Object.entries(monthlyExpenses).forEach(([key, value]) => {
      const monthlyAmount = parseFloat(value) || 0;
      if (monthlyAmount > 0) {
        const annualAmount = monthlyAmount * 12;
        const hoursWorkedForExpense = annualAmount / netHourlyWage;
        
        let color;
        switch(key) {
          case 'rent': color = '#CC8899'; break; // Puce color
          case 'wifi': color = '#8B5CF6'; break; // Purple color
          case 'water': color = '#3B82F6'; break; // Blue color
          default: color = pieColors[timeData.length % pieColors.length]; break;
        }
        
        timeData.push({
          name: expenseLabels[key],
          value: hoursWorkedForExpense,
          percentage: parseFloat(((hoursWorkedForExpense / hoursPerYear) * 100).toFixed(1)),
          color: color
        });
      }
    });
    
    // Add work time for new purchase (if any)
    if (costValue > 0) {
      const annualPurchasePayment = monthlyPurchasePayment * 12; // Convert monthly payment to annual
      const hoursWorkedForPurchase = annualPurchasePayment / netHourlyWage;
      timeData.push({
        name: 'New Purchase (Total)',
        value: hoursWorkedForPurchase,
        percentage: parseFloat(((hoursWorkedForPurchase / hoursPerYear) * 100).toFixed(1)),
        color: '#DC2626' // Red color for new purchase
      });
    }
    
    // Add work time for taxes
    const annualTaxes = dailyTaxes * weeklyDaysWorked * 52; // Annual tax amount
    const hoursWorkedForTaxes = annualTaxes / hourlyWage; // Use gross wage since taxes are pre-deduction
    if (hoursWorkedForTaxes > 0) {
      timeData.push({
        name: 'Taxes',
        value: hoursWorkedForTaxes,
        percentage: parseFloat(((hoursWorkedForTaxes / hoursPerYear) * 100).toFixed(1)),
        color: '#000000' // Black color for taxes
      });
    }
    
    // Calculate total work time used
    const totalWorkTimeUsed = timeData
      .filter(item => item.name !== 'Sleep')
      .reduce((sum, item) => sum + item.value, 0);
    
    // Add remaining work time (if any)
    const remainingWorkTime = workHoursPerYear - totalWorkTimeUsed;
    if (remainingWorkTime > 0) {
      timeData.push({
        name: 'Work (Unallocated)',
        value: remainingWorkTime,
        percentage: parseFloat(((remainingWorkTime / hoursPerYear) * 100).toFixed(1)),
        color: '#F59E0B' // Yellow color for unallocated work
      });
    }
    
    // Calculate and add free time
    const totalAccountedTime = timeData.reduce((sum, item) => sum + item.value, 0);
    const freeTime = hoursPerYear - totalAccountedTime;
    
    if (freeTime > 0) {
      timeData.push({
        name: 'Free Time',
        value: freeTime,
        percentage: parseFloat(((freeTime / hoursPerYear) * 100).toFixed(1)),
        color: '#10B981' // Green color for free time
      });
    }
    
    // Sort by value (largest first)
    timeData.sort((a, b) => b.value - a.value);
    
    annualTimeData = timeData;

    // Create annual work time breakdown data
    let annualWorkTimeData = null;
    
    // Filter out green from pieColors for work time chart (reserve for unallocated)
    const workTimeColors = pieColors.filter(color => color !== '#10B981');
    
    const workTimeData = [];
    
    // Add work time for each expense category
    Object.entries(monthlyExpenses).forEach(([key, value]) => {
      const monthlyAmount = parseFloat(value) || 0;
      if (monthlyAmount > 0) {
        const annualAmount = monthlyAmount * 12;
        const hoursWorkedForExpense = annualAmount / netHourlyWage;
        
        let color;
        switch(key) {
          case 'rent': color = '#CC8899'; break; // Puce color
          case 'wifi': color = '#8B5CF6'; break; // Purple color
          case 'water': color = '#3B82F6'; break; // Blue color
          default: color = workTimeColors[workTimeData.length % workTimeColors.length]; break;
        }
        
        workTimeData.push({
          name: expenseLabels[key],
          value: hoursWorkedForExpense,
          percentage: parseFloat(((hoursWorkedForExpense / workHoursPerYear) * 100).toFixed(1)),
          color: color
        });
      }
    });
    
    // Add work time for new purchase (if any)
    if (costValue > 0) {
      const annualPurchasePayment = monthlyPurchasePayment * 12;
      const hoursWorkedForPurchase = annualPurchasePayment / netHourlyWage;
      workTimeData.push({
        name: 'New Purchase (Total)',
        value: hoursWorkedForPurchase,
        percentage: parseFloat(((hoursWorkedForPurchase / workHoursPerYear) * 100).toFixed(1)),
        color: '#DC2626' // Red color for new purchase
      });
    }
    
    // Add work time for taxes
    if (hoursWorkedForTaxes > 0) {
      workTimeData.push({
        name: 'Taxes',
        value: hoursWorkedForTaxes,
        percentage: parseFloat(((hoursWorkedForTaxes / workHoursPerYear) * 100).toFixed(1)),
        color: '#000000' // Black color for taxes
      });
    }
    
    // Calculate total work time used
    const totalWorkTimeUsed2 = workTimeData.reduce((sum, item) => sum + item.value, 0);
    
    // Add remaining work time (if any)
    const remainingWorkTime2 = workHoursPerYear - totalWorkTimeUsed2;
    if (remainingWorkTime2 > 0) {
      workTimeData.push({
        name: 'Work (Unallocated)',
        value: remainingWorkTime2,
        percentage: parseFloat(((remainingWorkTime2 / workHoursPerYear) * 100).toFixed(1)),
        color: '#10B981' // Green color for unallocated work
      });
    }
    
    // Sort by value (largest first)
    workTimeData.sort((a, b) => b.value - a.value);
    
    annualWorkTimeData = workTimeData;

    // Calculate retirement savings projections
    const calculateRetirementProjections = () => {
      const currentBalance = parseFloat(currentRetirementSavings) || 0;
      
      if (!wageValue) return null;
      
      // Calculate surplus available for retirement savings (only if positive)
      const monthlySurplus = Math.max(0, netMonthlyIncome - totalMonthlyExpenditure);
      
      // Assume 7% annual return for retirement savings
      const annualReturnRate = 0.07;
      const annualSavings = monthlySurplus * 12;
      
      const projections = [];
      const years = [5, 10, 15, 20];
      
      years.forEach(year => {
        // Future value of current balance
        const futureCurrentBalance = currentBalance * Math.pow(1 + annualReturnRate, year);
        
        // Future value of annual contributions
        let futureContributions = 0;
        if (annualSavings > 0) {
          futureContributions = annualSavings * ((Math.pow(1 + annualReturnRate, year) - 1) / annualReturnRate);
        }
        
        const totalProjectedSavings = futureCurrentBalance + futureContributions;
        
        projections.push({
          year: `${year} Years`,
          amount: totalProjectedSavings,
          currentBalance: futureCurrentBalance,
          contributions: futureContributions,
          monthlySurplus: monthlySurplus
        });
      });
      
      return projections;
    };

    const retirementProjections = calculateRetirementProjections();

    setResults({
      hourlyWage: hourlyWage.toFixed(2),
      grossDailyWage: grossDailyWage.toFixed(2),
      dailyTaxes: dailyTaxes.toFixed(2),
      netDailyWage: dailyWage.toFixed(2),
      totalCost: totalCost.toFixed(2),
      hoursToWork: hoursToWork.toFixed(1),
      interestPaid: interestPaid.toFixed(2),
      daysToWork: hoursToWork > 0 ? (hoursToWork / dailyHoursWorked).toFixed(1) : '0.0',
      weeksToWork: hoursToWork > 0 ? (hoursToWork / (dailyHoursWorked * weeklyDaysWorked)).toFixed(1) : '0.0',
      pieData: pieData,
      loanBreakdownData: loanBreakdownData,
      annualTimeData: annualTimeData,
      annualWorkTimeData: annualWorkTimeData,
      monthlyPurchasePayment: monthlyPurchasePayment.toFixed(2),
      totalMonthlyExpenses: totalMonthlyExpenses.toFixed(2),
      // Add shortfall data
      shortfallData: {
        hasShortfall,
        netMonthlyIncome,
        totalMonthlyExpenditure,
        monthlyShortfall: Math.abs(monthlyShortfall),
        workDaysPerMonth
      },
      // Add loan details with additional principal
      loanDetails: {
        interestSaved: loanDetails.interestSaved.toFixed(2),
        timeSaved: loanDetails.timeSaved.toFixed(1),
        baseMonthlyPayment: loanDetails.monthlyPayment.toFixed(2),
        effectiveMonthlyPayment: loanDetails.effectiveMonthlyPayment.toFixed(2),
        additionalPrincipalValue: additionalPrincipalValue,
        additionalPrincipalFreq: additionalPrincipalFreq
      },
      // Add retirement projections
      retirementProjections: retirementProjections
    });
  };

  // Persist income/expense inputs and saved profiles on this device
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        wage, wagePeriod, hoursPerDay, daysPerWeek, taxRate, currentRetirementSavings, monthlyExpenses
      }));
    } catch (e) { /* storage unavailable */ }
  }, [wage, wagePeriod, hoursPerDay, daysPerWeek, taxRate, currentRetirementSavings, monthlyExpenses]);

  useEffect(() => {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(savedExpenses)); } catch (e) { /* storage unavailable */ }
  }, [savedExpenses]);

  useEffect(() => {
    calculate(); // Always calculate, regardless of wage value
  }, [wage, wagePeriod, hoursPerDay, daysPerWeek, taxRate, itemCost, hasLoan, interestRate, loanDuration, durationUnit, additionalPrincipal, additionalPrincipalFreq, monthlyExpenses, currentRetirementSavings]);

  return (
    <div className={`wc-root ${isDark ? 'wc-dark' : ''} min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 antialiased tabular-nums px-4 pb-10 sm:px-6`} style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <style>{DARK_CSS}</style>
      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-2">
            <span className="mr-3 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-sm"><Clock className="h-6 w-6" /></span>
            <h1 className="min-w-0 flex-1 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Don't Get Bamboozled Daily Wage Allocation Calculator</h1>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 ring-1 ring-slate-200/70 shadow-sm transition hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-600/25"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-slate-600">See how every purchase affects your daily income breakdown</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="min-w-0 lg:col-span-2 space-y-6">
            {/* Income & Purchase Card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Income & Purchase Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Your Wage</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={wage}
                      onChange={(e) => setWage(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                    />
                    <select
                      value={wagePeriod}
                      onChange={(e) => setWagePeriod(e.target.value)}
                      className="min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                    >
                      <option value="hourly">per hour</option>
                      <option value="daily">per day</option>
                      <option value="weekly">per week</option>
                      <option value="monthly">per month</option>
                      <option value="yearly">per year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Hours per Work Day</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="24"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    placeholder="8"
                    className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Days per Week</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="7"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    placeholder="5"
                    className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Tax Rate</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="26">26% (Default)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">New Purchase/Service Cost ($)</label>
                  <input
                    type="number"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    placeholder="Enter cost"
                    className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hasLoan"
                    checked={hasLoan}
                    onChange={(e) => setHasLoan(e.target.checked)}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                  />
                  <label htmlFor="hasLoan" className="ml-2 text-sm font-medium text-slate-700">
                    This purchase involves a loan
                  </label>
                </div>

                {hasLoan && (
                  <div className="pl-6 border-l-2 border-teal-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Interest Rate (% per year)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          placeholder="e.g., 5.5"
                          className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Loan Duration</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={loanDuration}
                            onChange={(e) => setLoanDuration(e.target.value)}
                            placeholder="Duration"
                            className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                          />
                          <select
                            value={durationUnit}
                            onChange={(e) => setDurationUnit(e.target.value)}
                            className="min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                          >
                            <option value="months">months</option>
                            <option value="years">years</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Additional Principal Payment</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={additionalPrincipal}
                          onChange={(e) => setAdditionalPrincipal(e.target.value)}
                          placeholder="Extra payment amount"
                          className="flex-1 min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                        <select
                          value={additionalPrincipalFreq}
                          onChange={(e) => setAdditionalPrincipalFreq(e.target.value)}
                          className="min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Optional: Extra payment towards principal to reduce loan term and interest
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Retirement Savings Card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Current Retirement Savings
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Current Retirement Balance ($)</label>
                  <input
                    type="number"
                    value={currentRetirementSavings}
                    onChange={(e) => setCurrentRetirementSavings(e.target.value)}
                    placeholder="Enter current retirement savings"
                    className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Enter your current retirement account balance (401k, IRA, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Expenses Card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-teal-600" />
                Monthly Expenses
              </h2>

              {/* Save/Load Controls */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Profile name (e.g., 'My Budget')"
                    className="flex-1 min-w-0 basis-40 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  />
                  <button
                    onClick={saveExpenseProfile}
                    className="px-4 py-2.5 bg-teal-700 text-white font-medium rounded-xl hover:bg-teal-800 active:scale-[0.98] transition focus:outline-none focus:ring-4 focus:ring-teal-600/25"
                  >
                    Save Profile
                  </button>
                  <button
                    onClick={clearAllExpenses}
                    className="px-4 py-2.5 bg-white text-red-700 font-medium border border-red-200 rounded-xl hover:bg-red-50 active:scale-[0.98] transition focus:outline-none focus:ring-4 focus:ring-red-500/20"
                  >
                    Clear All
                  </button>
                </div>

                {Object.keys(savedExpenses).length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Saved Profiles:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(savedExpenses).map(name => (
                        <div key={name} className="flex items-center bg-white border rounded-xl">
                          <button
                            onClick={() => loadExpenseProfile(name)}
                            className="px-3 py-1 text-sm text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-l-xl"
                          >
                            {name}
                          </button>
                          <button
                            onClick={() => deleteExpenseProfile(name)}
                            className="px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 border-l rounded-r-xl"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(expenseLabels).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
                    <input
                      type="number"
                      value={monthlyExpenses[key]}
                      onChange={(e) => handleExpenseChange(key, e.target.value)}
                      placeholder="$0"
                      className="w-full min-w-0 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base placeholder:text-slate-400 transition focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="min-w-0 space-y-6">
            {/* Additional Principal Benefits Card */}
            {results && results.loanDetails && parseFloat(results.loanDetails.additionalPrincipalValue) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-lg font-bold text-green-800">Additional Principal Payment Benefits</h2>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-green-700 font-medium">Interest Saved:</p>
                      <p className="text-lg font-bold text-green-800">${results.loanDetails.interestSaved}</p>
                    </div>
                    <div>
                      <p className="text-green-700 font-medium">Time Saved:</p>
                      <p className="text-lg font-bold text-green-800">{results.loanDetails.timeSaved} months</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 p-3 rounded-xl border border-green-300">
                    <p className="text-green-800 font-medium text-center">
                      Extra ${results.loanDetails.additionalPrincipalValue} {results.loanDetails.additionalPrincipalFreq} saves you ${results.loanDetails.interestSaved} in interest!
                    </p>
                  </div>

                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-300">
                    <div className="text-teal-800 text-sm space-y-1">
                      <p><strong>Base Monthly Payment:</strong> ${results.loanDetails.baseMonthlyPayment}</p>
                      <p><strong>With Extra Payment:</strong> ${results.loanDetails.effectiveMonthlyPayment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shortfall Warning Card */}
            {results && results.shortfallData && results.shortfallData.hasShortfall && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                  <h2 className="text-lg font-bold text-red-800">Budget Alert: Income Shortfall</h2>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-red-700 font-medium">Monthly Income (Net):</p>
                      <p className="text-lg font-bold text-red-800">${results.shortfallData.netMonthlyIncome.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-red-700 font-medium">Total Monthly Expenses:</p>
                      <p className="text-lg font-bold text-red-800">${results.shortfallData.totalMonthlyExpenditure.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-100 p-3 rounded-xl border border-red-300">
                    <p className="text-red-800 font-bold text-center text-base">
                      Monthly Shortfall: ${results.shortfallData.monthlyShortfall.toFixed(2)}
                    </p>
                    <p className="text-red-700 text-sm text-center mt-1">
                      Your expenses exceed your income by this amount each month
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-300">
                    <p className="text-yellow-800 text-sm">
                      <strong>Warning:</strong> This budget is not sustainable. Consider reducing expenses or increasing income to avoid debt accumulation.
                    </p>
                  </div>

                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-300">
                    {(() => {
                      const shortfall = results.shortfallData.monthlyShortfall;
                      const currentHourlyWage = parseFloat(results.hourlyWage);
                      const taxRatePercent = parseFloat(taxRate) / 100;
                      const netHourlyWage = currentHourlyWage * (1 - taxRatePercent); // Use net hourly wage
                      const currentDailyHours = parseFloat(hoursPerDay) || 8;
                      const currentWeeklyDays = parseFloat(daysPerWeek) || 5;
                      const workDaysPerMonth = results.shortfallData.workDaysPerMonth;
                      
                      // Calculate additional hours needed per day using net wage
                      const additionalHoursPerDay = shortfall / (netHourlyWage * workDaysPerMonth);
                      const totalHoursNeeded = currentDailyHours + additionalHoursPerDay;
                      
                      // Check if it's feasible (assuming max 16 hours/day is realistic)
                      const maxReasonableHours = 16;
                      
                      if (totalHoursNeeded <= maxReasonableHours) {
                        return (
                          <p className="text-teal-800 text-sm">
                            <strong>To cover shortfall:</strong> Work an additional <span className="font-bold">{additionalHoursPerDay.toFixed(1)} hours per day</span> ({totalHoursNeeded.toFixed(1)} total hours/day) at your current net wage of ${netHourlyWage.toFixed(2)}/hour after taxes.
                          </p>
                        );
                      } else {
                        // Calculate required wage for sustainable budget with 20% surplus
                        const totalMonthlyExpenses = results.shortfallData.totalMonthlyExpenditure;
                        const targetMonthlyIncome = totalMonthlyExpenses * 1.2; // 20% surplus
                        const standardWorkHours = 8 * 5 * 4.33; // 8 hours/day, 5 days/week, 4.33 weeks/month
                        const requiredHourlyWage = targetMonthlyIncome / standardWorkHours;
                        
                        return (
                          <p className="text-teal-800 text-sm">
                            <strong>Alternative solution:</strong> Working {maxReasonableHours} hours/day at your current wage, you'd still have a shortfall. Instead, you'll need a job paying <span className="font-bold">${requiredHourlyWage.toFixed(2)}/hour</span>, or <span className="font-bold">${targetMonthlyIncome.toFixed(2)}/month</span> (8 hours/day, 5 days/week) to cover all expenses with a 20% surplus.
                          </p>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card */}
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Summary
              </h2>

              {results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-50 p-3 rounded-xl">
                      <p className="text-xs text-teal-600 font-medium">Hourly Wage</p>
                      <p className="text-xl font-bold text-teal-800">${results.hourlyWage}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <p className="text-xs text-orange-600 font-medium">Gross Daily</p>
                      <p className="text-xl font-bold text-orange-800">${results.grossDailyWage}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-3 rounded-xl">
                      <p className="text-xs text-red-600 font-medium">Daily Taxes</p>
                      <p className="text-xl font-bold text-red-800">${results.dailyTaxes}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                      <p className="text-xs text-green-600 font-medium">Net Daily</p>
                      <p className="text-xl font-bold text-green-800">${results.netDailyWage}</p>
                    </div>
                  </div>

                  {/* Monthly Income vs Expenses */}
                  {results.shortfallData && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-teal-50 p-3 rounded-xl">
                        <p className="text-xs text-teal-600 font-medium">Monthly Income</p>
                        <p className="text-lg font-bold text-teal-800">${results.shortfallData.netMonthlyIncome.toFixed(2)}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${results.shortfallData.hasShortfall ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className={`text-xs font-medium ${results.shortfallData.hasShortfall ? 'text-red-600' : 'text-green-600'}`}>
                          Monthly Expenses
                        </p>
                        <p className={`text-lg font-bold ${results.shortfallData.hasShortfall ? 'text-red-800' : 'text-green-800'}`}>
                          ${results.shortfallData.totalMonthlyExpenditure.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white p-4 rounded-xl text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs opacity-90">Work Time Needed for New Purchase</p>
                    <p className="text-3xl font-bold">{results.hoursToWork} hours</p>
                    <p className="text-base opacity-90">{results.daysToWork} days • {results.weeksToWork} weeks</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Purchase Cost:</span>
                      <span className="font-bold">${results.totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-bold">${results.monthlyPurchasePayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Expenses:</span>
                      <span className="font-bold">${results.totalMonthlyExpenses}</span>
                    </div>
                    {parseFloat(results.interestPaid) > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Interest Paid:</span>
                        <span className="font-bold">${results.interestPaid}</span>
                      </div>
                    )}
                    {results.loanDetails && parseFloat(results.loanDetails.interestSaved) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Interest Saved:</span>
                        <span className="font-bold">${results.loanDetails.interestSaved}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-200 text-center">
                    <p className="text-sm font-medium text-teal-800">
                      Is your purchase worth <span className="font-bold">{results.weeksToWork} weeks</span> of your life?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter wage and purchase details</p>
                </div>
              )}
            </div>

            {/* Pie Chart Card */}
            {results && results.pieData && (
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                  Daily Wage Breakdown
                </h2>

                <div className="h-64 mb-4 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={results.pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({value, percentage}) => percentage > 5 ? `${percentage}%` : ''}
                        labelLine={false}
                      >
                        {results.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={themedColor(entry.color)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: tooltipStyle.color }} formatter={(value) => [`${value.toFixed(2)}`, 'Daily Amount']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {results.pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2 flex-shrink-0" 
                          style={{ backgroundColor: themedColor(item.color) }}
                        ></div>
                        <span className={
                          item.name === 'Taxes' ? 'font-bold' : 
                          item.name.includes('New Purchase') ? 'font-bold text-red-600' : 
                          item.name === 'Shortfall (Deficit)' ? 'font-bold text-red-600' : ''
                        }>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.value.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                {results && results.shortfallData && results.shortfallData.hasShortfall && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800 text-center">
                      <strong>Budget Deficit:</strong> Your daily expenses exceed your net daily income by ${(results.shortfallData.monthlyShortfall / results.shortfallData.workDaysPerMonth).toFixed(2)} per workday
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Loan Breakdown Pie Chart */}
            {results && results.loanBreakdownData && (
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-red-600" />
                  Loan Cost Breakdown
                </h2>

                <div className="h-64 mb-4 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={results.loanBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({percentage}) => `${percentage}%`}
                        labelLine={false}
                      >
                        {results.loanBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={themedColor(entry.color)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: tooltipStyle.color }} formatter={(value) => [`${value.toFixed(2)}`, 'Amount']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {results.loanBreakdownData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2 flex-shrink-0" 
                          style={{ backgroundColor: themedColor(item.color) }}
                        ></div>
                        <span className={item.name === 'Interest' ? 'font-bold text-red-600' : 'font-medium'}>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.value.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Total Cost:</strong> ${(results.loanBreakdownData.reduce((sum, item) => sum + item.value, 0)).toFixed(2)}
                  </p>
                </div>

                {results.loanDetails && parseFloat(results.loanDetails.interestSaved) > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 text-center">
                    <p className="text-sm font-medium text-green-800">
                      Your additional principal payments will save you <span className="font-bold">${results.loanDetails.interestSaved}</span> in interest!
                    </p>
                  </div>
                )}

                {parseFloat(results.interestPaid) > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                    <p className="text-sm font-medium text-red-800">
                      What could you do with an extra <span className="font-bold">${results.interestPaid}</span> if you paid cash for your purchase?
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Annual Time Allocation Chart */}
        {results && results.annualTimeData && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-600" />
                Annual Time Allocation (365 days, or 8,760 Hours)
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={results.annualTimeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percentage, cx, cy, midAngle, innerRadius, outerRadius}) => {
                          if (name === 'Sleep') {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
                                <tspan x={x} dy="-5">{percentage}%</tspan>
                                <tspan x={x} dy="15">(Sleep)</tspan>
                              </text>
                            );
                          }
                          return percentage > 3 ? `${percentage}%` : '';
                        }}
                        labelLine={false}
                      >
                        {results.annualTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={themedColor(entry.color)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: tooltipStyle.color }} formatter={(value) => [`${Math.round(value)} hours`, 'Annual Time']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.annualTimeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3 flex-shrink-0" 
                          style={{ backgroundColor: themedColor(item.color) }}
                        ></div>
                        <span className={
                          item.name === 'Sleep' ? 'font-medium text-slate-700' :
                          item.name === 'Free Time' ? 'font-bold text-green-700' :
                          item.name === 'Taxes' ? 'font-bold text-black' : 
                          item.name.includes('New Purchase') ? 'font-bold text-red-600' : 'font-medium'
                        }>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.round(item.value)} hrs</div>
                        <div className="text-xs text-slate-500">({(item.value / 24).toFixed(1)} days)</div>
                        <div className="text-xs text-slate-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
                <p className="text-sm text-teal-800 text-center">
                  <strong>Your year breakdown:</strong> How you'll spend your 8,760 hours based on current income and expenses
                </p>
                {results.annualTimeData.find(item => item.name === 'Free Time') && (
                  <p className="text-sm text-green-800 text-center mt-2">
                    <strong>Free Time:</strong> {Math.round(results.annualTimeData.find(item => item.name === 'Free Time').value)} hours 
                    ({(Math.round(results.annualTimeData.find(item => item.name === 'Free Time').value) / 24).toFixed(0)} days) 
                    of true freedom per year
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Annual Work Time Allocation Chart */}
        {results && results.annualWorkTimeData && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-orange-600" />
                Annual Work Time Allocation ({(parseFloat(hoursPerDay) || 8) * (parseFloat(daysPerWeek) || 5) * 52} work hours, or {Math.round(((parseFloat(hoursPerDay) || 8) * (parseFloat(daysPerWeek) || 5) * 52) / (parseFloat(hoursPerDay) || 8))} workdays)
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={results.annualWorkTimeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({percentage}) => percentage > 3 ? `${percentage}%` : ''}
                        labelLine={false}
                      >
                        {results.annualWorkTimeData.map((entry, index) => (
                          <Cell key={`work-cell-${index}`} fill={themedColor(entry.color)} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: tooltipStyle.color }} formatter={(value) => [`${Math.round(value)} hours`, 'Work Time']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.annualWorkTimeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-3 flex-shrink-0" 
                          style={{ backgroundColor: themedColor(item.color) }}
                        ></div>
                        <span className={
                          item.name === 'Taxes' ? 'font-bold text-black' : 
                          item.name.includes('New Purchase') ? 'font-bold text-red-600' :
                          item.name === 'Work (Unallocated)' ? 'font-medium text-yellow-700' : 'font-medium'
                        }>
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.round(item.value)} hrs</div>
                        <div className="text-xs text-slate-500">({(item.value / (parseFloat(hoursPerDay) || 8)).toFixed(1)} workdays)</div>
                        <div className="text-xs text-slate-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-800 text-center">
                  <strong>Work Time Breakdown:</strong> How your {Math.round(((parseFloat(hoursPerDay) || 8) * (parseFloat(daysPerWeek) || 5) * 52) / (parseFloat(hoursPerDay) || 8))} workdays per year are allocated to different expenses
                </p>
                {results.annualWorkTimeData.find(item => item.name === 'Work (Unallocated)') && (
                  <p className="text-sm text-yellow-800 text-center mt-2">
                    <strong>Unallocated Work Time:</strong> {Math.round(results.annualWorkTimeData.find(item => item.name === 'Work (Unallocated)').value)} hours 
                    ({(Math.round(results.annualWorkTimeData.find(item => item.name === 'Work (Unallocated)').value) / (parseFloat(hoursPerDay) || 8)).toFixed(1)} workdays) 
                    available for savings or additional expenses
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Retirement Savings Projections Chart */}
        {results && results.retirementProjections && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-5 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Retirement Savings Projections (7% Annual Return)
              </h2>
              
              <div className="h-80 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.retirementProjections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="year" tick={{ fill: axisColor }} stroke={gridStroke} />
                    <YAxis tick={{ fill: axisColor }} stroke={gridStroke} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                        name === 'amount' ? 'Total Projected Savings' : name
                      ]}
                      contentStyle={tooltipStyle}
                      itemStyle={tooltipItemStyle}
                      labelStyle={{ color: tooltipStyle.color }}
                    />
                    <Bar dataKey="amount" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-800">Projection Details</h3>
                  {results.retirementProjections.map((projection, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-xl">
                      <div className="font-medium text-purple-700">{projection.year}</div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>Current Balance Growth: ${projection.currentBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                        <div>New Contributions: ${projection.contributions.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                        <div className="font-medium text-slate-800">Total: ${projection.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                    <h3 className="font-medium text-teal-800 mb-2">Current Situation</h3>
                    <div className="text-sm text-teal-700 space-y-1">
                      <div>Current Retirement Balance: ${(parseFloat(currentRetirementSavings) || 0).toLocaleString('en-US')}</div>
                      <div>Monthly Surplus Available: ${results.retirementProjections[0].monthlySurplus.toFixed(2)}</div>
                      <div>Annual Savings Potential: ${(results.retirementProjections[0].monthlySurplus * 12).toLocaleString('en-US')}</div>
                    </div>
                  </div>

                  {results.retirementProjections[0].monthlySurplus <= 0 && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <h3 className="font-medium text-yellow-800 mb-2">No Surplus for Savings</h3>
                      <p className="text-sm text-yellow-700">
                        Your current expenses exceed or equal your income. Consider reducing expenses or increasing income to build retirement savings.
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h3 className="font-medium text-green-800 mb-2">Assumptions</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 7% annual return (historical stock market average)</li>
                      <li>• Monthly surplus invested consistently</li>
                      <li>• No additional income or expense changes</li>
                      <li>• Compound growth on both existing and new contributions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Visualize how every purchase impacts your daily financial allocation</p>
        </div>
      </div>
    </div>
  );
}