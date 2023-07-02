import { useDayzed } from 'dayzed'
import { useEffect, useState } from 'react'
import { styled } from 'goober'
import If from './If'
import Box from './Box'

const monthNamesShort = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WeekdayLabel = styled('p')`
  margin: 0;
  padding: 0;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--subtle);
`

const PickerContainer = styled('div')`
  position: relative;
  border-radius: 10px;
  background: var(--surface);
  padding: 10px;
`

const DayButton = styled('button')`
  display: inline-flex;
  margin: 4px;
  padding: 20px;
  height: 24px;
  width: 24px;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  border-radius: 6px;

  border: ${({ today }) => (today ? '1px solid var(--overlay)' : '0px')};
  background: ${({ selected }) =>
    selected ? 'var(--base-alt)' : 'transparent'};
  color: ${({ selected, selectable, prevMonth }) => {
    let color
    if (prevMonth) color = 'var(--subtle)'
    if (!selectable) color = 'var(--muted)'
    color = (selected && 'var(--text-alt)') || color
    return color
  }};
`

const ColGrid7 = styled('div')`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`

const CalButton = styled(({ ...props }) => <Box as="button" {...props} />)`
  background: transparent;
  height: 32px;
  min-width: 32px;
  padding: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  border: 1px solid var(--overlay);
  &:hover {
    cursor: pointer;
    background: var(--overlay);
  }
`

const MonthContainer = styled('div')`
  margin-bottom: 40px;
  display: flex;
  gap: 10px;
  align-items: center;
`

const CalendarContainer = styled('div')`
  height: 400px;
`

const TimeInputContainer = styled(({ ...props }) => (
  <Box as="div" {...props} />
))`
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--surface);
  align-items: center;
  justify-content: center;
`

const TimeInput = styled('input')`
  height: 32px;
  min-width: 120px;
  padding: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background: inherit;
  border: 1px solid var(--overlay);
`

function Calendar({
  calendars = [],
  getBackProps,
  getForwardProps,
  getDateProps,
  onClose,
}) {
  if (!calendars.length) return null

  return (
    <CalendarContainer>
      {calendars.map(calendar => (
        <div key={`${calendar.month}${calendar.year}`}>
          <MonthContainer>
            <CalButton type="button" {...getBackProps({ calendars })}>
              &lsaquo;
            </CalButton>
            <span>
              {monthNamesShort[calendar.month]} {calendar.year}
            </span>
            <CalButton type="button" {...getForwardProps({ calendars })}>
              &rsaquo;
            </CalButton>
            <CalButton type="button" ml="auto" onClick={onClose}>
              &times;
            </CalButton>
          </MonthContainer>
          <ColGrid7>
            {weekdayNamesShort.map(weekday => (
              <WeekdayLabel key={`${calendar.month}${calendar.year}${weekday}`}>
                {weekday}
              </WeekdayLabel>
            ))}
          </ColGrid7>
          <ColGrid7>
            {calendar.weeks.map((week, weekIndex) =>
              week.map((dateObj, index) => {
                const key = `${calendar.month}${calendar.year}${weekIndex}${index}`
                if (!dateObj) return <div key={key} />

                const { date, selected, selectable, today, prevMonth } = dateObj

                return (
                  <DayButton
                    today={today}
                    selectable={selectable}
                    selected={selected}
                    prevMonth={prevMonth}
                    key={key}
                    {...getDateProps({ dateObj })}
                  >
                    <span>{date.getDate()}</span>
                  </DayButton>
                )
              })
            )}
          </ColGrid7>
        </div>
      ))}
    </CalendarContainer>
  )
}

const Datepicker = ({
  onChange,
  onTimeChange,
  value,
  maxDate,
  showTime = true,
  minDate,
  onToday,
  onClear,
  onClose,
}) => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const dayzedData = useDayzed({
    selected: value,
    minDate,
    maxDate,
    showOutsideDays: true,
    onDateSelected: onChange,
  })

  useEffect(() => {
    onTimeChange && onTimeChange({ from, to })
  }, [from, to])

  return (
    <>
      <PickerContainer>
        <Calendar onClose={onClose} {...dayzedData} />
        <div>
          <CalButton marginX-8 onClick={onToday}>
            today
          </CalButton>
          <CalButton marginX-8 onClick={onClear}>
            clear
          </CalButton>
        </div>
        <If condition={showTime}>
          <TimeInputContainer mt={12} pt={12}>
            <span>from</span>
            <TimeInput
              type="time"
              value={from}
              onChange={e => {
                setFrom(e.target.value)
              }}
            />
            <span>to</span>
            <TimeInput
              type="time"
              value={to}
              onChange={e => {
                setTo(e.target.value)
              }}
            />
          </TimeInputContainer>
        </If>
      </PickerContainer>
    </>
  )
}

export default Datepicker
