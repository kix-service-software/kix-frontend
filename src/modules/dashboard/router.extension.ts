import { DashboardRouter } from './DashboardRouter';
import { IRouterExtension } from './../../extensions/';

export class DashboardRouterExtension implements IRouterExtension {

    public getRouterClass(): any {
        return DashboardRouter;
    }

}

module.exports = (data, host, options) => {
    return new DashboardRouterExtension();
};
