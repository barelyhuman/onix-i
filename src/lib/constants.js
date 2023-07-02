export const FACTORS = {
  totp: 'TOTP',
}

export const PROVIDERS = {
  SLACK: 'slack',
}

export const options = {
  TODO_STATUS: {
    notStarted: {
      seq: 0,
      value: 0,
      label: 'Not Started',
    },
    pending: {
      seq: 1,
      value: 1,
      label: 'Pending',
    },
    paused: {
      seq: 2,
      value: 2,
      label: 'Paused',
    },
    done: {
      seq: 3,
      value: 3,
      label: 'Done',
    },
  },
  EXTERNAL_PROVIDERS: {
    slack: {
      seq: 0,
      value: 0,
      label: 'Slack',
    },
  },
}

export const findInOptions = (identifier, value) => {
  if (!options[identifier]) throw new Error('Invalid identifier')

  return Object.values(options[identifier]).find(x => {
    return x.value === value
  }).label
}
