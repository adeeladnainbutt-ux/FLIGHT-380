import * as React from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval, isBefore, isAfter } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function BigCalendar({
  className,
  departDate,
  returnDate,
  onDepartSelect,
  onReturnSelect,
  onSelectionComplete,
  tripType = 'round-trip',
  fares = {},
  faresLoading = false,
  currency = '£',
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isMobile, setIsMobile] = React.useState(false)
  
  // Internal selection state
  const [internalDepart, setInternalDepart] = React.useState(departDate)
  const [internalReturn, setInternalReturn] = React.useState(returnDate)
  
  // Drag state
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragHover, setDragHover] = React.useState(null)
  const wasDragged = React.useRef(false)

  // Calculate max navigable month (6 months from today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxMonth = addMonths(today, 5) // 6 months total (current + 5)

  // Sync internal state with props
  React.useEffect(() => {
    setInternalDepart(departDate)
    setInternalReturn(returnDate)
  }, [departDate, returnDate])

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigate by 2 months (or 1 on mobile)
  const handlePrevMonth = () => {
    const step = isMobile ? 1 : 2
    setCurrentMonth(subMonths(currentMonth, step))
  }
  
  const handleNextMonth = () => {
    const step = isMobile ? 1 : 2
    setCurrentMonth(addMonths(currentMonth, step))
  }

  // Check if can navigate
  const canGoPrev = !isSameMonth(currentMonth, today) && !isBefore(currentMonth, today)
  const canGoNext = isBefore(currentMonth, maxMonth)

  // Handle date selection
  const handleDateClick = (date) => {
    if (isBefore(date, today)) return
    if (isDragging) return
    
    if (tripType === 'one-way') {
      setInternalDepart(date)
      onDepartSelect(date)
      if (onSelectionComplete) onSelectionComplete()
      return
    }

    if (!internalDepart) {
      setInternalDepart(date)
      setInternalReturn(null)
      onDepartSelect(date)
      onReturnSelect(null)
    } else if (internalDepart && !internalReturn) {
      if (isAfter(date, internalDepart)) {
        setInternalReturn(date)
        onReturnSelect(date)
        if (onSelectionComplete) onSelectionComplete()
      } else if (isBefore(date, internalDepart)) {
        setInternalDepart(date)
        setInternalReturn(null)
        onDepartSelect(date)
        onReturnSelect(null)
      }
    } else if (internalDepart && internalReturn) {
      setInternalDepart(date)
      setInternalReturn(null)
      onDepartSelect(date)
      onReturnSelect(null)
    }
  }

  // Handle drag start
  const handleMouseDown = (date, e) => {
    if (isBefore(date, today)) return
    if (tripType === 'one-way') return
    
    if (!internalDepart || (internalDepart && internalReturn)) {
      e.preventDefault()
      wasDragged.current = false
      setIsDragging(true)
      setInternalDepart(date)
      setInternalReturn(null)
      setDragHover(date)
    }
  }

  // Handle drag move
  const handleMouseEnter = (date) => {
    if (!isDragging || isBefore(date, today)) return
    
    if (internalDepart && isAfter(date, internalDepart)) {
      setDragHover(date)
      wasDragged.current = true
    }
  }

  // Handle drag end
  const handleMouseUp = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (wasDragged.current && internalDepart && dragHover && isAfter(dragHover, internalDepart)) {
      setInternalReturn(dragHover)
      onDepartSelect(internalDepart)
      onReturnSelect(dragHover)
      if (onSelectionComplete) onSelectionComplete()
    } else if (internalDepart) {
      onDepartSelect(internalDepart)
      onReturnSelect(null)
    }
    
    setDragHover(null)
  }

  // Global mouse up listener
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchend', handleMouseUp)
      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, internalDepart, dragHover])

  // Display values
  const displayDepart = internalDepart
  const displayReturn = isDragging && wasDragged.current && dragHover ? dragHover : internalReturn

  const isDateInRange = (date) => {
    if (!displayDepart || !displayReturn || tripType === 'one-way') return false
    return isWithinInterval(date, { start: displayDepart, end: displayReturn }) && !isSameDay(date, displayDepart) && !isSameDay(date, displayReturn)
  }

  const isRangeStart = (date) => displayDepart && isSameDay(date, displayDepart)
  const isRangeEnd = (date) => displayReturn && isSameDay(date, displayReturn)

  // Get fare color based on price
  const fareValues = Object.values(fares).filter(f => f != null)
  const minFare = fareValues.length > 0 ? Math.min(...fareValues) : 0
  const maxFare = fareValues.length > 0 ? Math.max(...fareValues) : 0

  const getFareColor = (price) => {
    if (!price || minFare === maxFare) return 'text-slate-500'
    const ratio = (price - minFare) / (maxFare - minFare)
    if (ratio < 0.33) return 'text-green-600'
    if (ratio < 0.66) return 'text-amber-600'
    return 'text-red-500'
  }

  const formatPrice = (price) => {
    if (!price) return null
    return `${currency}${Math.round(price)}`
  }

  const renderMonth = (monthDate) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = []
    let day = startDate
    while (day <= endDate) {
      days.push(new Date(day))
      day = addDays(day, 1)
    }

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return (
      <div className="flex-1 min-w-[280px] select-none">
        {/* Month Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
            <div key={idx} className="text-center text-sm font-semibold text-slate-500 py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = isSameMonth(date, monthDate)
                const isDisabled = isBefore(date, today)
                const isStart = isRangeStart(date)
                const isEnd = isRangeEnd(date)
                const isSelected = isStart || isEnd
                const isInRange = isDateInRange(date)
                const isToday = isSameDay(date, today)
                
                const dateKey = format(date, 'yyyy-MM-dd')
                const fare = fares[dateKey]
                const fareColor = getFareColor(fare)

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "relative",
                      isInRange && "bg-brand-100",
                      isStart && displayReturn && "bg-gradient-to-r from-transparent to-brand-100 rounded-l-lg",
                      isEnd && displayDepart && "bg-gradient-to-l from-transparent to-brand-100 rounded-r-lg"
                    )}
                  >
                    <button
                      onMouseDown={(e) => handleMouseDown(date, e)}
                      onMouseEnter={() => handleMouseEnter(date)}
                      onClick={() => handleDateClick(date)}
                      onTouchStart={(e) => handleMouseDown(date, e)}
                      disabled={isDisabled || !isCurrentMonth}
                      className={cn(
                        "w-full flex flex-col items-center justify-center rounded-lg transition-all",
                        "min-h-[60px] sm:min-h-[68px] p-1",
                        !isCurrentMonth && "text-slate-200 cursor-default",
                        isCurrentMonth && !isDisabled && "hover:bg-brand-50 cursor-pointer",
                        isDisabled && isCurrentMonth && "text-slate-300 cursor-not-allowed",
                        isToday && !isSelected && "ring-2 ring-brand-500 ring-inset",
                        isSelected && "bg-brand-600 text-white hover:bg-brand-700",
                        isInRange && isCurrentMonth && "text-brand-700"
                      )}
                    >
                      <span className="text-lg font-semibold leading-none">{format(date, 'd')}</span>
                      {fare && isCurrentMonth && !isDisabled && (
                        <span className={cn(
                          "text-xs font-bold leading-none mt-1.5",
                          isSelected ? "text-white/90" : fareColor
                        )}>
                          {formatPrice(fare)}
                        </span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const hasFullSelection = displayDepart && displayReturn
  const hasDepartureOnly = displayDepart && !displayReturn
  
  // Show 2 months on desktop, 1 on mobile
  const nextMonth = addMonths(currentMonth, 1)

  // Calculate fare statistics
  const sortedFares = [...fareValues].sort((a, b) => a - b)
  const lowestFare = sortedFares.length > 0 ? sortedFares[0] : null
  const highestFare = sortedFares.length > 0 ? sortedFares[sortedFares.length - 1] : null
  const mediumFare = sortedFares.length > 2 ? sortedFares[Math.floor(sortedFares.length / 2)] : null

  // Get fare for selected departure date
  const selectedDepartFare = displayDepart ? fares[format(displayDepart, 'yyyy-MM-dd')] : null

  return (
    <div className={cn("p-5 sm:p-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-5 pb-4 border-b">
        <div className={cn(
          "px-5 py-2.5 rounded-lg text-center min-w-[140px]",
          displayDepart ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
        )}>
          <div className="text-xs font-medium opacity-80">Departure</div>
          <div className="text-base font-bold">
            {displayDepart ? format(displayDepart, 'EEE, d MMM') : 'Select date'}
          </div>
        </div>
        
        {tripType === 'round-trip' && (
          <>
            <ChevronRight className="h-5 w-5 text-slate-400" />
            <div className={cn(
              "px-5 py-2.5 rounded-lg text-center min-w-[140px]",
              hasFullSelection ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
            )}>
              <div className="text-xs font-medium opacity-80">Return</div>
              <div className="text-base font-bold">
                {displayReturn ? format(displayReturn, 'EEE, d MMM') : hasDepartureOnly ? 'Tap to select' : 'Select date'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected Fare Display */}
      {selectedDepartFare && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-sm text-green-700 font-medium">
            {tripType === 'round-trip' ? 'Round-trip fare from' : 'One-way fare from'}
          </div>
          <div className="text-2xl font-bold text-green-700">
            {currency}{selectedDepartFare.toFixed(2)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Cheapest fare for {format(displayDepart, 'd MMM yyyy')}
          </div>
        </div>
      )}

      {/* Navigation & Legend Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Navigation - Left */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="text-sm">Prev</span>
        </Button>

        {/* Legend - Center with actual prices */}
        {faresLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading fares...</span>
          </div>
        ) : Object.keys(fares).length > 0 ? (
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-green-700 font-bold">{currency}{lowestFare ? Math.round(lowestFare) : '-'}</span>
              <span className="text-slate-500 hidden sm:inline">Lowest</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-amber-700 font-bold">{currency}{mediumFare ? Math.round(mediumFare) : '-'}</span>
              <span className="text-slate-500 hidden sm:inline">Medium</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-red-600 font-bold">{currency}{highestFare ? Math.round(highestFare) : '-'}</span>
              <span className="text-slate-500 hidden sm:inline">Highest</span>
            </span>
          </div>
        ) : (
          <div className="text-sm text-slate-400">Select airports to see fares</div>
        )}

        {/* Navigation - Right */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className="h-9 px-3"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* 2-Month Calendar Grid (larger size) */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {renderMonth(currentMonth)}
        {!isMobile && renderMonth(nextMonth)}
      </div>

      {/* Helper Text */}
      <div className="mt-5 pt-4 border-t text-center text-sm text-slate-500">
        {tripType === 'round-trip' ? (
          hasDepartureOnly ? (
            <span>Now tap or drag to select your <strong>return date</strong></span>
          ) : hasFullSelection ? (
            <span>Tap any date to start a new selection</span>
          ) : (
            <span>Tap departure date, then tap or <strong>drag</strong> to return date</span>
          )
        ) : (
          <span>Tap to select your <strong>travel date</strong></span>
        )}
      </div>
    </div>
  )
}

BigCalendar.displayName = "BigCalendar"

export { BigCalendar }
