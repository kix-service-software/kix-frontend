import { container } from '../../Container';
import { ILoggingService } from '../../services/';
function log(target: any, propertyName: string, descriptor: any): MethodDecorator {
    const orgMethod = descriptor.value;
    const loggingService = container.get<ILoggingService>("ILoggingService");
    descriptor.value = function () {
        const msg = target.constructor.name + ' => ' + propertyName;
        loggingService.info(msg, arguments);
        const result = orgMethod.apply(this, arguments);
        return result;
    };
    return descriptor;
}
export { log };
