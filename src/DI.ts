import {InMemUserRepository, UserModel} from "./data/UserRepository";
import {InMemFileMetadataRepository} from "./data/FileMetadataRepository";
import {StorageService} from "./business/StorageService";

/**
 * This is an hacky and quick replacement for Dependency Injection container.
 */
export namespace DI {

    // This will simulate the user's DB
    const usersDb = new Map<string, UserModel>();
    usersDb.set("user1", new UserModel("user1", "matan", "abc1"));
    usersDb.set("user2", new UserModel("user2", "maayan", "cba1"));

    export const userRepository = new InMemUserRepository(usersDb);
    export const metadataRepository = new InMemFileMetadataRepository();
    export const storageService = new StorageService(userRepository, metadataRepository);

}