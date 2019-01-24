import {ExpressServer} from "./server/ExpressServer";
import {StorageRoutes} from "./controllers/StorageRoutes";

const port = 8080;

console.log(`Starting the server on port ${port}`);

StorageRoutes();

ExpressServer.start(port).then(_value => {
    console.log("Ready to serve...");
});
