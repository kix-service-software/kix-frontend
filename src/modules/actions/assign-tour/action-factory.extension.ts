import { AssignTourAction } from './AssignTourAction';
import { IActionFactoryExtension, IAction } from '@kix/core';

export class AssignTourActionFactoryExtension implements IActionFactoryExtension {

    public getActionId(): string {
        return "assign-tour-action";
    }

    public createAction(): IAction {
        return new AssignTourAction(this.getActionId(), "Assign Tour", "");
    }

}

module.exports = (data, host, options) => {
    return new AssignTourActionFactoryExtension();
};
