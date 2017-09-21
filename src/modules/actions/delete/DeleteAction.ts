import { IAction } from '@kix/core';

export class DeleteAction implements IAction {

    public id: string;

    public name: string;

    public icon: string;

    public template: string = null;

    public useOverlay: boolean = false;

    public constructor(id: string, name: string, icon: string) {
        this.id = id;
        this.name = name;
        this.icon = icon;
    }

    public canRun(input: any): boolean {
        return true;
    }

    public run(input: any): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 2500);
        });
    }

}
