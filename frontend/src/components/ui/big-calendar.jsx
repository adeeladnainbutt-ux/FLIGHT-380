import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isMobile, setIsMobile] = React.useState(false)
  
  // Internal selection state - mirrors props but allows immediate updates
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

  // Handle date selection
  const handleDateClick = (date) => {
    if (isBefore(date, today)) return
    // Don't handle clicks while dragging
    if (isDragging) return
    
    if (tripType === 'one-way') {
      setInternalDepart(date)
      onDepartSelect(date)
      if (onSelectionComplete) onSelectionComplete()
      return
    }

    // Round-trip logic
    if (!internalDepart) {
      // No departure - set it
      setInternalDepart(date)
      setInternalReturn(null)
      onDepartSelect(date)
      onReturnSelect(null)
    } else if (internalDepart && !internalReturn) {
      // Have departure, need return
      if (isAfter(date, internalDepart)) {
        // Valid return date - set and close
        setInternalReturn(date)
        onReturnSelect(date)
        if (onSelectionComplete) onSelectionComplete()
      } else if (isBefore(date, internalDepart)) {
        // Before departure - reset to this as new departure
        setInternalDepart(date)
        setInternalReturn(null)
        onDepartSelect(date)
        onReturnSelect(null)
      }
      // If same day, do nothing
    } else if (internalDepart && internalReturn) {
      // Both dates exist - start fresh
      setInternalDepart(date)
      setInternalReturn(null)
      onDepartSelect(date)
      onReturnSelect(null)
    }
  }

  // Handle drag start
  const handleMouseDown = (date, e) => {
    if (isBefore(date, today)) return
    
    if (tripType === 'one-way') {
      // One-way handled by click
      return
    }
    
    // For round-trip, only enable drag if we're starting fresh or have both dates
    // Don't start drag if we have departure but no return (let click handle that)
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
      // Completed a drag
      setInternalReturn(dragHover)
      onDepartSelect(internalDepart)
      onReturnSelect(dragHover)
      if (onSelectionComplete) onSelectionComplete()
    } else if (internalDepart) {
      // Just a click (no drag)
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
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="text-center text-sm font-medium text-slate-500 py-2">
              {dayName}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = isSameMonth(date, monthDate)
                const isDisabled = isBefore(date, today)
                const isStart = isRangeStart(date)
                const isEnd = isRangeEnd(date)
                const isSelected = isStart || isEnd
                const isInRange = isDateInRange(date)
                const isToday = isSameDay(date, today)

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

  const hasFullSelection = displayDepart && displayReturn
  const hasDepartureOnly = displayDepart && !displayReturn

  return (
    <div className={cn("p-4 sm:p-6", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-lg text-center min-w-[140px]",
            displayDepart ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
          )}>
            <div className="text-xs font-medium opacity-80">
              {tripType === 'round-trip' ? 'Departure' : 'Travel Date'}
            </div>
            <div className="text-sm sm:text-base font-semibold">
              {displayDepart ? format(displayDepart, 'EEE, d MMM') : 'Select date'}
            </div>
          </div>
          
          {tripType === 'round-trip' && (
            <>
              <ChevronRight className="h-5 w-5 text-slate-400" />
              <div className={cn(
                "px-4 py-2 rounded-lg text-center min-w-[140px]",
                hasFullSelection ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
              )}>
                <div className="text-xs font-medium opacity-80">Return</div>
                <div className="text-sm sm:text-base font-semibold">
                  {displayReturn 
                    ? format(displayReturn, 'EEE, d MMM') 
                    : hasDepartureOnly 
                      ? 'Tap to select'
                      : 'Select date'
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

      {/* Calendar Grid */}
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
            <span>Tap to start new selection, or <strong>drag</strong> for range</span>
          ) : (
            <span>Tap departure, then tap or <strong>drag</strong> to return</span>
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
