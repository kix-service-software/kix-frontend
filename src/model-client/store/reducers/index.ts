import { combineReducers, Reducer } from 'redux';
import login from './login';
import mainMenu from './main-menu';

export default combineReducers({
    login,
    mainMenu
});
