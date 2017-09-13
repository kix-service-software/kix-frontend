import { ContainerConfiguration } from './../../../model/client/components/';
import { DashboardSocketListener } from './../socket/DashboardSocketListener';

export class DashboardState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: DashboardSocketListener = null;

}
