import { SidebarConfiguration, WidgetTemplate } from '@kix/core/dist/model/client';
import { SidebarSocketListener } from './../socket/SidebarSocketListener';

export class SidebarState {

    public configuration: SidebarConfiguration;

    public widgetTemplates: WidgetTemplate[];

    public socketlListener: SidebarSocketListener;

    public error: string;

}
