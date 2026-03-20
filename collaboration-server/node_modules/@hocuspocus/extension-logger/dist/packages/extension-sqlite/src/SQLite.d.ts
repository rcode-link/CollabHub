import { Database, DatabaseConfiguration } from '@hocuspocus/extension-database';
import sqlite3 from 'sqlite3';
export declare const schema = "CREATE TABLE IF NOT EXISTS \"documents\" (\n  \"name\" varchar(255) NOT NULL,\n  \"data\" blob NOT NULL,\n  UNIQUE(name)\n)";
export declare const selectQuery = "\n  SELECT data FROM \"documents\" WHERE name = $name ORDER BY rowid DESC\n";
export declare const upsertQuery = "\n  INSERT INTO \"documents\" (\"name\", \"data\") VALUES ($name, $data)\n    ON CONFLICT(name) DO UPDATE SET data = $data\n";
export interface SQLiteConfiguration extends DatabaseConfiguration {
    /**
     * Valid values are filenames, ":memory:" for an anonymous in-memory database and an empty
     * string for an anonymous disk-based database. Anonymous databases are not persisted and
     * when closing the database handle, their contents are lost.
     *
     * https://github.com/mapbox/node-sqlite3/wiki/API#new-sqlite3databasefilename-mode-callback
     */
    database: string;
    /**
     * The database schema to create.
     */
    schema: string;
}
export declare class SQLite extends Database {
    db?: sqlite3.Database;
    configuration: SQLiteConfiguration;
    constructor(configuration?: Partial<SQLiteConfiguration>);
    onConfigure(): Promise<void>;
    onListen(): Promise<void>;
}
