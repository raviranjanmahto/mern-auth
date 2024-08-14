const sendResponse = (data = null, statusCode, res, message = null) => {
  // Create the response object
  const response = { status: true, message };

  // Add the data field only if data is provided
  if (data) response.data = data;

  // Send the JSON response with the specified status code
  res.status(statusCode).json(response);
};

module.exports = sendResponse;
