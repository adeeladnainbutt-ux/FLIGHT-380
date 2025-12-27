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
  const [selectingReturn, setSelectingReturn] = React.useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextMonth = addMonths(currentMonth, 1)

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date) => {
    if (isBefore(date, today)) return

    if (tripType === 'one-way') {
      onDepartSelect(date)
      // For one-way, close immediately after selection
      if (onSelectionComplete) onSelectionComplete()
      return
    }

    // Round-trip logic
    if (!selectingReturn || !departDate) {
      // Selecting departure date
      onDepartSelect(date)
      // Auto-set return to departure + 7 days
      const autoReturnDate = addDays(date, 7)
      onReturnSelect(autoReturnDate)
      setSelectingReturn(true)
      // Don't close - let user adjust return date if needed
    } else {
      // Selecting return date
      if (isBefore(date, departDate)) {
        // If clicked date is before departure, treat it as new departure
        onDepartSelect(date)
        const autoReturnDate = addDays(date, 7)
        onReturnSelect(autoReturnDate)
        // Stay in return selection mode
      } else {
        onReturnSelect(date)
        setSelectingReturn(false)
        // User explicitly selected return date, close the picker
        if (onSelectionComplete) onSelectionComplete()
      }
    }
  }

  const isDateInRange = (date) => {
    if (!departDate || !returnDate || tripType === 'one-way') return false
    return isWithinInterval(date, { start: departDate, end: returnDate })
  }

  const isRangeStart = (date) => {
    return departDate && isSameDay(date, departDate)
  }

  const isRangeEnd = (date) => {
    return returnDate && isSameDay(date, returnDate)
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
      <div className="flex-1 min-w-[280px]">
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
                const isSelected = isRangeStart(date) || isRangeEnd(date)
                const isInRange = isDateInRange(date) && !isSelected
                const isToday = isSameDay(date, today)
                const isStart = isRangeStart(date)
                const isEnd = isRangeEnd(date)

                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "relative",
                      isInRange && "bg-brand-100",
                      isStart && tripType === 'round-trip' && returnDate && "bg-gradient-to-r from-transparent to-brand-100 rounded-l-lg",
                      isEnd && tripType === 'round-trip' && departDate && "bg-gradient-to-l from-transparent to-brand-100 rounded-r-lg"
                    )}
                  >
                    <button
                      onClick={() => handleDateClick(date)}
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

  return (
    <div className={cn("p-4 sm:p-6", className)} {...props}>
      {/* Selected Dates Header */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-lg text-center min-w-[140px]",
            !selectingReturn ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
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
                selectingReturn ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
              )}>
                <div className="text-xs font-medium opacity-80">Return</div>
                <div className="text-sm sm:text-base font-semibold">
                  {returnDate ? format(returnDate, 'EEE, d MMM') : 'Select date'}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Two Month Grid */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {renderMonth(currentMonth)}
        {renderMonth(nextMonth)}
      </div>

      {/* Helper Text */}
      <div className="mt-4 pt-4 border-t text-center text-sm text-slate-500">
        {tripType === 'round-trip' ? (
          selectingReturn ? (
            <span>Tap a date to change your <strong>return date</strong></span>
          ) : (
            <span>Tap a date to select your <strong>departure date</strong> (return auto-sets to +7 days)</span>
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
