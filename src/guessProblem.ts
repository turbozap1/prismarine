export const guessProblem = (errorMessage: string) => {
  if (errorMessage.endsWith('Socket error: ECONNREFUSED')) {
    return 'Most probably the server is not running.'
  }
}
