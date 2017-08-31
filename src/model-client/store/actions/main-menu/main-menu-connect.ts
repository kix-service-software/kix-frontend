import { MainMenuEntriesResult } from './../../../menu/socket/MainMenuEntriesResult';
import { StateAction } from './../StateAction';
import { SocketEvent } from '../../../';
import { MAIN_MENU_LOAD_ENTRIES, MAIN_MENU_ENTRIES_LOADED } from '../../actions';
import { MainMenuAction } from './MainMenuAction';
import { MainMenuEvent } from './../../../menu/';

declare var io: any;

export default (frontendSocketUrl: string) => {
    const payload = new Promise((resolve, reject) => {
        const socket = io.connect(frontendSocketUrl + "/main-menu", {});

        initSocketListener(socket);
        resolve({ socket });
    });
    return new StateAction(MainMenuAction.MAIN_MENU_CONNECT, payload);
};

function initSocketListener(socket: SocketIO.Server): void {
    const store = require('../../');
    socket.on(SocketEvent.CONNECT, () => {
        console.log("connected to socket server.");
        store.dispatch(MAIN_MENU_LOAD_ENTRIES(socket));
    });

    socket.on(SocketEvent.CONNECT_ERROR, (error) => {
        console.error(error);
    });

    socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
        console.error("Timeout");
    });

    socket.on(MainMenuEvent.MENU_ENTRIES_LOADED, (result: MainMenuEntriesResult) => {
        store.dispatch(MAIN_MENU_ENTRIES_LOADED(result.menuEntries));
    });

    socket.on('error', (error) => {
        console.error(error);
    });
}
