import { AssignTourAction } from './../../actions/assign-tour/AssignTourAction';
import { DeleteAction } from './../../actions/delete/DeleteAction';
import { IWidgetFactoryExtension, IWidget, UIProperty, WidgetConfiguration, IAction } from '@kix/core';
import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { UserListWidget } from './UserListWidget';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new UserListWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "user-list-widget";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/user-list';
    }

    public getDefaultConfiguration(): any {
        const userListConfiguration = new UserListConfiguration();
        userListConfiguration.properties.push(new UIProperty("UserID", "ID"));
        userListConfiguration.properties.push(new UIProperty("UserFirstname", "Vorname"));
        userListConfiguration.properties.push(new UIProperty("UserLastname", "Nachname"));
        userListConfiguration.properties.push(new UIProperty("UserEmail", "Email"));

        // TODO: Remove the logic of actions from here. On place is only content config relevant.
        const deleteAction = new DeleteAction("delete-action", "Delete", "");
        const tourAction = new AssignTourAction("assign-tour-action", "Assign Tour", "");
        return new WidgetConfiguration([deleteAction, tourAction], userListConfiguration);
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
