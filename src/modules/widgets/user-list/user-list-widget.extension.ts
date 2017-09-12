import { UIProperty } from './../../../model/client/UIProperty';
import { UserListConfiguration } from './../../../components/widgets/user-list/model/UserListConfiguration';
import { UserListWidget } from './UserListWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetFactoryExtension';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new UserListWidget();
    }

    public getWidgetId(): string {
        return "user-list-widget";
    }

    public getDefaultConfiguration(): any {
        const defaultConfiguration = new UserListConfiguration();
        defaultConfiguration.properties.push(new UIProperty("UserID", "ID"));
        defaultConfiguration.properties.push(new UIProperty("UserFirstname", "Vorname"));
        defaultConfiguration.properties.push(new UIProperty("UserLastname", "Nachname"));
        defaultConfiguration.properties.push(new UIProperty("UserEmail", "Email"));

        return defaultConfiguration;
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
