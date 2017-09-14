export interface IAction {

    getId(): string;

    getName(): string;

    getIcon(): string;

    canRun(input: any): boolean;

    run(input: any): Promise<void>;

}
