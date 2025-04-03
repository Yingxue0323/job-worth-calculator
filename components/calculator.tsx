"use client"

import { useState, useCallback } from "react"
import { Wallet, Clock, Car, Building, Briefcase, Coffee, Calendar } from "lucide-react"

// Add common style constants
const commonStyles = {
  input:
    "w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
  inputContainer: "max-w-[200px]",
  label: "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5",
  sectionTitle: "text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3",
  subTitle: "text-xs font-medium text-gray-600 dark:text-gray-400 mb-2",
}

const SalaryCalculator = () => {
  const [formData, setFormData] = useState({
    // salary
    annualSalary: "", //number

    // life time
    currentAge: "30", //number
    retirementAge: "60", //number
    lifeExpectancy: "80", //number

    // work time
    workDaysPerWeek: "5", //number
    workHoursPerDay: "8", //number
    annualLeave: "10", //number
    publicHolidays: "14", //number
    selfPaidCoffee: "", //boolean

    // overtime
    overtimeFrequency: "lv1",
    freeOncall: "lv1",

    // slack off
    paidPoopTime: "lv2",
    slackOffTime: "lv2",
    coffeeTime: "lv2",
    lunchBreak: "lv2",

    // commute
    commuteType: "walk", // choice
    // walk
    walkTime: "", // number
    tiredness: "lv2",
    // drive
    parkingEase: "lv2",
    trafficJam: "lv2",
    drivingTime: "", // number
    // public transport
    waitingTime: "", // number
    punctuality: "lv2",
    transitTime: "", // number
    crowdedness: "lv2",
    smell: "lv2",

    // work environment & emotional
    workEnvironment: "lv2",
    colleagueQuality: "lv2",
    leaderRelation: "lv2",
    mentorGuidance: "lv2",
    workspaceSize: "lv2",
    socialEnvironment: "lv2",
    education: "lv2",
    quitJob: "monthly",

    // makeup
    makeup: "lv1",
    makeupTimePerDay: "0", // number
    discomfort: "lv2",
  })

  const [showResults, setShowResults] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const getCoefficient = (value: string) => {
    if (value === "lv1") return 0.8
    if (value === "lv2") return 1.0
    if (value === "lv3") return 1.2
    return 1
  }

  /**
   * 1. Economic Value
   *  (annualSalary - additionalCosts) / actualWorkDays
   */
  const actualWorkDaysPerYear = useCallback(() => {
    const totalWorkDays = 52 * Number(formData.workDaysPerWeek)
    const totalLeaves = Number(formData.annualLeave) + Number(formData.publicHolidays)
    return Math.max(totalWorkDays - totalLeaves, 0)
  }, [formData.workDaysPerWeek, formData.annualLeave, formData.publicHolidays])

  const dailySalary = useCallback(() => {
    // also the economic value
    const workingDaysPerYear = actualWorkDaysPerYear()
    const coffeecostPerDay = formData.selfPaidCoffee === "yes" ? Number(5) : 0
    const coffeecostPerYear = coffeecostPerDay * workingDaysPerYear
    return (Number(formData.annualSalary) - coffeecostPerYear) / workingDaysPerYear
  }, [formData.annualSalary, actualWorkDaysPerYear, formData.selfPaidCoffee])

  const hourlySalary = useCallback(() => {
    const dailySalaryValue = dailySalary()
    return dailySalaryValue / Number(formData.workHoursPerDay)
  }, [dailySalary, formData.workHoursPerDay])

  /**
   * 2. Time Efficiency Factor
   *  effectiveWorkTime / totalInvestedTime
   *  - Effective work time = work hours - slack-off time
   *  - Total invested time = work hours + commute time + overtime + on-call + makeup time
   */
  const effectiveWorkTime = useCallback(() => {
    const workHours = Number(formData.workHoursPerDay)
    const slackOffTime =
      Number(formData.paidPoopTime) +
      Number(formData.slackOffTime) +
      Number(formData.lunchBreak) +
      Number(formData.coffeeTime)
    return workHours - slackOffTime
  }, [formData.workHoursPerDay, formData.paidPoopTime, formData.slackOffTime, formData.lunchBreak, formData.coffeeTime])

  const commuteTime = useCallback(() => {
    const commuteType = formData.commuteType
    const walkTime = Number(formData.walkTime)
    const tiredness = getCoefficient(formData.tiredness)

    const drivingTime = Number(formData.drivingTime)
    const parkingEase = getCoefficient(formData.parkingEase)
    const trafficJam = getCoefficient(formData.trafficJam)
    const transitTime = Number(formData.transitTime)
    const waitingTime = Number(formData.waitingTime)
    const crowdedness = getCoefficient(formData.crowdedness)
    const punctuality = getCoefficient(formData.punctuality)
    const smell = getCoefficient(formData.smell)

    return commuteType === "walk"
      ? walkTime * tiredness
      : commuteType === "drive"
        ? drivingTime * trafficJam * parkingEase
        : commuteType === "public"
          ? (waitingTime + transitTime) * crowdedness * punctuality * smell
          : 0
  }, [
    formData.commuteType,
    formData.walkTime,
    formData.tiredness,
    formData.drivingTime,
    formData.trafficJam,
    formData.parkingEase,
    formData.transitTime,
    formData.waitingTime,
    formData.crowdedness,
    formData.punctuality,
    formData.smell,
  ])

  const totalInvestedTime = useCallback(() => {
    const workHours = Number(formData.workHoursPerDay)
    const commuteTimeValue = commuteTime()
    const overtimeCoefficient = getCoefficient(formData.overtimeFrequency)
    const oncallCoefficient = getCoefficient(formData.freeOncall)
    const makeupCoefficient = formData.makeup !== "lv1" ? getCoefficient(formData.makeup) : 0
    const makeup = Number(formData.makeupTimePerDay) * makeupCoefficient
    return workHours + commuteTimeValue + 1 * overtimeCoefficient + 1 * oncallCoefficient + makeup // default overtime and oncall is 1 hr
  }, [
    formData.workHoursPerDay,
    commuteTime,
    formData.overtimeFrequency,
    formData.freeOncall,
    formData.makeup,
    formData.makeupTimePerDay,
  ])

  const timeEfficiencyFactor = useCallback(() => {
    return effectiveWorkTime() / totalInvestedTime()
  }, [effectiveWorkTime, totalInvestedTime])

  /**
   * 3. Work Environment Factor
   * (workEnvironment + colleagueQuality + leaderRelation +
   *   mentorGuidance + workspaceSize + socialEnvironment + education) / 7
   */
  const workEnvironmentFactor = useCallback(() => {
    const workEnv = getCoefficient(formData.workEnvironment)
    const colleagueQuality = getCoefficient(formData.colleagueQuality)
    const leaderRelation = getCoefficient(formData.leaderRelation)
    const mentorGuidance = getCoefficient(formData.mentorGuidance)
    const workspaceSize = getCoefficient(formData.workspaceSize)
    const socialEnv = getCoefficient(formData.socialEnvironment)
    const education = getCoefficient(formData.education)
    return (workEnv + colleagueQuality + leaderRelation + mentorGuidance + workspaceSize + socialEnv + education) / 7
  }, [
    formData.workEnvironment,
    formData.colleagueQuality,
    formData.leaderRelation,
    formData.mentorGuidance,
    formData.workspaceSize,
    formData.socialEnvironment,
    formData.education,
  ])

  /**
   * 4. Remaining Time Factor
   * (lifeExpectancy - retirementAge) / (lifeExpectancy - currentAge)
   * A coefficient 0~1, indicates the ratio of remaining time
   */
  const lifeTimeFactor = useCallback(() => {
    const lifeExpectancy = Number(formData.lifeExpectancy)
    const retirementAge = Number(formData.retirementAge)
    const currentAge = Number(formData.currentAge)
    return (lifeExpectancy - retirementAge) / (lifeExpectancy - currentAge)
  }, [formData.currentAge, formData.lifeExpectancy, formData.retirementAge])

  const remainingTime = useCallback(() => {
    const retirementAge = Number(formData.retirementAge)
    const lifeExpectancy = Number(formData.lifeExpectancy)
    const years = lifeExpectancy - retirementAge
    const days = years * 365
    return { years, days }
  }, [formData.retirementAge, formData.lifeExpectancy])

  /**
   * 5. Comfort Adjustment
   *  1 - (discomfortFactor * makeupTroubleFactor)
   * - Reduces value based on discomfort and makeup hassle
   */
  const discomfortFactor = useCallback(() => {
    const discomfort = getCoefficient(formData.discomfort)
    const quitFactor =
      {
        daily: 1.2,
        weekly: 1.0,
        monthly: 0.8,
        never: 0.6,
      }[formData.quitJob] || 1.0

    return discomfort * quitFactor
  }, [formData.discomfort, formData.quitJob])

  /**
   * Final Work Value Index Calculation
   * Formula: economicValue * timeEfficiencyFactor * environmentFactor * lifespanFactor * discomfortFactor
   */
  const finalWorkValueIndex = useCallback(() => {
    const economicValue = dailySalary()
    // Below are all coefficients
    const timeEfficiency = timeEfficiencyFactor()
    const workEnvironment = workEnvironmentFactor()
    const lifeTime = lifeTimeFactor()
    const discomfort = discomfortFactor()
    return economicValue * timeEfficiency * workEnvironment * lifeTime * discomfort
  }, [dailySalary, timeEfficiencyFactor, workEnvironmentFactor, lifeTimeFactor, discomfortFactor])

  const handleInputChange = (name: string, value: string) => {
    // No validation, just set the value
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const value = finalWorkValueIndex()

  const getValueAssessment = () => {
    if (!formData.annualSalary) return { text: "Input your annual salary", color: "text-gray-500" }

    // Use user's daily salary as the baseline value
    const baseDailySalary = dailySalary()
    // Calculate the baseline value (assuming all coefficients are 1.0)
    const baseValue = baseDailySalary * 1.0 * 1.0 * 1.0 * 1.0
    const relativeValue = value / baseValue

    if (relativeValue < 0.5) return { text: "Living on a Prayer", color: "text-red-500" } // <50%
    if (relativeValue <= 0.8) return { text: "Just Getting By", color: "text-yellow-500" } // <80%
    if (relativeValue <= 1.2) return { text: "Living the Dream", color: "text-green-500" } // <120%
    return { text: "Living Like a King", color: "text-purple-500" } // >120%
  }

  const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    options,
  }: {
    label: string
    name: string
    value: string
    onChange: (name: string, value: string) => void
    options: Array<{ label: string; value: string }>
  }) => (
    <div className="space-y-1.5">
      <label className={commonStyles.label}>{label}</label>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-2 py-1.5 rounded-md text-xs transition-colors
              ${
                value === option.value
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 font-medium"
                  : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              }`}
            onClick={() => onChange(name, option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )

  const typeWriter = (text: string) => {
    setIsTyping(true)
    let index = 0
    setTypedText("")

    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText((prev) => prev + text.charAt(index))
        index++
      } else {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 10)
  }

  const generateResultText = () => {
    const workDays = actualWorkDaysPerYear()
    const totalYears = Number(formData.lifeExpectancy) - Number(formData.currentAge)
    const remainingYears = remainingTime().years
    const remainingDays = remainingTime().days
    const dailyPay = dailySalary().toFixed(2)
    const hourlyPay = hourlySalary().toFixed(2)
    const assessment = getValueAssessment()

    return `
Dear friend,

Let me tell you about your work life...

You work <strong>${workDays}</strong> days every year, which might sound like a lot.

You think you have <strong>${totalYears}</strong> years ahead of you,
but after excluding work time, you only have <strong>${remainingYears}</strong> years (<strong>${remainingDays}</strong> days) for yourself.

Your daily compensation is $<strong>${dailyPay}</strong>,
which breaks down to $<strong>${hourlyPay}</strong> per hour.

Based on our comprehensive analysis, your work-life value index is <strong>${value.toFixed(2)}</strong>.
This means you are "${assessment.text}".

Remember, life is not just about work.
Make every moment count!
`
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Title section */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Work Value Calculator
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">Quantify your work value scientifically</p>
      </div>

      {/* Main calculation form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-8">
        {/* 1. Basic Information */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Calendar className="inline-block w-5 h-5 mr-2 text-blue-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={commonStyles.label}>Current Age</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.currentAge}
                  onChange={(e) => handleInputChange("currentAge", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div>
              <label className={commonStyles.label}>Retirement Age</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.retirementAge}
                  onChange={(e) => handleInputChange("retirementAge", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div>
              <label className={commonStyles.label}>Life Expectancy</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.lifeExpectancy}
                  onChange={(e) => handleInputChange("lifeExpectancy", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Income */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Wallet className="inline-block w-5 h-5 mr-2 text-green-500" />
            Income Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={commonStyles.label}>Annual Salary (before tax)</label>
              <div className={`flex items-center ${commonStyles.inputContainer}`}>
                <input
                  type="number"
                  value={formData.annualSalary}
                  onChange={(e) => handleInputChange("annualSalary", e.target.value)}
                  className={commonStyles.input}
                  placeholder="Enter your annual salary"
                />
              </div>
            </div>

            <div>
              <label className={commonStyles.label}>Self-paid Coffee</label>
              <RadioGroup
                label=""
                name="selfPaidCoffee"
                value={formData.selfPaidCoffee}
                onChange={handleInputChange}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                  { label: "N/A", value: "" },
                ]}
              />
            </div>

            <RadioGroup
              label="Overtime Frequency"
              name="overtimeFrequency"
              value={formData.overtimeFrequency}
              onChange={handleInputChange}
              options={[
                { label: "Rarely", value: "lv1" },
                { label: "Sometimes", value: "lv2" },
                { label: "Often", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Weekend/Holiday Free Oncall"
              name="freeOncall"
              value={formData.freeOncall}
              onChange={handleInputChange}
              options={[
                { label: "Rarely", value: "lv1" },
                { label: "Sometimes", value: "lv2" },
                { label: "Often", value: "lv3" },
              ]}
            />
          </div>
        </section>

        {/* 3. Time Schedule */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Clock className="inline-block w-5 h-5 mr-2 text-orange-500" />
            Time Schedule
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className={commonStyles.label}>Work Days Per Week</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.workDaysPerWeek}
                  onChange={(e) => handleInputChange("workDaysPerWeek", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div>
              <label className={commonStyles.label}>Work Hours Per Day</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.workHoursPerDay}
                  onChange={(e) => handleInputChange("workHoursPerDay", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div>
              <label className={commonStyles.label}>Annual Leave Days</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.annualLeave}
                  onChange={(e) => handleInputChange("annualLeave", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
            <div>
              <label className={commonStyles.label}>Public Holidays</label>
              <div className={commonStyles.inputContainer}>
                <input
                  type="number"
                  value={formData.publicHolidays}
                  onChange={(e) => handleInputChange("publicHolidays", e.target.value)}
                  className={commonStyles.input}
                />
              </div>
            </div>
          </div>

          {/* Free Time in Work */}
          <div className="mt-6">
            <h3 className={commonStyles.subTitle}>Free Time During Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RadioGroup
                label="Paid Poop Time"
                name="paidPoopTime"
                value={formData.paidPoopTime}
                onChange={handleInputChange}
                options={[
                  { label: "Rarely", value: "lv1" },
                  { label: "Sometimes", value: "lv2" },
                  { label: "Often", value: "lv3" },
                ]}
              />
              <RadioGroup
                label="Slack Off Time"
                name="slackOffTime"
                value={formData.slackOffTime}
                onChange={handleInputChange}
                options={[
                  { label: "Rarely", value: "lv1" },
                  { label: "Sometimes", value: "lv2" },
                  { label: "Often", value: "lv3" },
                ]}
              />
              <RadioGroup
                label="Coffee Time"
                name="coffeeTime"
                value={formData.coffeeTime}
                onChange={handleInputChange}
                options={[
                  { label: "Rarely", value: "lv1" },
                  { label: "Sometimes", value: "lv2" },
                  { label: "Often", value: "lv3" },
                ]}
              />
              <RadioGroup
                label="Lunch Break"
                name="lunchBreak"
                value={formData.lunchBreak}
                onChange={handleInputChange}
                options={[
                  { label: "Short", value: "lv1" },
                  { label: "Normal", value: "lv2" },
                  { label: "Long", value: "lv3" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Commute */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Car className="inline-block w-5 h-5 mr-2 text-purple-500" />
            Commute
          </h2>
          <div className="space-y-4">
            <RadioGroup
              label="Select Commute Type"
              name="commuteType"
              value={formData.commuteType}
              onChange={handleInputChange}
              options={[
                { label: "Walk", value: "walk" },
                { label: "Drive", value: "drive" },
                { label: "Public", value: "public" },
              ]}
            />

            {formData.commuteType === "walk" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className={commonStyles.label}>Walk Time (minutes)</label>
                  <div className={commonStyles.inputContainer}>
                    <input
                      type="number"
                      value={formData.walkTime}
                      onChange={(e) => handleInputChange("walkTime", e.target.value)}
                      className={commonStyles.input}
                    />
                  </div>
                </div>
                <RadioGroup
                  label="Tiredness Level"
                  name="tiredness"
                  value={formData.tiredness}
                  onChange={handleInputChange}
                  options={[
                    { label: "Low", value: "lv1" },
                    { label: "Medium", value: "lv2" },
                    { label: "High", value: "lv3" },
                  ]}
                />
              </div>
            )}

            {formData.commuteType === "drive" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className={commonStyles.label}>Driving Time (minutes)</label>
                  <div className={commonStyles.inputContainer}>
                    <input
                      type="number"
                      value={formData.drivingTime}
                      onChange={(e) => handleInputChange("drivingTime", e.target.value)}
                      className={commonStyles.input}
                    />
                  </div>
                </div>
                <RadioGroup
                  label="Parking Ease"
                  name="parkingEase"
                  value={formData.parkingEase}
                  onChange={handleInputChange}
                  options={[
                    { label: "Easy", value: "lv1" },
                    { label: "Normal", value: "lv2" },
                    { label: "Difficult", value: "lv3" },
                  ]}
                />
                <RadioGroup
                  label="Traffic Jam"
                  name="trafficJam"
                  value={formData.trafficJam}
                  onChange={handleInputChange}
                  options={[
                    { label: "Rarely", value: "lv1" },
                    { label: "Sometimes", value: "lv2" },
                    { label: "Often", value: "lv3" },
                  ]}
                />
              </div>
            )}

            {formData.commuteType === "public" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className={commonStyles.label}>Waiting Time (minutes)</label>
                  <div className={commonStyles.inputContainer}>
                    <input
                      type="number"
                      value={formData.waitingTime}
                      onChange={(e) => handleInputChange("waitingTime", e.target.value)}
                      className={commonStyles.input}
                    />
                  </div>
                </div>
                <div>
                  <label className={commonStyles.label}>Transit Time (minutes)</label>
                  <div className={commonStyles.inputContainer}>
                    <input
                      type="number"
                      value={formData.transitTime}
                      onChange={(e) => handleInputChange("transitTime", e.target.value)}
                      className={commonStyles.input}
                    />
                  </div>
                </div>
                <RadioGroup
                  label="Punctuality"
                  name="punctuality"
                  value={formData.punctuality}
                  onChange={handleInputChange}
                  options={[
                    { label: "Poor", value: "lv1" },
                    { label: "Average", value: "lv2" },
                    { label: "Good", value: "lv3" },
                  ]}
                />
                <RadioGroup
                  label="Crowdedness"
                  name="crowdedness"
                  value={formData.crowdedness}
                  onChange={handleInputChange}
                  options={[
                    { label: "Empty", value: "lv1" },
                    { label: "Normal", value: "lv2" },
                    { label: "Packed", value: "lv3" },
                  ]}
                />
                <RadioGroup
                  label="Smell"
                  name="smell"
                  value={formData.smell}
                  onChange={handleInputChange}
                  options={[
                    { label: "Pleasant", value: "lv1" },
                    { label: "Neutral", value: "lv2" },
                    { label: "Unpleasant", value: "lv3" },
                  ]}
                />
              </div>
            )}
          </div>
        </section>

        {/* 5. Work Environment */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Building className="inline-block w-5 h-5 mr-2 text-cyan-500" />
            Work Environment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RadioGroup
              label="Colleague Quality"
              name="colleagueQuality"
              value={formData.colleagueQuality}
              onChange={handleInputChange}
              options={[
                { label: "Poor", value: "lv1" },
                { label: "Average", value: "lv2" },
                { label: "Excellent", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Leader Relation"
              name="leaderRelation"
              value={formData.leaderRelation}
              onChange={handleInputChange}
              options={[
                { label: "Poor", value: "lv1" },
                { label: "Good", value: "lv2" },
                { label: "Excellent", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Mentor Guidance"
              name="mentorGuidance"
              value={formData.mentorGuidance}
              onChange={handleInputChange}
              options={[
                { label: "Minimal", value: "lv1" },
                { label: "Adequate", value: "lv2" },
                { label: "Excellent", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Workspace Size"
              name="workspaceSize"
              value={formData.workspaceSize}
              onChange={handleInputChange}
              options={[
                { label: "Cramped", value: "lv1" },
                { label: "Adequate", value: "lv2" },
                { label: "Spacious", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Social Environment"
              name="socialEnvironment"
              value={formData.socialEnvironment}
              onChange={handleInputChange}
              options={[
                { label: "Poor", value: "lv1" },
                { label: "Average", value: "lv2" },
                { label: "Excellent", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="Education Level"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              options={[
                { label: "Basic", value: "lv1" },
                { label: "Bachelor", value: "lv2" },
                { label: "Advanced", value: "lv3" },
              ]}
            />
          </div>
        </section>

        {/* 6. Makeup */}
        <section className="space-y-4">
          <h2 className={commonStyles.sectionTitle}>
            <Briefcase className="inline-block w-5 h-5 mr-2 text-pink-500" />
            Personal Factors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RadioGroup
              label="Do you need makeup for work?"
              name="makeup"
              value={formData.makeup}
              onChange={handleInputChange}
              options={[
                { label: "No", value: "lv1" },
                { label: "Sometimes", value: "lv2" },
                { label: "Always", value: "lv3" },
              ]}
            />

            <RadioGroup
              label="How often do you think about quitting?"
              name="quitJob"
              value={formData.quitJob}
              onChange={handleInputChange}
              options={[
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Never", value: "never" },
              ]}
            />

            {formData.makeup !== "lv1" && (
              <>
                <div>
                  <label className={commonStyles.label}>Makeup Time Per Day (minutes)</label>
                  <div className={commonStyles.inputContainer}>
                    <input
                      type="number"
                      value={formData.makeupTimePerDay}
                      onChange={(e) => handleInputChange("makeupTimePerDay", e.target.value)}
                      className={commonStyles.input}
                    />
                  </div>
                </div>

                <RadioGroup
                  label="Makeup Discomfort Level"
                  name="discomfort"
                  value={formData.discomfort}
                  onChange={handleInputChange}
                  options={[
                    { label: "Comfortable", value: "lv1" },
                    { label: "Bearable", value: "lv2" },
                    { label: "Uncomfortable", value: "lv3" },
                  ]}
                />
              </>
            )}

            {formData.quitJob === "never" && (
              <div className="col-span-2 mt-2 text-sm text-red-500 dark:text-red-400 italic">
                Why are you here friend? 🤔
              </div>
            )}
          </div>
        </section>

        {/* Calculate Button */}
        {!showResults && (
          <div className="text-center py-6">
            <button
              onClick={() => {
                setShowResults(true)
                typeWriter(generateResultText())
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm transition-all
                shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:from-blue-700 hover:to-purple-700"
            >
              <Coffee className="inline-block w-4 h-4 mr-2" />
              Calculate My Work Value
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      {showResults && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg">
          <div
            className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: typedText.replace(
                /<strong>(.*?)<\/strong>/g,
                '<span class="text-lg font-bold text-gray-900 dark:text-white">$1</span>',
              ),
            }}
          />
          {!isTyping && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowResults(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
              >
                Back to Calculator
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SalaryCalculator

