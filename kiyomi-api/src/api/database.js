const mariadb = require('mariadb/promise');
const User = require('./user');

const db_name = 'kiyomi';
const table_prefix = 'km'

const user = `${db_name}.${table_prefix}_user`;
const user_table =  `
CREATE TABLE IF NOT EXISTS ${user}
(
   id INT NOT NULL AUTO_INCREMENT KEY,
   name TEXT NOT NULL
);`;

const user_watching = `${ db_name }.${ table_prefix }_user_watching`;
const user_watching_table = 
`CREATE TABLE IF NOT EXISTS ${user_watching}
(
   user_id INTEGER NOT NULL,
   anime_id INTEGER NOT NULL,
   PRIMARY KEY(user_id, anime_id),
   CONSTRAINT fk_user_id
      FOREIGN KEY(user_id) REFERENCES ${db_name}.${table_prefix}_user(id)
         ON DELETE CASCADE
);`

const db_bootstrap = {
   create: `CREATE DATABASE IF NOT EXISTS ${db_name};`,
   tables: [
      user_table,
      user_watching_table
   ]
}

class KiyomiDB {
   constructor(pool) {
      this.pool = pool;
      this.bootstrap();
   }

   async bootstrap() {
      let conn;
      try {
         conn = await this.pool.getConnection();
         await conn.query(db_bootstrap.create);
         for (const tbl of db_bootstrap.tables) {
            await conn.query(tbl);
         }
         conn.release();
         console.log(`Created database ${db_name}`);
      } catch (e) {
         console.log('db bootstrap failed', e.toString());
      } finally {
         conn?.release();
      }
   }

   parseUser(rows) {
      if (rows.length < 1) {
         return null;
      }
      const user = new User(rows[0].id, rows[0].name);
      for (const row of rows) {
         if (row.anime_id) {
            user.watching.push(row.anime_id);
         }
      }
      return user;
   }

   async getUserByName(name) {
      const result = await this
         .query(`select * from ${user} left join
          ${user_watching} on ${user}.id = ${user_watching}.user_id where ${user}.name = ? ;`, [name]);

     return this.parseUser(result);
   }

   async getUserById(id) {
      const result = await this
         .query(`select * from ${user} left join
          ${user_watching} on ${user}.id = ${user_watching}.user_id where ${user}.id = ?;`, [id]);
      return this.parseUser(result);
   }

   async userExists(id) {
      const result = await this.getUserById(id);
      return result !== null;
   }

   async insertUser(user) {
      const result = await this
         .query(`insert into ${user} (name) values(?)`, [user.name]);
      return result.insertId;
   }

   async updateUser(user) {
      await this
         .query(`update ${user} set name = ? where id = ?`, [user.name, user.id]);
   }

   async watchedExists(userId, animeId) {
      const result = await this
         .query(`select 1 from ${user_watching} where user_id = ? and anime_id = ?`, [userId, animeId]);
      return result.length > 0;
   }

   async addWatched(userId, animeId) {
      return this
         .query(`insert into ${user_watching} (user_id, anime_id) values (?, ?)`, [userId, animeId])
   }

   async deleteWatched(userId, animeId) {
      return this
         .query(`delete from ${db_name}.${table_prefix}_user_watching where user_id = ? and anime_id = ?`, [userId, animeId]);
   }

   async getWatched(userId) {
      const result = await this
         .query(`select * from ${db_name}.${table_prefix}_user_watching where user_id = ?`, [userId]);
      return result;
   }

   async query(sql, parameters) {
      let conn;
      try {
         conn = await this.pool.getConnection();
         const res = await conn.query({ rowsAsArray: false, sql }, parameters || []);
         return res;
      } catch (err) {
         throw err;
      } finally {
         conn?.release();
      }
   }


   async batch(sql) {
      let conn;
      try {
         conn = await this.pool.getConnection();
         const res = await conn.batch(sql);
         return res;
      } catch (err) {
         throw err;
      } finally {
         conn?.release();
      }
   }
}

let pool = null;
module.exports = function (db_connection_options) {
   if (!pool) {
      pool = mariadb.createPool(db_connection_options);
   }
   const db = new KiyomiDB(pool);
   return db;
}