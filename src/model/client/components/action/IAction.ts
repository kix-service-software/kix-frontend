export interface IAction {

    id: string;

    name: string;

    icon: string;

    template: string;

    useOverlay: boolean;

    canRun(input: any): boolean;

    run(input: any): Promise<void>;

}
