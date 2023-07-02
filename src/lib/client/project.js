export function formatProjectsToOptions(projects) {
  const formattedRecords = projects.map(item => {
    return {
      key: item.id,
      value: item.id,
      text: item.name,
      item: {
        ...item,
        created_at: new Date(item.created_at).toISOString(),
        updated_at: new Date(item.updated_at).toISOString(),
      },
    }
  })
  return formattedRecords
}
