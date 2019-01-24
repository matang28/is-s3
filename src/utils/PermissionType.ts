/**
 * Compiles the possible permission types
 * can be associated with file.
 */
export enum PermissionType {
    /**
     * Access to the file will require the user's access token
     */
    PRIVATE,

    /**
     * Access to the file is public.
     */
    PUBLIC
}