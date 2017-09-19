import { KixSidebarConfiguration } from './../../../../model/client/components/';
import { KixSidebarSocketListener } from './../socket/KixSidebarSocketListener';

export class KixSidebarState {

    public configuration: KixSidebarConfiguration;

    public socketlListener: KixSidebarSocketListener;

    public error: string;

}
