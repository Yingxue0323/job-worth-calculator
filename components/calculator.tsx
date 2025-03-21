"use client";

import React, { useState, useCallback } from 'react';
import { Wallet, Github} from 'lucide-react'; // 保留需要的组件

const SalaryCalculator = () => {
  const [formData, setFormData] = useState({
    /*
    enum: lv1(0.8), lv2(1.0), lv3(1.2)
    */

    // salary
    annualSalary: '', //number

    // life time
    currentAge: '', //number
    retirementAge: '60', //number
    lifeExpectancy: '80', //number

    // work time
    workDaysPerWeek: '5', //number
    workHoursPerDay: '8', //number
    annualLeave: '10', //number
    publicHolidays: '14', //number
    selfPaidCoffee: '', //boolean
    
    // overtime
    overtimeFrequency: 'lv1',
    freeOncall: 'lv1', 

    // slcak off
    paidPoopTime: 'lv2',  
    slcakOffTime: 'lv2',   
    coffeeTime: 'lv2',  
    lunchBreak: 'lv2',

    // commute
    commuteType: 'walk',  // choice
    // walk
    walkTime: '',    // number
    tiredness: 'lv2',
    // drive    
    parkingEase: 'lv2', 
    trafficJam: 'lv2',      
    drivingTime: '',          // number
    // public transport
    waitingTime: '',         // number
    punctuality: 'lv2',
    transitTime: '',          // number
    crowdedness: 'lv2',
    smell: 'lv2',

    // work environment & emotional
    workEnvironment: 'lv2',   
    colleagueQuality: 'lv2',   
    leaderRelation: 'lv2',     
    mentorGuidance: 'lv2',  
    workspaceSize: 'lv2',       
    socialEnvironment: 'lv2',    
    education: 'lv2', 
    quitJob: 'lv1',
    
    // makeup
    makeup: 'lv1', 
    makeupTimePerDay: '0', // number
    discomfort: 'lv2',
  });

  const getCoefficient = (value: string) => {
    if (value === 'lv1') return 0.8;
    if (value === 'lv2') return 1.0;
    if (value === 'lv3') return 1.2;
    return 1;
  }

  /**
   * 1. Economic Value
   *  (annualSalary - additionalCosts) / actualWorkDays
   */
  const actualWorkDaysPerYear = useCallback(() => {
    const totalWorkDays = 52 * Number(formData.workDaysPerWeek);
    const totalLeaves = Number(formData.annualLeave) + Number(formData.publicHolidays);
    return Math.max(totalWorkDays - totalLeaves, 0);
  }, [formData.workDaysPerWeek, formData.annualLeave, formData.publicHolidays]);

  const dailySalary = useCallback(() => {   // also the economic value
    const workingDaysPerYear = actualWorkDaysPerYear();
    const coffeecostPerDay = formData.selfPaidCoffee === 'yes' ? Number(5) : 0;
    const coffeecostPerYear = coffeecostPerDay * workingDaysPerYear;
    return (Number(formData.annualSalary) - coffeecostPerYear) / workingDaysPerYear;  
  }, [formData.annualSalary, actualWorkDaysPerYear, formData.selfPaidCoffee]);

  const hourlySalary = useCallback(() => {
    const dailySalaryValue = dailySalary();
    return dailySalaryValue / Number(formData.workHoursPerDay);
  }, [dailySalary, formData.workHoursPerDay]);


  /**
   * 2. Time Efficiency Factor
   *  effectiveWorkTime / totalInvestedTime
   *  - Effective work time = work hours - slack-off time
   *  - Total invested time = work hours + commute time + overtime + on-call + makeup time
   *
   * Commute time calculation depends on transport method:
   * - Walking: walkingTime * tiredness
   * - Driving: drivingTime * (parkingEase + trafficJam)
   * - Public transport: (waitingTime + transitTime) * crowdedness * punctuality * smell
   */
  const effectiveWorkTime = useCallback(() => {
    const workHours = Number(formData.workHoursPerDay);
    const slackOffTime = Number(formData.paidPoopTime) + Number(formData.slcakOffTime) + 
                    Number(formData.lunchBreak) + Number(formData.coffeeTime);
    return workHours - slackOffTime;
  }, [formData.workHoursPerDay, formData.paidPoopTime, formData.slcakOffTime, 
      formData.lunchBreak, formData.coffeeTime]);

  const commuteTime = useCallback(() => {
    const commuteType = formData.commuteType;
    const walkTime = Number(formData.walkTime);
    const tiredness = getCoefficient(formData.tiredness);

    const drivingTime = Number(formData.drivingTime);
    const parkingEase = getCoefficient(formData.parkingEase);
    const trafficJam = getCoefficient(formData.trafficJam);
    const transitTime = Number(formData.transitTime);
    const waitingTime = Number(formData.waitingTime);
    const crowdedness = getCoefficient(formData.crowdedness);
    const punctuality = getCoefficient(formData.punctuality);
    const smell = getCoefficient(formData.smell);

    return commuteType === 'walk' ? walkTime * tiredness : 
            commuteType === 'drive' ? drivingTime * trafficJam * parkingEase :
            commuteType === 'public' ? (waitingTime + transitTime) * crowdedness * punctuality * smell : 0;
  }, [formData.commuteType, formData.walkTime, formData.tiredness, 
      formData.drivingTime, formData.trafficJam, formData.parkingEase, 
      formData.transitTime, formData.waitingTime, formData.crowdedness, formData.punctuality, formData.smell]);

  const totalInvestedTime = useCallback(() => {
    const workHours = Number(formData.workHoursPerDay);
    const commuteTimeValue = commuteTime();
    const overtimeCoefficient = getCoefficient(formData.overtimeFrequency);
    const oncallCoefficient = getCoefficient(formData.freeOncall);
    const makeupCoefficient = formData.makeup !== 'lv1' ? getCoefficient(formData.makeup) : 0;
    const makeup = Number(formData.makeupTimePerDay) * makeupCoefficient;
    return workHours + commuteTimeValue + (1 * overtimeCoefficient) + (1 * oncallCoefficient) + makeup; // default overtime and oncall is 1 hr, TODO: change to actual value
  }, [formData.workHoursPerDay, commuteTime, formData.overtimeFrequency, formData.freeOncall, formData.makeup, formData.makeupTimePerDay]);
  
  const timeEfficiencyFactor = useCallback(() => {
    return effectiveWorkTime() / totalInvestedTime();
  }, [effectiveWorkTime, totalInvestedTime]);
  
  
  /**
   * 3. Work Environment Factor
   * (workEnvironment + colleagueQuality + leaderRelation + 
   *   mentorGuidance + workspaceSize + socialEnvironment + education) / 7
   */
  const workEnvironmentFactor = useCallback(() => {
    const workEnv = Number(formData.workEnvironment);
    const colleagueQuality = Number(formData.colleagueQuality);
    const leaderRelation = Number(formData.leaderRelation);
    const mentorGuidance = Number(formData.mentorGuidance);
    const workspaceSize = Number(formData.workspaceSize);
    const socialEnv = Number(formData.socialEnvironment);
    const education = Number(formData.education);
    return (workEnv + colleagueQuality + leaderRelation + 
            mentorGuidance + workspaceSize + socialEnv + education) / 7;
  }, [formData.workEnvironment, formData.colleagueQuality, formData.leaderRelation,
      formData.mentorGuidance, formData.workspaceSize, formData.socialEnvironment, formData.education]);
  

  /**
   * 4. Remaining Time Factor
   * (lifeExpectancy - retirementAge) / (lifeExpectancy - currentAge)
   * A coefficient 0~1, indicates the ratio of remaining time
   */
  const lifeTimeFactor = useCallback(() => {
    const lifeExpectancy = Number(formData.lifeExpectancy);
    const retirementAge = Number(formData.retirementAge);
    const currentAge = Number(formData.currentAge);
    return (lifeExpectancy - retirementAge) / (lifeExpectancy - currentAge);
  }, [formData.currentAge, formData.lifeExpectancy, formData.retirementAge]);

  const remainingTime = useCallback(() => {
    const retirementAge = Number(formData.retirementAge);
    const lifeExpectancy = Number(formData.lifeExpectancy);
    const years = lifeExpectancy - retirementAge;
    const days = years * 365;
    return { years, days };
  }, [formData.currentAge, formData.retirementAge, formData.lifeExpectancy]);

  /**
   * 5. Comfort Adjustment
   *  1 - (discomfortFactor * makeupTroubleFactor)
   * - Reduces value based on discomfort and makeup hassle
   */
  const discomfortFactor = useCallback(() => {
    const discomfort = Number(formData.discomfort);
    const wantToQuit = Number(formData.quitJob);
    return discomfort * wantToQuit;
  }, [formData.discomfort, formData.quitJob]);

  /**
   * Final Work Value Index Calculation
   * Formula: economicValue * timeEfficiencyFactor * environmentFactor * lifespanFactor * discomfortFactor
   *
   * Level Mapping:
   * - lv1: 0.8 (low)
   * - lv2: 1.0 (medium)
   * - lv3: 1.2 (high)
   */
  const finalWorkValueIndex = useCallback(() => {
    const economicValue = dailySalary();
    // Below are all coefficients
    const timeEfficiency = timeEfficiencyFactor();
    const workEnvironment = workEnvironmentFactor();
    const lifeTime = lifeTimeFactor();
    const discomfort = discomfortFactor();
    return economicValue * timeEfficiency * workEnvironment * lifeTime * discomfort;
  }, [dailySalary, timeEfficiencyFactor, workEnvironmentFactor, lifeTimeFactor, discomfortFactor]);
  
  const handleInputChange = (name: string, value: string) => {
    // No validation, just set the value
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const value = finalWorkValueIndex();
  
  const getValueAssessment = () => {
    if (!formData.annualSalary) return { text: "Input your annual salary", color: "text-gray-500" };
    
    // Use user's daily salary as the baseline value
    const baseDailySalary = dailySalary();
    // Calculate the baseline value (assuming all coefficients are 1.0)
    // TODO: modify the coefficient ranges
    const baseValue = baseDailySalary * 1.0 * 1.0 * 1.0 * 1.0;
    const relativeValue = value / baseValue;
    
    if (relativeValue < 0.5) return { text: "Living on a Prayer", color: "text-red-500" };  // <50%
    if (relativeValue <= 0.8) return { text: "Just Getting By", color: "text-yellow-500" };  // <80%
    if (relativeValue <= 1.2) return { text: "Living the Dream", color: "text-green-500" };  // <120%
    return { text: "Living Like a King", color: "text-purple-500" };  // >120%
  };

  const RadioGroup = ({ label, name, value, onChange, options }: {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    options: Array<{ label: string; value: string; }>;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-3 py-2 rounded-md text-sm transition-colors
              ${value === option.value 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium' 
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}`}
            onClick={() => onChange(name, option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 text-gray-900 dark:text-white">
      {/* Title section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Work Value Calculator
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Quantify your work value scientifically
        </p>
      </div>

      {/* Main calculation form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 space-y-8">
        {/* 1. Life Time */}
        <section className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Age</label>
              <input
                type="number"
                value={formData.currentAge}
                onChange={(e) => handleInputChange('currentAge', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Retirement Age</label>
              <input
                type="number"
                value={formData.retirementAge}
                onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Life Expectancy</label>
              <input
                type="number"
                value={formData.lifeExpectancy}
                onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* 2. Income */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Income Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Annual Salary (before tax)</label>
              <div className="flex items-center">
                <Wallet className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="number"
                  value={formData.annualSalary}
                  onChange={(e) => handleInputChange('annualSalary', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your annual salary"
                />
              </div>
            </div>
            
            <RadioGroup
              label="Overtime Frequency"
              name="overtimeFrequency"
              value={formData.overtimeFrequency}
              onChange={handleInputChange}
              options={[
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Half Year', value: 'halfYear' }
              ]}
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Overtime Hours Per Time</label>
              <input
                type="number"
                value={formData.overtimeHoursPerTime}
                onChange={(e) => handleInputChange('overtimeHoursPerTime', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <RadioGroup
              label="Weekend/Holiday Free Oncall"
              name="weekendOncall"
              value={formData.weekendOncall}
              onChange={handleInputChange}
              options={[
                { label: '是', value: 'yes' },
                { label: '否', value: 'no' }
              ]}
            />
          </div>
        </section>

        {/* 3. Time Schedule */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Time Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-md font-medium">Work Time</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Work Days Per Week</label>
                <input
                  type="number"
                  value={formData.workDaysPerWeek}
                  onChange={(e) => handleInputChange('workDaysPerWeek', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Work Hours Per Day</label>
                <input
                  type="number"
                  value={formData.workHoursPerDay}
                  onChange={(e) => handleInputChange('workHoursPerDay', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Holiday Schedule</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Annual Leave Days</label>
                <input
                  type="number"
                  value={formData.annualLeave}
                  onChange={(e) => handleInputChange('annualLeave', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Public Holidays Days</label>
                <input
                  type="number"
                  value={formData.publicHolidays}
                  onChange={(e) => handleInputChange('publicHolidays', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Free Time in Work</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Bathroom Time (hours/day)</label>
                <input
                  type="number"
                  value={formData.bathroomTime}
                  onChange={(e) => handleInputChange('bathroomTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slack Off Time (hours/day)</label>
                <input
                  type="number"
                  value={formData.deskFreeTime}
                  onChange={(e) => handleInputChange('deskFreeTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Social Time (hours/day)</label>
                <input
                  type="number"
                  value={formData.socialTime}
                  onChange={(e) => handleInputChange('socialTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lunch Break Time (hours)</label>
                <input
                  type="number"
                  value={formData.lunchBreakTime}
                  onChange={(e) => handleInputChange('lunchBreakTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. 通勤相关 */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Commute</h2>
          <RadioGroup
            label="Select Commute Type"
            name="commuteType"
            value={formData.commuteType}
            onChange={handleInputChange}
            options={[
              { label: 'Walk', value: 'walk' },
              { label: 'Drive', value: 'drive' },
              { label: 'Public', value: 'public' }
            ]}
          />

          {formData.commuteType === 'walk' && (
            <div>
              <label className="block text-sm font-medium mb-2">Walk Time (minutes)</label>
              <input
                type="number"
                value={formData.walkTime}
                onChange={(e) => handleInputChange('walkTime', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          )}

          {formData.commuteType === 'drive' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Fuel/Parking Fee (CNY)</label>
                <input
                  type="number"
                  value={formData.drivingFee}
                  onChange={(e) => handleInputChange('drivingFee', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
              <RadioGroup
                label="Parking Ease"
                name="parkingEase"
                value={formData.parkingEase}
                onChange={handleInputChange}
                options={[
                  { label: '容易', value: 'easy' },
                  { label: '一般', value: 'normal' },
                  { label: '困难', value: 'hard' }
                ]}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Traffic Jam Time (minutes)</label>
                <input
                  type="number"
                  value={formData.trafficJamTime}
                  onChange={(e) => handleInputChange('trafficJamTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Driving Time (minutes)</label>
                <input
                  type="number"
                  value={formData.drivingTime}
                  onChange={(e) => handleInputChange('drivingTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          )}

          {formData.commuteType === 'public' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Waiting Time (minutes)</label>
                <input
                  type="number"
                  value={formData.waitingTime}
                  onChange={(e) => handleInputChange('waitingTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
              <RadioGroup
                label="Punctuality"
                name="punctuality"
                value={formData.punctuality}
                onChange={handleInputChange}
                options={[
                  { label: 'Never', value: 'never' },
                  { label: 'Sometimes', value: 'sometimes' },
                  { label: 'Often', value: 'often' }
                ]}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Transit Time (minutes)</label>
                <input
                  type="number"
                  value={formData.transitTime}
                  onChange={(e) => handleInputChange('transitTime', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              
              <RadioGroup
                label="Crowdedness"
                name="crowdedness"
                value={formData.crowdedness}
                onChange={handleInputChange}
                options={[
                  { label: 'Never', value: 'never' },
                  { label: 'Sometimes', value: 'sometimes' },
                  { label: 'Often', value: 'often' }
                ]}
              />
            </div>
          )}
        </section>

        {/* 5. Work Environment */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Work Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RadioGroup
              label="Colleague Environment"
              name="colleagueQuality"
              value={formData.colleagueQuality}
              onChange={handleInputChange}
              options={[
                { label: 'Most of them are idiots', value: '0.95' },
                { label: 'Normal colleagues', value: '1.0' },
                { label: 'Very few idiots', value: '1.05' }
              ]}
            />
            
            <RadioGroup
              label="Leader Relation"
              name="leaderRelation"
              value={formData.leaderRelation}
              onChange={handleInputChange}
              options={[
                { label: 'Normal', value: '0.8' },
                { label: 'Good', value: '1.0' },
                { label: 'Excellent', value: '1.2' }
              ]}
            />
            
            <RadioGroup
              label="Mentor Guidance"
              name="mentorGuidance"
              value={formData.mentorGuidance}
              onChange={handleInputChange}
              options={[
                { label: 'Dishonest', value: '0.8' },
                { label: 'Normal', value: '1.0' },
                { label: 'Heartfelt', value: '1.2' }
              ]}
            />
            
            <RadioGroup
              label="Workspace Environment"
              name="workspaceSize"
              value={formData.workspaceSize}
              onChange={handleInputChange}
              options={[
                { label: 'Crowded', value: '0.8' },
                { label: 'Normal', value: '1.0' },
                { label: 'Spacious', value: '1.2' }
              ]}
            />
            
            <RadioGroup
              label="Social Environment"
              name="socialEnvironment"
              value={formData.socialEnvironment}
              onChange={handleInputChange}
              options={[
                { label: 'Not many good-looking people', value: '0.95' },
                { label: 'Normal number of good-looking people', value: '1.0' },
                { label: 'Many good-looking people', value: '1.05' }
              ]}
            />
            
            <RadioGroup
              label="Personal Education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              options={[
                { label: 'Tafe', value: '0.8' },
                { label: 'Bachelor', value: '1.0' },
                { label: 'Master', value: '1.4' },
                { label: 'PhD', value: '1.8' }
              ]}
            />
          </div>
        </section>
      </div>

      {/* Result Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-500">You work</div>
            <div className="text-2xl font-bold mt-1">{calculateWorkingDays()} days</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">You think you have</div>
            <div className="text-2xl font-bold mt-1">
              {Number(formData.lifeExpectancy) - Number(formData.currentAge)} years
            </div>
            <div className="text-sm text-gray-500">But excluding work, you only have</div>
            <div className="text-2xl font-bold mt-1">
              {calculateRemainingTime().years} years
              <span className="text-base ml-2">
                ({calculateRemainingTime().days} days)
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Daily Salary</div>
            <div className="text-2xl font-bold mt-1">${calculateDailySalary().toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Hourly Salary</div>
            <div className="text-2xl font-bold mt-1">${calculateHourlySalary().toFixed(2)}</div>
          </div>
          <div className="text-center col-span-2">
            <div className="text-sm text-gray-500">Work Value</div>
            <div className={`text-2xl font-bold mt-1 ${getValueAssessment().color}`}>
              {value.toFixed(2)}
              <span className="text-base ml-2">({getValueAssessment().text})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;