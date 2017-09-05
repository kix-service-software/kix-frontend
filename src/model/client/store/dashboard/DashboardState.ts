import { DashboardSocketListener } from './../../socket/dashboard/DashboardSocketListener';
import { ContainerConfiguration } from './../../components/dragable-container/ContainerConfiguration';

export class DashboardState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: DashboardSocketListener = null;

}
