export interface IAction<T = any> {

    id: string;

    text: string;

    icon: string;

    data: T;

    initAction(): Promise<void>;

    setData(data: T): Promise<void>;

    canRun(): boolean;

    run(event: any): void;

}
