import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { MainMenuState } from './MainMenuState';

module.exports = createStore(reducer, {}, applyMiddleware(
    promiseMiddleware()
));
