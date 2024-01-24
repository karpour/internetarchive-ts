/**
 * Common request options
 * See {@link https://archive.org/developers/md-read.html#common-options}
 */
export type IaReadRequestCommonOptions = {
    /**
     * Only return the item’s PRIMARY server in the server field
     * @default false
     */
    primaryonly?: boolean;
    /**
     * Force a recompute of the metadata record
     * @default false
     */
    recache?: boolean;
    /**
     * Enable lookahead
     * @see {@link https://archive.org/developers/md-write.html#lookahead}
     * @default true
     */
    lookahead?: boolean;
    /**
     * Authorizes all JSON file reads
     * @default false
     */
    authed?: boolean;
    /**
     * Max. number of files to return in files field
     * @default undefined
     */
    files_limit?: number;
    /**
     * Timeout (in seconds) for reading user JSON files
     * @default undefined
     */
    get_timeout?: number;
    /**
     * If record is recomputed, do not write it to the record server
     * @default false
     */
    dontcache?: boolean;
    /**
     * server may include OFFLINE datanode
     * @default false
     */
    offline_ok?: boolean;
    /**
     * Enable extended errors
     * @default false
     */
    extended_err?: boolean;
};
