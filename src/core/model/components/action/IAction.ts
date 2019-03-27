export interface IAction<T = any> {

    id: string;

    text: string;

    icon: string;

    data: T;

    initAction(): void;
    setData(data: T): void;

    canRun(): boolean;

    run(event: any): void;

}
