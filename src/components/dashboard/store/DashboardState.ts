import { ContainerConfiguration } from '@kix/core';
import { DashboardSocketListener } from './../socket/DashboardSocketListener';

export class DashboardState {

    public containerConfiguration: ContainerConfiguration = new ContainerConfiguration();

    public socketListener: DashboardSocketListener = null;

}
