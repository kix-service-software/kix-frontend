import { ConfigurationService } from "../src/core/services";
ConfigurationService.getInstance().init(__dirname + '/../config/', __dirname + '/../cert');
