import { Service } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class ServiceBrowserFactory implements IKIXObjectFactory<Service> {

    private static INSTANCE: ServiceBrowserFactory;

    public static getInstance(): ServiceBrowserFactory {
        if (!ServiceBrowserFactory.INSTANCE) {
            ServiceBrowserFactory.INSTANCE = new ServiceBrowserFactory();
        }
        return ServiceBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(service: Service): Promise<Service> {
        return new Service(service);
    }

}
