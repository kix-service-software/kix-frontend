import { UserListWidget } from './UserListWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetExtension';

export class UserlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new UserListWidget();
    }

    public getWidgetId(): string {
        return "user-list-widget";
    }

}

module.exports = (data, host, options) => {
    return new UserlistWidgetFactoryExtension();
};
