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
  const [startMonth, setStartMonth] = React.useState(new Date())
  const [isMobile, setIsMobile] = React.useState(false)
  
  // Internal selection state
  const [internalDepart, setInternalDepart] = React.useState(departDate)
  const [internalReturn, setInternalReturn] = React.useState(returnDate)
  
  // Drag state
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragHover, setDragHover] = React.useState(null)
  const wasDragged = React.useRef(false)

  // Sync internal state with props
  React.useEffect(() => {
    setInternalDepart(departDate)
    setInternalReturn(returnDate)
  }, [departDate, returnDate])

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate 6 months starting from startMonth
  const months = React.useMemo(() => {
    const result = []
    for (let i = 0; i < 6; i++) {
      result.push(addMonths(startMonth, i))
    }
    return result
  }, [startMonth])

  // Find min and max fares for coloring
  const fareValues = Object.values(fares).filter(f => f != null)
  const minFare = fareValues.length > 0 ? Math.min(...fareValues) : 0
  const maxFare = fareValues.length > 0 ? Math.max(...fareValues) : 0

  const handlePrevMonth = () => setStartMonth(subMonths(startMonth, isMobile ? 1 : 3))
  const handleNextMonth = () => setStartMonth(addMonths(startMonth, isMobile ? 1 : 3))

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
      <div className="flex-1 min-w-[200px] select-none">
        {/* Month Header */}
        <div className="text-center mb-3">
          <h3 className="text-base font-bold text-slate-900">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-slate-500 py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
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
                      isStart && displayReturn && "bg-gradient-to-r from-transparent to-brand-100 rounded-l-md",
                      isEnd && displayDepart && "bg-gradient-to-l from-transparent to-brand-100 rounded-r-md"
                    )}
                  >
                    <button
                      onMouseDown={(e) => handleMouseDown(date, e)}
                      onMouseEnter={() => handleMouseEnter(date)}
                      onClick={() => handleDateClick(date)}
                      onTouchStart={(e) => handleMouseDown(date, e)}
                      disabled={isDisabled || !isCurrentMonth}
                      className={cn(
                        "w-full flex flex-col items-center justify-center rounded-md transition-all",
                        "min-h-[52px] sm:min-h-[58px] p-1",
                        !isCurrentMonth && "text-slate-200 cursor-default",
                        isCurrentMonth && !isDisabled && "hover:bg-brand-50 cursor-pointer",
                        isDisabled && isCurrentMonth && "text-slate-300 cursor-not-allowed",
                        isToday && !isSelected && "ring-2 ring-brand-500 ring-inset",
                        isSelected && "bg-brand-600 text-white hover:bg-brand-700",
                        isInRange && isCurrentMonth && "text-brand-700"
                      )}
                    >
                      <span className="text-base font-semibold leading-none">{format(date, 'd')}</span>
                      {fare && isCurrentMonth && !isDisabled && (
                        <span className={cn(
                          "text-[10px] font-bold leading-none mt-1",
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
  const monthsToShow = isMobile ? 2 : 6

  return (
    <div className={cn("p-4 sm:p-5", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-4 pb-3 border-b">
        <div className={cn(
          "px-4 py-2 rounded-lg text-center min-w-[130px]",
          displayDepart ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
        )}>
          <div className="text-xs font-medium opacity-80">Departure</div>
          <div className="text-sm font-bold">
            {displayDepart ? format(displayDepart, 'EEE, d MMM') : 'Select date'}
          </div>
        </div>
        
        {tripType === 'round-trip' && (
          <>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <div className={cn(
              "px-4 py-2 rounded-lg text-center min-w-[130px]",
              hasFullSelection ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
            )}>
              <div className="text-xs font-medium opacity-80">Return</div>
              <div className="text-sm font-bold">
                {displayReturn ? format(displayReturn, 'EEE, d MMM') : hasDepartureOnly ? 'Tap to select' : 'Select date'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading & Legend Row */}
      <div className="flex items-center justify-between mb-4">
        {faresLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading fares...</span>
          </div>
        ) : Object.keys(fares).length > 0 ? (
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-slate-600 font-medium">Lowest</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 font-medium">Medium</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-600 font-medium">Highest</span>
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Select airports to see fares</div>
        )}
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={isSameMonth(startMonth, today)}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 6-Month Calendar Grid */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      )}>
        {months.slice(0, monthsToShow).map((month, idx) => (
          <div key={idx}>
            {renderMonth(month)}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className="mt-4 pt-3 border-t text-center text-sm text-slate-500">
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
