import {Entity, Repository} from "./Repository";
import {PermissionType} from "../utils/PermissionType";

/**
 * A repository that hold the file's metadata
 */
export class InMemFileMetadataRepository implements Repository<string, FileMetadataModel> {

    private storage = new Map<string, FileMetadataModel>();

    async find(id: string): Promise<FileMetadataModel> {
        return this.storage.get(id);
    }

    async save(model: FileMetadataModel): Promise<boolean> {
        this.storage.set(model.id, model);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        this.storage.delete(id);
        return true;
    }

}

/**
 * The entity class which represents the metadata of a file
 */
export class FileMetadataModel extends Entity<string> {

    constructor(public id: string,
                public path: string,
                public size: number,
                public permissionType: PermissionType,
                public isDeleted: boolean,
                public createdAt: Date,
                public updatedAt: Date) {
        super(id);
    }
}