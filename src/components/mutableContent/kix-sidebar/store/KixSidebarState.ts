import { KixSidebarConfiguration } from '@kix/core';
import { KixSidebarSocketListener } from './../socket/KixSidebarSocketListener';

export class KixSidebarState {

    public configuration: KixSidebarConfiguration;

    public socketlListener: KixSidebarSocketListener;

    public error: string;

}
