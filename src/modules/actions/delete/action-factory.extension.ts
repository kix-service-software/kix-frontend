import { DeleteAction } from './DeleteAction';
import { IAction, IActionFactoryExtension } from '@kix/core';

export class DeleteActionFactoryExtension implements IActionFactoryExtension {

    public getActionId(): string {
        return "delete-action";
    }

    public createAction(): IAction {
        return new DeleteAction(this.getActionId(), "Delete", "");
    }

}

module.exports = (data, host, options) => {
    return new DeleteActionFactoryExtension();
};
