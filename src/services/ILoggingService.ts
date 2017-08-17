export interface ILoggingService {

    error(message: string, meta?: object): void;
    warning(message: string, meta?: object): void;
    info(message: string, meta?: object): void;
    debug(message: string, meta?: object): void;
    log?(level: string, message: string, meta?: object): void;

}
