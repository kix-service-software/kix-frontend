export interface IUIModule {

    priority: number;

    register(): Promise<void>;

    unRegister(): Promise<void>;

}
