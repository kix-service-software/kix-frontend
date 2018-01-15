import { ConfiguredWidget, WidgetTemplate } from '@kix/core/dist/model';

export class HomeComponentState {

    public static MODULE_ID: string = 'home';

    public rows: string[][] = [];

    public configuredWidgets: ConfiguredWidget[] = [];
}
