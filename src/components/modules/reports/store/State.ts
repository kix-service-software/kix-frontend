import { ContainerConfiguration } from '@kix/core/dist/model';
import { ReportsSocketListener } from './../socket/SocketListener';

export class ReportsState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: ReportsSocketListener = null;

}
