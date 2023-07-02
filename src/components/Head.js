import NHead from 'next/head'

export default function Head({ title }) {
  return (
    <>
      <NHead>
        <title>{title || 'TillWhen | Just a time tracker'}</title>
      </NHead>
    </>
  )
}
