import { ContainerConfiguration } from '@kix/core/dist/model/client';
import { ServicesSocketListener } from './../socket/SocketListener';

export class ServicesState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: ServicesSocketListener = null;

}
