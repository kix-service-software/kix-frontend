import { LoggingService } from "../../services";

function log(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>): any {
    const orgMethod = descriptor.value;
    descriptor.value = function () {
        LoggingService.getInstance().info(target.constructor.name + ' => ' + propertyName, arguments);
        return orgMethod.apply(this, arguments);
    };
    return descriptor;
}
export { log };
