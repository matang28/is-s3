import {Entity, Repository} from "./Repository";

export class InMemUserRepository implements Repository<string, UserModel> {

    private storage = new Map<string, UserModel>();

    constructor(storage: Map<string, UserModel>) {
        this.storage = storage;
    }

    async find(id: string): Promise<UserModel> {
        return this.storage.get(id);
    }

    async save(model: UserModel): Promise<boolean> {
        this.storage.set(model.id, model);
        return true;
    }

    async delete(id: string): Promise<boolean> {
        this.storage.delete(id);
        return true;
    }
}

export class UserModel extends Entity<string> {

    constructor(public id: string,
                public name: string,
                public accessToken: string) {
        super(id);
    }
}