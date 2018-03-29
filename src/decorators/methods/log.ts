import { ILoggingService } from '@kix/core/dist/services';
import { ServiceContainer } from '@kix/core/dist/common';

function log(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): any {
    const orgMethod = descriptor.value;
    const loggingService = ServiceContainer.getInstance().getClass<ILoggingService>("ILoggingService");
    descriptor.value = function () {
        loggingService.info(target.constructor.name + ' => ' + propertyName, arguments);
        return orgMethod.apply(this, arguments);
    };
    return descriptor;
}
export { log };
