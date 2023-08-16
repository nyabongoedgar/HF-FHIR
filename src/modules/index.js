import patient from './patient';

const apiPrefix = '/api/v1';

const routes = (app) => {
  app.use(apiPrefix, patient);
  return app;
};

export default routes;
