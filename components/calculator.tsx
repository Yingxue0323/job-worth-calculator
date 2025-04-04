"use client"

import { useState, useCallback, useEffect } from "react"
import { Wallet, Clock, Car, Building, Coffee, Calendar, Heart, Star, Sparkles, Briefcase } from "lucide-react"

// Add common style constants with updated cool styling
const commonStyles = {
  input:
    "w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 transition-all",
  inputContainer: "max-w-[220px]",
  label: "block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2",
  sectionTitle: "text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center",
  subTitle: "text-sm font-medium text-gray-500 dark:text-gray-400 mb-3",
  sectionContainer: "space-y-6 border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0",
}

const SalaryCalculator = () => {
  const [formData, setFormData] = useState({
    // salary
    annualSalary: "0", //number

    // life time
    currentAge: "30", //number
    retirementAge: "60", //number
    lifeExpectancy: "80", //number

    // work time
    workDaysPerWeek: "5", //number
    workHoursPerDay: "8", //number
    annualLeave: "10", //number
    publicHolidays: "14", //number
    selfPaidCoffee: "yes", //boolean

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
  const [activeTab, setActiveTab] = useState("walk")

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
    <div className="space-y-2.5">
      <label className={commonStyles.label}>{label}</label>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((option) => (
          <button
            key={option.value}
            className={`px-4 py-2.5 rounded-lg text-sm transition-all
            ${
              value === option.value
                ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 font-medium border-2 border-blue-400 dark:border-blue-600"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 border border-transparent"
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

Let me tell you about your work life... ✨

You work <strong>${workDays}</strong> days every year, which might sound like a lot.

You think you have <strong>${totalYears}</strong> years ahead of you,
but after excluding work time, you only have <strong>${remainingYears}</strong> years (<strong>${remainingDays}</strong> days) for yourself.

Your daily compensation is $<strong>${dailyPay}</strong>,
which breaks down to $<strong>${hourlyPay}</strong> per hour.

Based on our comprehensive analysis, your work-life value index is <strong>${value.toFixed(2)}</strong>.
This means you are "${assessment.text}".

Remember, life is not just about work.
Make every moment count! 💖
`
  }

  useEffect(() => {
    // Update active tab when commute type changes
    setActiveTab(formData.commuteType)
  }, [formData.commuteType])

  return (
    <div className="relative max-w-4xl mx-auto p-6 space-y-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* <FloatingBubbles /> */}
      </div>

      {/* Title section */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="relative">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-600">
              Work Value Calculator
            </h1>
            <Sparkles className="absolute -top-4 -right-8 w-6 h-6 text-blue-400" />
            <Star className="absolute -bottom-2 -left-6 w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          Find out if your job is worth your precious time ✨
        </p>
      </div>

      {/* Main calculation form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-10 border-2 border-blue-100 dark:border-blue-900">
        {/* 1. Basic Information */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Calendar className="inline-block w-6 h-6 mr-3 text-blue-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <label className={commonStyles.label}>Hope you can retire at</label>
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
              <label className={commonStyles.label}>Hope you can live to</label>
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
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Wallet className="inline-block w-6 h-6 mr-3 text-green-500" />
            Income Information
          </h2>
          <div className="grid grid-cols-1 gap-8">
            <div>
              <label className={commonStyles.label}>Annual Salary (won't be compared with others)</label>
              <div className="max-w-xs">
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
              <RadioGroup
                label="Do you pay for coffee by yourself in work days?"
                name="selfPaidCoffee"
                value={formData.selfPaidCoffee}
                onChange={handleInputChange}
                options={[
                  { label: "Oh God, Yes 😭", value: "yes" },
                  { label: "I'm not a coffee addict/My company pays for it 😎", value: "no" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <RadioGroup
                label="How often do you work overtime?"
                name="overtimeFrequency"
                value={formData.overtimeFrequency}
                onChange={handleInputChange}
                options={[
                  { label: "Rarely, yeppie! 🎉", value: "1.2" },
                  { label: "Sometimes, I'm ok with it 🙂", value: "1.0" },
                  { label: "Often, hate it 😠", value: "0.8" },
                ]}
              />

              <RadioGroup
                label="Do you have weekend/holiday free oncall?"
                name="freeOncall"
                value={formData.freeOncall}
                onChange={handleInputChange}
                options={[
                  { label: "I don't pickup any calls from work 🙉", value: "1.2" },
                  { label: "Sometimes I have to but got paid 💰", value: "1.0" },
                  { label: "Often and unpaid 😭", value: "0.8" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 3. Time Schedule */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Clock className="inline-block w-6 h-6 mr-3 text-cyan-500" />
            Hopefully your job is legal, finger crossed 🤞
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
          <div className="mt-8 bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Free Time During Work 🕒</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <RadioGroup
                label="Paid Poop Time"
                name="paidPoopTime"
                value={formData.paidPoopTime}
                onChange={handleInputChange}
                options={[
                  { label: "I poop very quick and save every second for work 🏃", value: "0.8" },
                  { label: "I want to poop longer but better not to 🚽", value: "1.0" },
                  { label: "I can hold it for over 10 minutes and my company pays me for it 💰", value: "1.2" },
                ]}
              />
              <RadioGroup
                label="Slack Off Desk Time"
                name="slackOffTime"
                value={formData.slackOffTime}
                onChange={handleInputChange}
                options={[
                  { label: "I don't have a desk/There's a camera in front of me 📹", value: "0.8" },
                  { label: "I can slack off for 10 minutes, then must back to work ⏱️", value: "1.0" },
                  { label: "I can slack off for whatever I want 😎", value: "1.2" },
                ]}
              />
              <RadioGroup
                label="Coffee Time"
                name="coffeeTime"
                value={formData.coffeeTime}
                onChange={handleInputChange}
                options={[
                  { label: "Love the coffee time with colleagues, can stay for hours ☕", value: "1.2" },
                  { label: "Quick coffee break ⏱️", value: "1.0" },
                  { label: "I don't have time for coffee break 😢", value: "0.8" },
                ]}
              />
              <RadioGroup
                label="Lunch Break"
                name="lunchBreak"
                value={formData.lunchBreak}
                onChange={handleInputChange}
                options={[
                  { label: "Enjoy lunch as I can, can stay for hours 🍱", value: "1.2" },
                  { label: "I don't have time for lunch break 😭", value: "0.8" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Commute */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Car className="inline-block w-6 h-6 mr-3 text-blue-500" />
            Does commute take too much time? 🚗
          </h2>

          {/* Horizontal Navigation Bar */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === "walk"
                  ? "border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("walk")
                handleInputChange("commuteType", "walk")
              }}
            >
              Walk 🚶
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === "drive"
                  ? "border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("drive")
                handleInputChange("commuteType", "drive")
              }}
            >
              Drive/Uber 🚗
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
                activeTab === "public"
                  ? "border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("public")
                handleInputChange("commuteType", "public")
              }}
            >
              Public Transport 🚆
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === "walk" && (
              <div className="bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    label="Feel good about walking to work?"
                    name="tiredness"
                    value={formData.tiredness}
                    onChange={handleInputChange}
                    options={[
                      { label: "Yes love it, refreshing 🌿", value: "1.2" },
                      { label: "I don't mind it, but I'm not a fan 🤷", value: "1.0" },
                      { label: "I hate it especially in rainy and cold days ☔", value: "0.8" },
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === "drive" && (
              <div className="bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    label="Easy to find parking?"
                    name="parkingEase"
                    value={formData.parkingEase}
                    onChange={handleInputChange}
                    options={[
                      { label: "Yes, I can find a parking spot easily 🅿️", value: "1.2" },
                      { label: "I can bear it, but I'm not a fan 🤷", value: "1.0" },
                      { label: "I look for a parking spot for 30 minutes everyday 😡", value: "0.8" },
                    ]}
                  />
                  <RadioGroup
                    label="Let's talk about traffic jam"
                    name="trafficJam"
                    value={formData.trafficJam}
                    onChange={handleInputChange}
                    options={[
                      { label: "Luckily I don't have to deal with it 🍀", value: "1.2" },
                      { label: "I can bear it 🚦", value: "1.0" },
                      { label: "I hate it, it's a nightmare 😱", value: "0.8" },
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === "public" && (
              <div className="bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={commonStyles.label}>How long do you walk to the station? (minutes)</label>
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
                    <label className={commonStyles.label}>How long do you wait for the train/bus? (minutes)</label>
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
                    label="Is it punctual?"
                    name="punctuality"
                    value={formData.punctuality}
                    onChange={handleInputChange}
                    options={[
                      { label: "Everyday it's 100% punctual ⏰", value: "1.2" },
                      { label: "Sometimes it's late, but I can bear it 🤷", value: "1.0" },
                      { label: "Hate it, never punctual, hate Google Maps schedules 😡", value: "0.8" },
                    ]}
                  />
                  <RadioGroup
                    label="How crowded is the train/bus?"
                    name="crowdedness"
                    value={formData.crowdedness}
                    onChange={handleInputChange}
                    options={[
                      { label: "Empty, I can always sit down 🪑", value: "1.2" },
                      { label: "Normal, I can bear it 🧍", value: "1.0" },
                      { label: "Packed, I can't breathe, feel backpain/legpain 😫", value: "0.8" },
                    ]}
                  />
                  <RadioGroup
                    label="How was the smell on the train/bus?"
                    name="smell"
                    value={formData.smell}
                    onChange={handleInputChange}
                    options={[
                      { label: "Not much people so it's ok 👃", value: "1.2" },
                      { label: "I can bear it, but I'm not a fan 🤷", value: "1.0" },
                      { label: "Ewwww.....I need a mask 😷", value: "0.8" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. Work Environment */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Building className="inline-block w-6 h-6 mr-3 text-cyan-500" />
            Work Environment
          </h2>
          <div className="mt-8 bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <RadioGroup
                label="How good are your colleagues?"
                name="colleagueQuality"
                value={formData.colleagueQuality}
                onChange={handleInputChange}
                options={[
                  { label: "Most of them are idiots 🙄", value: "0.8" },
                  { label: "Average idiots 🤷", value: "1.0" },
                  { label: "Only a few idiots 😊", value: "1.2" },
                ]}
              />

              <RadioGroup
                label="How good is your leader?"
                name="leaderRelation"
                value={formData.leaderRelation}
                onChange={handleInputChange}
                options={[
                  { label: "Always angry, always yelling at my face 😠", value: "0.8" },
                  { label: "Just normal 🤷", value: "1.0" },
                  { label: "Good, I can learn a lot from him/her 🧠", value: "1.2" },
                ]}
              />

              <RadioGroup
                label="How big is your workspace?"
                name="workspaceSize"
                value={formData.workspaceSize}
                onChange={handleInputChange}
                options={[
                  { label: "Cramped, I'm like shrimp in a little box 🍤", value: "0.8" },
                  { label: "Normal (still hoping for a bigger one with better view) 🪟", value: "1.0" },
                  { label: "Spacious, I can even do yoga in my workspace 🧘", value: "1.2" },
                ]}
              />

              <RadioGroup
                label="How good-looking are your colleagues?"
                name="socialEnvironment"
                value={formData.socialEnvironment}
                onChange={handleInputChange}
                options={[
                  { label: "None of them are good-looking, I'm the only one who looks good 💅", value: "0.8" },
                  { label: "Average, me too 🤷", value: "1.0" },
                  { label: "Most of them are good looking 😍", value: "1.2" },
                ]}
              />

              <RadioGroup
                label="What's your education level?"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                options={[
                  { label: "Tafe/high school 🏫", value: "1.2" },
                  { label: "Bachelor 🎓", value: "1.0" },
                  { label: "Master/PhD 🧪", value: "0.8" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* 6. Personal Factors */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Heart className="inline-block w-6 h-6 mr-3 text-blue-500" />
            Personal Factors - Makeup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RadioGroup
              label="How often do you need to wear makeup for work?"
              name="makeup"
              value={formData.makeup}
              onChange={handleInputChange}
              options={[
                { label: "They don't deserve my makeup 💄", value: "1.2" },
                { label: "Sometimes ✨", value: "1.0" },
                { label: "Everyday 😩", value: "0.8" },
              ]}
            />

            {formData.makeup === "1.0" && (
              <>
                <div>
                  <label className={commonStyles.label}>How long do you spend on makeup everyday? (minutes)</label>
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
                  label="How uncomfortable is it to wear makeup?"
                  name="discomfort"
                  value={formData.discomfort}
                  onChange={handleInputChange}
                  options={[
                    { label: "I feel confident, but still uncomfortable 💄", value: "1.0" },
                    { label: "My eyes/skin/hair hurt from makeup 😣", value: "0.8" },
                    { label: "I hate it, I feel like a clown 🤡", value: "0.5" },
                  ]}
                />
              </>
            )}

            {formData.makeup === "0.8" && (
              <>
                <div>
                  <label className={commonStyles.label}>How long do you spend on makeup everyday? (minutes)</label>
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
                  label="How uncomfortable is it to wear makeup?"
                  name="discomfort"
                  value={formData.discomfort}
                  onChange={handleInputChange}
                  options={[
                    { label: "I feel confident, but still uncomfortable 💄", value: "1.0" },
                    { label: "My eyes/skin/hair hurt from makeup 😣", value: "0.8" },
                    { label: "I hate it, I feel like a clown 🤡", value: "0.5" },
                  ]}
                />
              </>
            )}
          </div>
        </section>

        {/* Add a separate section for Quit Thoughts */}
        <section className={commonStyles.sectionContainer}>
          <h2 className={commonStyles.sectionTitle}>
            <Briefcase className="inline-block w-6 h-6 mr-3 text-cyan-500" />
            Quitting Thoughts
          </h2>
          <div className="mt-8 bg-blue-50 dark:bg-gray-700/50 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div>
              <RadioGroup
                label="How often do you think about quitting?"
                name="quitJob"
                value={formData.quitJob}
                onChange={handleInputChange}
                options={[
                  { label: "Totally tortured by my job, want to quit everyday 😭", value: "0.3" },
                  { label: "I'm so tired of it but I can bear it 😮‍💨", value: "0.8" },
                  { label: "I can't, I need money, sometimes work is fun 💰", value: "1.0" },
                  { label: "Never, I love my job 💖", value: "1.2" },
                ]}
              />

              {formData.quitJob === "1.2" && (
                <div className="col-span-2 mt-2 text-sm text-blue-500 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  Why are you here friend? 🤔 You seem to love your job already!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Calculate Button */}
        {!showResults && (
          <div className="text-center py-8">
            <button
              onClick={() => {
                setShowResults(true)
                typeWriter(generateResultText())
              }}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full font-medium text-lg transition-all
                shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:from-blue-600 hover:to-cyan-700"
            >
              <Coffee className="inline-block w-5 h-5 mr-2" />
              Calculate My Work Value ✨
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      {showResults && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-8 shadow-lg border-2 border-blue-100 dark:border-blue-800/50">
          <div
            className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: typedText.replace(
                /<strong>(.*?)<\/strong>/g,
                '<span class="text-xl font-bold text-blue-600 dark:text-blue-400">$1</span>',
              ),
            }}
          />
          {!isTyping && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowResults(false)}
                className="px-6 py-3 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full text-sm transition-all border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg"
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