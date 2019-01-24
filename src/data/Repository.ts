/**
 * Repositories handles entities and provide a gateway to any kind of datasource
 */
export abstract class Repository<ID, MODEL extends Entity<ID>> {

    /**
     * finds the entity by its id
     * @param {ID} id the id of the entity
     * @returns {MODEL} the entity associated with the provided id.
     */
     async abstract find(id: ID): Promise<MODEL>;

    /**
     * saves the entity
     * @param {MODEL} model the entity to be saved
     * @returns {boolean} true if successful, false otherwise.
     */
    async abstract save(model: MODEL): Promise<boolean>;

    /**
     * deletes the entity
     * @param {ID} id the id of the entity to be deleted.
     * @returns {boolean} true if successful, false otherwise.
     */
    async abstract delete(id: ID): Promise<boolean>;
}

/**
 * Entity is any kind of data class that has a unique identifier.
 * Entities can be managed by a repository.
 */
export abstract class Entity<ID> {

    constructor(public id: ID) {
    }
}