import { ContainerConfiguration } from '@kix/core/dist/model/client';
import { CMDBSocketListener } from './../socket/SocketListener';

export class CMDBState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: CMDBSocketListener = null;

}
