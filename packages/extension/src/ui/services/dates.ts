export const formatDate = (date: Date | string | number) =>
  new Date(date).toLocaleDateString('en-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

export const formatDateTime = (date: Date | string | number) =>
  new Date(date).toLocaleDateString('en-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
