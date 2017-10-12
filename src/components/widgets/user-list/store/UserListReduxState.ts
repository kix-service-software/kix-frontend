import { UserListConfiguration } from './../model/UserListConfiguration';
import { UIProperty, WidgetConfiguration, WidgetReduxState } from '@kix/core/dist/model/client';
import { UserListSocketListener } from './../socket/UserListSocketListener';

export class UserListReduxState extends WidgetReduxState {

    public users: any[] = [];

    public configuration: UserListConfiguration;

    public socketListener: UserListSocketListener;





}
