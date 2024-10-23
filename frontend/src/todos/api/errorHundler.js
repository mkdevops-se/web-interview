export const handleApiError = (error) => {
  if (error.response) {
    console.log(error.response)
    throw new Error(error.response.data.message || 'An error occurred')
  } else if (error.request) {
    throw new Error('No response from the server. Please try again later.')
  } else {
    throw new Error(error.message || 'An unexpected error occurred')
  }
}
