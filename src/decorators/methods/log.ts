import { container } from '../../Container';
import { ILoggingService } from '../../services/';

function log(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): any {
    const orgMethod = descriptor.value;
    // TODO: replace container.get with @inject within a constructor
    const loggingService = container.getDIContainer().get<ILoggingService>("ILoggingService");
    descriptor.value = function () {
        loggingService.info(target.constructor.name + ' => ' + propertyName, arguments);
        return orgMethod.apply(this, arguments);
    };
    return descriptor;
}
export { log };
