import { UserListSettings } from './../model/UserListSettings';
import { UIProperty, WidgetConfiguration, WidgetReduxState } from '@kix/core/dist/model/client';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListReduxState extends WidgetReduxState {

    public users: any[] = [];

    public settings: UserListSettings;

    public socketListener: UserListSocketListener;

}
