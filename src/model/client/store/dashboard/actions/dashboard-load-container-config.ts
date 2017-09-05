import { LoadConfigurationRequest } from './../../../socket/configuration/LoadConfigurationRequest';
import { MainMenuEvent } from './../../../socket/main-menu/';
import { StateAction } from './../../StateAction';
import { DashboardAction } from './';
import { ConfigurationEvent } from '../../../socket/configuration';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadConfiguration(socket));
    });

    return new StateAction(DashboardAction.DASHBOARD_LOAD_CONTAINER_CONFIG, payload);
};

function loadConfiguration(socket: SocketIO.Server): any {
    socket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, new LoadConfigurationRequest('dashboard'));
    return {};
}
