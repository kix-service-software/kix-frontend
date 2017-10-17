import promiseMiddleware from 'redux-promise-middleware';
import { applyMiddleware, createStore } from 'redux';

import reducer from './reducer';

export { CreateObjectDialogReduxState } from './CreateObjectDialogReduxState';

function create(): any {
    return createStore(reducer, {}, applyMiddleware(
        promiseMiddleware()
    ));
}

export {
    create
};
