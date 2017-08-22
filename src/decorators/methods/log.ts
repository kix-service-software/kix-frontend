import { container } from '../../Container';
import { ILoggingService } from '../../services/';
function log(target: any, propertyName: string, descriptor: any): MethodDecorator {
    const orgMethod = descriptor.value;
    descriptor.value = function () {
        const loggingService = container.get<ILoggingService>("ILoggingService");
        const msg = target.constructor.name + ' => ' + propertyName;
        loggingService.info(msg, arguments);
        const result = orgMethod.apply(this, arguments);
        return result;
    };
    return descriptor;
}
export { log };
