import { IKIXObjectFactory } from "../kix";
import { Customer, CustomerFactory } from "../../model";

export class CustomerBrowserFactory implements IKIXObjectFactory<Customer> {

    private static INSTANCE: CustomerBrowserFactory;

    public static getInstance(): CustomerBrowserFactory {
        if (!CustomerBrowserFactory.INSTANCE) {
            CustomerBrowserFactory.INSTANCE = new CustomerBrowserFactory();
        }
        return CustomerBrowserFactory.INSTANCE;
    }

    public async create(customer: Customer): Promise<Customer> {
        return CustomerFactory.create(customer);
    }

}
