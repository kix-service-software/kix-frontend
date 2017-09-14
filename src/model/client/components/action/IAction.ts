export interface IAction {

    id: string;

    name: string;

    icon: string;

    template: string;

    canRun(input: any): boolean;

    run(input: any): Promise<void>;

}
