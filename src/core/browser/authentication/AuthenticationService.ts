import { AuthenticationSocketListener } from "./AuthenticationSocketListener";
import { UserType } from "../../model/kix/user/UserType";

export class AuthenticationService {

    private static INSTANCE: AuthenticationService = null;

    public static getInstance(): AuthenticationService {
        if (!AuthenticationService.INSTANCE) {
            AuthenticationService.INSTANCE = new AuthenticationService();
        }

        return AuthenticationService.INSTANCE;
    }

    public async login(userName: string, password: string, userType: UserType = UserType.AGENT): Promise<boolean> {
        return await AuthenticationSocketListener.getInstance().login(userName, password, userType);
    }

}
