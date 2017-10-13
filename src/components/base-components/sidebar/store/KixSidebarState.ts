import { KixSidebarConfiguration } from '@kix/core/dist/model/client';
import { KixSidebarSocketListener } from './../socket/KixSidebarSocketListener';

export class KixSidebarState {

    public configuration: KixSidebarConfiguration;

    public socketlListener: KixSidebarSocketListener;

    public error: string;

}
