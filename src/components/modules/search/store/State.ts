import { ContainerConfiguration } from '@kix/core/dist/model';
import { SearchSocketListener } from './../socket/SocketListener';

export class SearchState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: SearchSocketListener = null;

}
