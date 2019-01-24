import {DI} from "../DI";
import {ExpressServer} from "../server/ExpressServer";
import {Request, Response} from "express";
import {PermissionType} from "../utils/PermissionType";
import {UploadedFile} from "express-fileupload";

/**
 * The controller of storage related REST endpoints.
 * @constructor
 */
export function StorageRoutes() {

    const storageService = DI.storageService;
    const server = ExpressServer;

    server.get("/s3/health", (_request: Request, response: Response) => {
        response.sendStatus(200);
    });

    server.post("/s3/:userId/files/:fileName",
        async (request: Request, response: Response) => {
            let userId = request.params.userId;
            let fileName = request.params.fileName;
            let permissionType = request.query.PermissionType | PermissionType.PUBLIC;

            let filePart = Object.keys(request.files);
            let file = request.files[filePart[0]];

            let meta = await storageService.storeFile(userId, file, fileName, permissionType);
            go200(response, JSON.stringify(meta))
        });

    server.get("/s3/:userId/files/:fileName",
        async (request: Request, response: Response) => {
            let userId = request.params.userId;
            let fileName = request.params.fileName;
            let accessToken = request.query.accessToken;
            let metadata = resolveMetadata(request);

            if (metadata) {
                let content = await storageService.getMetadata(fileName, userId, accessToken);

                if (content) {
                    go200(response, JSON.stringify(content));
                }
            }
            else {
                let content = await storageService.getFile(userId, fileName, accessToken);

                if (content) {
                    go200(response, content);
                }
            }

            go404(response);
        });

    server.put("/s3/:userId/files/:fileName/private",
        async (request: Request, response: Response) => {
            await setPermissions(request, response, PermissionType.PRIVATE);
        });

    server.put("/s3/:userId/files/:fileName/public",
        async (request: Request, response: Response) => {
            await setPermissions(request, response, PermissionType.PUBLIC);
        });

    server.del("/s3/:userId/files/:fileName",
        async (request: Request, response: Response) => {
            let userId = request.params.userId;
            let fileName = request.params.fileName;
            let accessToken = request.query.accessToken;

            let result = await storageService.deleteFile(userId, fileName, accessToken);

            if (result) go200(response, "Deleted");
            else go404(response)
        });

    async function setPermissions(request: Request, response: Response, type: PermissionType) {
        let userId = request.params.userId;
        let fileName = request.params.fileName;
        let accessToken = request.query.accessToken;

        let metadata = await storageService.setPermission(fileName, type, userId, accessToken);

        if (metadata) go200(response, JSON.stringify(metadata));
        else go404(response);
    }

    function resolveMetadata(request: Request): boolean {
        let defaultValue = false;

        if (request.query.metadata) {
            if (request.query.metadata === "true")
                return true;
        }

        return defaultValue;
    }

    function go404(response: Response) {
        response.sendStatus(404);
    }

    function go200(response: Response, content: any) {
        response.send(content);
    }
}