import Spacer from '@/components/Spacer'
import format from 'date-fns/format'
import formatRelative from 'date-fns/formatRelative'
import enIN from 'date-fns/locale/en-IN'

export default function DateHeader(props) {
  const normalizeDateString = date => format(new Date(date), 'dd/MM/yyyy')

  const formatDateString = date => {
    const formatRelativeLocale = {
      lastWeek: "'Last' eeee",
      yesterday: "'Yesterday'",
      today: "'Today'",
      tomorrow: "'Tomorrow'",
      nextWeek: "'Next' eeee",
      other: 'dd.MM.yyyy',
    }

    const locale = {
      ...enIN,
      formatRelative: token => formatRelativeLocale[token],
    }
    return formatRelative(new Date(date), new Date(), { locale })
  }
  return (
    <>
      <div>
        <p className="space-null">
          <span className="text-grey">
            <small>{normalizeDateString(props.date)}</small>{' '}
          </span>
        </p>
        <h2 className="space-null">{formatDateString(props.date)} </h2>
        <Spacer y={2} />
      </div>
    </>
  )
}
