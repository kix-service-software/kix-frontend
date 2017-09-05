import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { DashboardState } from './DashboardState';

module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
