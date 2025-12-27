import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval, isBefore } from "date-fns"
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
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isMobile, setIsMobile] = React.useState(false)
  
  // Drag selection state
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStartDate, setDragStartDate] = React.useState(null)
  const [hoverDate, setHoverDate] = React.useState(null)

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextMonth = addMonths(currentMonth, 1)

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Start drag/selection
  const handleMouseDown = (date, e) => {
    if (isBefore(date, today)) return
    e.preventDefault()
    
    if (tripType === 'one-way') {
      onDepartSelect(date)
      if (onSelectionComplete) onSelectionComplete()
      return
    }
    
    setIsDragging(true)
    setDragStartDate(date)
    setHoverDate(date)
    onDepartSelect(date)
  }

  // Track hover during drag
  const handleMouseEnter = (date) => {
    if (!isDragging || isBefore(date, today)) return
    
    // Only update hover if date is after departure
    if (dragStartDate && !isBefore(date, dragStartDate)) {
      setHoverDate(date)
    }
  }

  // End drag/selection
  const handleMouseUp = React.useCallback(() => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (dragStartDate && hoverDate) {
      if (isSameDay(dragStartDate, hoverDate)) {
        // Just clicked, no drag - wait for second click
        onReturnSelect(null)
      } else {
        // Dragged to different date - set return and close
        onReturnSelect(hoverDate)
        if (onSelectionComplete) onSelectionComplete()
      }
    }
    
    setDragStartDate(null)
    setHoverDate(null)
  }, [isDragging, dragStartDate, hoverDate, onReturnSelect, onSelectionComplete])

  // Handle click for second date selection (when departure already set)
  const handleClick = (date) => {
    if (isBefore(date, today)) return
    
    if (tripType === 'one-way') {
      onDepartSelect(date)
      if (onSelectionComplete) onSelectionComplete()
      return
    }
    
    // If departure is set but no return, and clicking a later date
    if (departDate && !returnDate) {
      if (!isBefore(date, departDate)) {
        onReturnSelect(date)
        if (onSelectionComplete) onSelectionComplete()
      } else {
        // Clicked earlier date - reset to this as departure
        onDepartSelect(date)
      }
    }
  }

  // Global mouse up listener
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => handleMouseUp()
      window.addEventListener('mouseup', handleGlobalMouseUp)
      window.addEventListener('touchend', handleGlobalMouseUp)
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp)
        window.removeEventListener('touchend', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMouseUp])

  // Calculate range for display
  const displayReturnDate = isDragging && hoverDate && !isSameDay(dragStartDate, hoverDate) 
    ? hoverDate 
    : returnDate

  const isDateInRange = (date) => {
    const start = departDate
    const end = displayReturnDate
    if (!start || !end || tripType === 'one-way') return false
    if (isSameDay(start, end)) return false
    return isWithinInterval(date, { start, end })
  }

  const isRangeStart = (date) => {
    return departDate && isSameDay(date, departDate)
  }

  const isRangeEnd = (date) => {
    return displayReturnDate && isSameDay(date, displayReturnDate) && !isSameDay(departDate, displayReturnDate)
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
          <h3 className="text-lg font-semibold text-slate-900">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div
              key={dayName}
              className="text-center text-sm font-medium text-slate-500 py-2"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = isSameMonth(date, monthDate)
                const isDisabled = isBefore(date, today)
                const isStart = isRangeStart(date)
                const isEnd = isRangeEnd(date)
                const isSelected = isStart || isEnd
                const isInRange = isDateInRange(date) && !isSelected
                const isToday = isSameDay(date, today)

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "relative",
                      isInRange && "bg-brand-100",
                      isStart && tripType === 'round-trip' && displayReturnDate && !isSameDay(departDate, displayReturnDate) && "bg-gradient-to-r from-transparent to-brand-100 rounded-l-lg",
                      isEnd && tripType === 'round-trip' && departDate && "bg-gradient-to-l from-transparent to-brand-100 rounded-r-lg"
                    )}
                  >
                    <button
                      onMouseDown={(e) => handleMouseDown(date, e)}
                      onMouseEnter={() => handleMouseEnter(date)}
                      onMouseUp={() => !isDragging && handleClick(date)}
                      onTouchStart={(e) => handleMouseDown(date, e)}
                      disabled={isDisabled || !isCurrentMonth}
                      className={cn(
                        "w-full aspect-square flex flex-col items-center justify-center rounded-lg text-base font-medium transition-all",
                        "min-h-[48px] sm:min-h-[56px]",
                        !isCurrentMonth && "text-slate-300 cursor-default",
                        isCurrentMonth && !isDisabled && "hover:bg-brand-50 cursor-pointer",
                        isDisabled && isCurrentMonth && "text-slate-300 cursor-not-allowed",
                        isToday && !isSelected && "ring-2 ring-brand-500 ring-inset",
                        isSelected && "bg-brand-600 text-white hover:bg-brand-700",
                        isInRange && isCurrentMonth && "text-brand-700"
                      )}
                    >
                      <span className="text-lg sm:text-xl">{format(date, 'd')}</span>
                      {isStart && (
                        <span className="text-[10px] sm:text-xs font-normal mt-0.5">
                          {tripType === 'round-trip' ? 'Depart' : 'Travel'}
                        </span>
                      )}
                      {isEnd && tripType === 'round-trip' && (
                        <span className="text-[10px] sm:text-xs font-normal mt-0.5">Return</span>
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

  // Determine display state
  const hasFullSelection = departDate && returnDate && !isSameDay(departDate, returnDate)
  const hasDepartureOnly = departDate && !returnDate

  return (
    <div className={cn("p-4 sm:p-6", className)} {...props}>
      {/* Selected Dates Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-lg text-center min-w-[140px]",
            departDate ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
          )}>
            <div className="text-xs font-medium opacity-80">
              {tripType === 'round-trip' ? 'Departure' : 'Travel Date'}
            </div>
            <div className="text-sm sm:text-base font-semibold">
              {departDate ? format(departDate, 'EEE, d MMM') : 'Select date'}
            </div>
          </div>
          
          {tripType === 'round-trip' && (
            <>
              <ChevronRight className="h-5 w-5 text-slate-400" />
              <div className={cn(
                "px-4 py-2 rounded-lg text-center min-w-[140px]",
                hasFullSelection || (isDragging && hoverDate && !isSameDay(dragStartDate, hoverDate)) 
                  ? "bg-brand-600 text-white" 
                  : "bg-slate-100 text-slate-700"
              )}>
                <div className="text-xs font-medium opacity-80">Return</div>
                <div className="text-sm sm:text-base font-semibold">
                  {isDragging && hoverDate && !isSameDay(dragStartDate, hoverDate)
                    ? format(hoverDate, 'EEE, d MMM')
                    : hasFullSelection 
                      ? format(returnDate, 'EEE, d MMM') 
                      : hasDepartureOnly 
                        ? 'Tap to select'
                        : 'Drag to select'
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          disabled={isSameMonth(currentMonth, today)}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        {isMobile && (
          <span className="text-sm font-medium text-slate-600">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid - One month on mobile, two on desktop */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {renderMonth(currentMonth)}
        {!isMobile && renderMonth(nextMonth)}
      </div>

      {/* Helper Text */}
      <div className="mt-4 pt-4 border-t text-center text-sm text-slate-500">
        {tripType === 'round-trip' ? (
          isDragging ? (
            <span>Drag to your <strong>return date</strong> and release</span>
          ) : hasDepartureOnly ? (
            <span>Now tap or drag to select your <strong>return date</strong></span>
          ) : hasFullSelection ? (
            <span>Tap a date to start a new selection, or <strong>drag</strong> to select range</span>
          ) : (
            <span>Tap departure date, then <strong>tap or drag</strong> to return date</span>
          )
        ) : (
          <span>Tap a date to select your <strong>travel date</strong></span>
        )}
      </div>
    </div>
  )
}

BigCalendar.displayName = "BigCalendar"

export { BigCalendar }
