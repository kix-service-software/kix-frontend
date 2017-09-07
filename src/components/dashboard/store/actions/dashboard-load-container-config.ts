import { LoadConfigurationRequest } from './../../../../model/client/socket/configuration/LoadConfigurationRequest';
import { StateAction } from '../../../../model/client/store/StateAction';
import { DashboardAction } from './';
import { ConfigurationEvent } from '../../../../model/client/socket/configuration';

export default (socket: SocketIO.Server) => {
    const payload = new Promise((resolve, reject) => {
        resolve(loadConfiguration(socket));
    });

    return new StateAction(DashboardAction.DASHBOARD_LOAD_CONTAINER_CONFIG, payload);
};

function loadConfiguration(socket: SocketIO.Server): any {
    const token = window.localStorage.getItem("token");
    socket.emit(ConfigurationEvent.LOAD_COMPONENT_CONFIGURATION, new LoadConfigurationRequest(token, 'dashboard'));
    return {};
}
