import { WidgetConfiguration } from './../../../model/client/components/widget/WidgetConfiguration';
import { UIProperty } from './../../../model/client/UIProperty';
import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { UserListWidget } from './UserListWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new UserListWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "user-list-widget";
    }

    public getDefaultConfiguration(): any {
        const userListConfiguration = new UserListConfiguration();
        userListConfiguration.properties.push(new UIProperty("UserID", "ID"));
        userListConfiguration.properties.push(new UIProperty("UserFirstname", "Vorname"));
        userListConfiguration.properties.push(new UIProperty("UserLastname", "Nachname"));
        userListConfiguration.properties.push(new UIProperty("UserEmail", "Email"));
        return new WidgetConfiguration([], userListConfiguration);
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
