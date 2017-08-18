export interface ILoggingService {

    defaultLevelNumber;
    error(message: string, meta?: object): void;
    warning(message: string, meta?: object): void;
    info(message: string, meta?: object): void;
    debug(message: string, meta?: object): void;

}
