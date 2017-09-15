import { IAction } from './../../../model/client/components/';

export class AssignTourAction implements IAction {

    public id: string;

    public name: string;

    public icon: string;

    public template: string = 'actions/assign-tour';

    public useOverlay: boolean = true;

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
