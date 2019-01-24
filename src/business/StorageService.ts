import {InMemUserRepository} from "../data/UserRepository";
import {FileMetadataModel, InMemFileMetadataRepository} from "../data/FileMetadataRepository";
import {UploadedFile} from "express-fileupload";
import {PermissionType} from "../utils/PermissionType";
import {FileUtils} from "../utils/FileUtils";

/**
 * The StorageService handles business logic only
 */
export class StorageService {

    constructor(private userRepo: InMemUserRepository,
                private metaRepo: InMemFileMetadataRepository) {
    }

    /**
     * Saves a file and updates its metadata
     * @param {string} userId - the id of the user
     * @param {fileUpload.UploadedFile} uploadedFile - the file to be stored
     * @param {string} fileName the referenced file name
     * @param {PermissionType} permissionType the type of permission
     * @returns {Promise<FileMetadataModel>}
     */
    async storeFile(userId: string,
                    uploadedFile: UploadedFile,
                    fileName: string,
                    permissionType: PermissionType): Promise<FileMetadataModel> {

        let path = StorageService.filePath(userId, uploadedFile.name);

        let metadata = new FileMetadataModel(
            fileName,
            path,
            uploadedFile.data.length,
            permissionType,
            false,
            new Date(),
            new Date()
        );

        await FileUtils.move(uploadedFile, path);

        await this.metaRepo.save(metadata);

        return new Promise<FileMetadataModel>(_resolve => _resolve(metadata));
    }

    /**
     * Gets the metadata of a file
     * @param {string} fileName the file name (as given in the store command)
     * @param {string} userId the id of the user
     * @param {string} accessToken the access token (opt) of the user
     * @returns {Promise<FileMetadataModel>}
     */
    async getMetadata(fileName: string, userId: string, accessToken: string): Promise<FileMetadataModel> {

        let metadata = await this.metaRepo.find(fileName);

        let hasPermissions = await this.checkPermission(metadata, userId, accessToken);

        if (hasPermissions) {
            return new Promise<FileMetadataModel>(_resolve => _resolve(metadata));
        }
        else {
            return new Promise<FileMetadataModel>(_resolve => _resolve(null));
        }
    }

    /**
     * Gets the content of a file
     * @param {string} userId the id of the user
     * @param {string} fileName the file name
     * @param {string} accessToken the user's access token (opt)
     * @returns {Promise<Buffer>}
     */
    async getFile(userId: string, fileName: string, accessToken: string): Promise<Buffer> {

        let metadata = await this.metaRepo.find(fileName);

        if (metadata) {
            let hasPermissions = await this.checkPermission(metadata, userId, accessToken);

            if (hasPermissions) {
                return FileUtils.read(metadata.path)
            }
        }

        return new Promise<Buffer>(resolve => {
            resolve(null)
        })
    }

    /**
     * Sets the permission of a given file
     * @param {string} fileName the file's name
     * @param {PermissionType} permissionType the permission type to be set
     * @param {string} userId the id of the user.
     * @param {string} accessToken the access token of the user (opt).
     * @returns {Promise<FileMetadataModel>}
     */
    async setPermission(fileName: string,
                        permissionType: PermissionType,
                        userId: string,
                        accessToken: string): Promise<FileMetadataModel> {

        let metadata = await this.metaRepo.find(fileName);

        if (metadata && !metadata.isDeleted) {

            let hasPermissions = await this.checkPermission(metadata, userId, accessToken);

            if (hasPermissions) {
                metadata.permissionType = permissionType;
                await this.metaRepo.save(metadata);
            }
        }

        return new Promise<FileMetadataModel>(_resolve => _resolve(metadata));
    }

    /**
     * Deletes a file
     * @param {string} userId the id of the user.
     * @param {string} fileName the file's name.
     * @param {string} accessToken the user's access token
     * @returns {Promise<boolean>}
     */
    async deleteFile(userId: string, fileName: string, accessToken: string): Promise<boolean> {
        let metadata = await this.metaRepo.find(fileName);

        if (metadata) {
            let hasPermissions = await this.checkPermission(metadata, userId, accessToken);

            if (hasPermissions) {
                metadata.isDeleted = true;

                await this.metaRepo.save(metadata);

                await FileUtils.delete(metadata.path);

                return new Promise<boolean>(_resolve => _resolve(true))
            }
        }

        return new Promise<boolean>(_resolve => _resolve(false))
    }

    private static filePath(userId: string, name: string): string {
        return `/tmp/${userId}/${name}`;
    }


    private async checkPermission(metadata: FileMetadataModel, userId: string, accessToken: string): Promise<boolean> {
        if (metadata && metadata.permissionType === PermissionType.PRIVATE) {
            let user = await this.userRepo.find(userId);

            if (accessToken != user.accessToken) {
                return new Promise<boolean>(resolve => resolve(false))
            }
        }

        return new Promise<boolean>(resolve => resolve(true))
    }
}