import { DeleteAction } from './DeleteAction';
import { IAction } from './../../../model/client/components/action/IAction';
import { IActionFactoryExtension } from './../../../extensions/';

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
