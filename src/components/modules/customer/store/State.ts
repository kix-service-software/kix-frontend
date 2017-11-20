import { ContainerConfiguration } from '@kix/core/dist/model';
import { ServicesSocketListener } from './../socket/SocketListener';

export class CustomerState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: ServicesSocketListener = null;

}
