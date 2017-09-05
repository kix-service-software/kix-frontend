import { ContainerConfiguration } from './../../model/client/components/dragable-container/ContainerConfiguration';
import { DashboardState } from './../../model/client/store/dashboard/DashboardState';
import { DashboardComponentState } from './../../model/client/components/dashboard/DashboardComponentState';
import { ContainerRow } from './../../model/client/components/dragable-container/ContainerRow';
import { DASHBOARD_INITIALIZE } from '../../model/client/store/dashboard/actions';

class DashboardComponent {

    public state: DashboardComponentState;

    public frontendSocketUrl: string;

    public store: any;

    public onCreate(input: any): void {
        this.state = new DashboardComponentState();
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        this.store = require('../../model/client/store/dashboard');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(DASHBOARD_INITIALIZE(this.frontendSocketUrl));
    }

    public stateChanged(): void {
        const reduxState: DashboardState = this.store.getState();
    }
}

module.exports = DashboardComponent;
