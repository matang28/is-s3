import {InMemUserRepository} from "../data/UserRepository";
import {FileMetadataModel, InMemFileMetadataRepository} from "../data/FileMetadataRepository";
import {UploadedFile} from "express-fileupload";
import {PermissionType} from "../utils/PermissionType";
import {FileUtils} from "../utils/FileUtils";

export class StorageService {

    constructor(private userRepo: InMemUserRepository,
                private metaRepo: InMemFileMetadataRepository) {
    }

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