import { IAction } from './../../model/client/components/';

export interface IActionFactoryExtension {

    getActionId(): string;

    createAction(): IAction;

}
