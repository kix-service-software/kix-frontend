import { DashboardComponentState } from './model/DashboardComponentState';
import { DashboardState } from './store/DashboardState';
import { DASHBOARD_INITIALIZE } from './store/actions';

class DashboardComponent {

    public state: DashboardComponentState;

    public frontendSocketUrl: string;

    public store: any;

    public onCreate(input: any): void {
        this.state = new DashboardComponentState();
        this.frontendSocketUrl = input.frontendSocketUrl;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(DASHBOARD_INITIALIZE(this.frontendSocketUrl));
    }

    public stateChanged(): void {
        const reduxState: DashboardState = this.store.getState();
    }
}

module.exports = DashboardComponent;
