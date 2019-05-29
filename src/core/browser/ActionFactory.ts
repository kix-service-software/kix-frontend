import { AbstractAction } from "../model";


export class ActionFactory<T extends AbstractAction> {

    private actions: Array<[string, new () => T]> = [];

    private static INSTANCE: ActionFactory<AbstractAction> = null;

    public static getInstance(): ActionFactory<AbstractAction> {
        if (!ActionFactory.INSTANCE) {
            ActionFactory.INSTANCE = new ActionFactory();
        }

        return ActionFactory.INSTANCE;
    }

    public registerAction(actionId: string, action: new () => T): void {
        const index = this.actions.findIndex((a) => a[0] === actionId);
        if (index !== -1) {
            // TODO: Error Handling and logging
            console.warn('Duplicate action registered: ' + actionId);
        }
        this.actions.push([actionId, action]);
    }

    public async generateActions(actionIds: string[], data?: any): Promise<AbstractAction[]> {
        const actions = [];
        if (actionIds) {
            for (const actionId of actionIds) {
                const actionPrototype = this.actions.find((al) => al[0] === actionId);
                if (actionPrototype) {
                    const action = new actionPrototype[1]();
                    action.initAction();
                    await action.setData(data);
                    actions.push(action);
                }
            }
        }

        return actions;
    }

}
