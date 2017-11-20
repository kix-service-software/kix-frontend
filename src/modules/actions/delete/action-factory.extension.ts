import { DeleteAction } from './DeleteAction';
import { IActionFactoryExtension } from '@kix/core/dist/extensions';
import { IAction } from '@kix/core/dist/model';

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
