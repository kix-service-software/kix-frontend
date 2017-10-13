import { SidebarConfiguration } from '@kix/core/dist/model/client';
import { SidebarSocketListener } from './../socket/SidebarSocketListener';

export class SidebarState {

    public configuration: SidebarConfiguration;

    public socketlListener: SidebarSocketListener;

    public error: string;

}
