import { ContainerConfiguration } from './../../base-components/dragable-container/model/ContainerConfiguration';
import { DashboardSocketListener } from './../socket/DashboardSocketListener';

export class DashboardState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: DashboardSocketListener = null;

}
