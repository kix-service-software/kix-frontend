import { ContainerConfiguration } from '@kix/core/dist/model/client';
import { FAQSocketListener } from './../socket/SocketListener';

export class FAQState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: FAQSocketListener = null;

}
