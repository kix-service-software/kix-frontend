import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { UserListState } from './UserListState';

module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
