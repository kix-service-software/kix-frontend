import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';

import reducer from './reducer';

export { TicketListReduxState } from './TicketListReduxState';


function create(): any {
    return createStore(reducer, {}, applyMiddleware(
        promiseMiddleware()
    ));
}

export {
    create
};
