export const renderErrorPage = (res, status, errorMessage) => {
  return res.status(status).render("error-page", {
    errorMessage: errorMessage,
    statusCode: status,
  });
};
