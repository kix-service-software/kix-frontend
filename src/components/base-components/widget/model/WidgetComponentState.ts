import { IWidget, WidgetConfiguration, IAction } from '@kix/core/dist/model/client';

export class WidgetComponentState {

    public configurationMode: boolean = false;

    public showConfiguration: boolean = false;

    public configuration: WidgetConfiguration = null;

    public widget: IWidget = null;

    public contentData: any = null;

    public template: any = null;

    public configurationTemplate: any = null;

}
