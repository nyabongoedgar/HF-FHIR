class HandlerError {
  static handleError (error, statusCode, response) {
    return response.status(statusCode).json({
      success: false,
      error
    });
  }

  static handleErrorException (errorCode, errorMessage, statusCode, response) {
    HandlerError.errorHandler(errorCode, errorMessage, statusCode, response);
  }

  static errorHandler (errorCode, errorMessage, statusCode, response) {
    return response.status(statusCode).json({
      success: false,
      errorCode,
      errorMessage
    });
  }
}

export default HandlerError;
