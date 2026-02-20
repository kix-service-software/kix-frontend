import { Server } from '../Server';

export interface IAgentPortalPlugin {

    init(server: Server): Promise<void>;

}