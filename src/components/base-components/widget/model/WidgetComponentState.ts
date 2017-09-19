import { IWidget, WidgetConfiguration, IAction } from '@kix/core';

export class WidgetComponentState {

    public configurationMode: boolean = false;

    public showConfiguration: boolean = false;

    public actions: IAction[] = [];

    public contentConfiguration: any = null;

    public widget: IWidget = null;

    public contentData: any = null;

}
