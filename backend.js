const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3');

// 季世三
const db = new sqlite.Database('./kiyomi.db')
db.run(`
   CREATE TABLE
   if not exists user
   (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
   );`
);

db.run(`
   CREATE TABLE
   if not exists user_watching
   (
      userid INTEGER NOT NULL,
      animeid INTEGER NOT NULL,
      FOREIGN KEY(userid) REFERENCES users(id)
      PRIMARY KEY(userId, animeId)
   );
   `);

const port = 3002;
const host = 'localhost';

const app = express();
app.use(bodyParser.json());

function insert(query, params) {
   return new Promise((resolve, reject) => {
      db.run(query, params, function (error) {
         if (error) {
            reject(error);
            return;
         }
         resolve(this.lastID);
      });
   });
}

function run(query, params) {
   return new Promise((resolve, _) => {
      db.run(query, params, error => {
         if (error) {
            throw error;
         }
         resolve();
      });
   });
}

async function select(query, params) {
   return new Promise((resolve, _) => {
      const rows = [];
      db.each(query, params, (error, row) => {
         if (error) {
            throw error;
         }
         rows.push(row);
      }, () => {
         resolve(rows);
      });
      
   });
}

async function getUser(id) {
   return new Promise(async (resolve, _) => {
      const rows = await select(`SELECT * FROM user LEFT OUTER JOIN user_watching
         ON user.id = user_watching.userid WHERE id = ?`, [id]);

      console.log('rows in getUser', rows);

      if (rows.length < 1) {
         resolve(null);
         return;
      }

      const user = { id: rows[0].id, name: rows[0].name, watching: rows[0].animeid ? [rows[0].animeid] : [] };
      for (let i = 1; i < rows.length; i++) {
         user.watching.push(rows[i].animeid )
      }

      resolve(user);
   });
}

async function userExists(userId) {
   const rows = await select('SELECT 1 FROM user WHERE id = ?', [userId]);
   return rows.length > 0 ? true : false;
}

app.get('/kiyomi/user/:id', async (req, res) => {
   console.log(`get /kiyomi/user/${req.params.id}`);
   if (isNaN(req.params.id)) {
      res.sendStatus(400);
      return;
   }
   try {
      const user = await getUser(req.params.id);
      if (!user) {
         res.sendStatus(404);
         return;
      }
      res.json(user);
   } catch (e) {
      res.sendStatus(500);
   }
});

app.post('/kiyomi/user', async (req, res) => {
   console.log('post /kiyomi/user', req.body);
   if ((req.body.id || 0) !== 0 || !req.body.name) {
      res.sendStatus(400);
   } else {
      let user = req.body;
      try {
         user.id = await insert('INSERT INTO user (name) VALUES(?)', [user.name]);
         user = getUser(user.id);
         res.status(201).json(user);
      } catch (e) {
         res.sendStatus(500);
      }
   }
});

app.put('/kiyomi/user/:userId', async (req, res) => {
   console.log(`put /kiyomi/user/${req.params.userId}`, req.body);
   let user = req.body;
   if (!user || isNaN(user.id) || user.id !== req.params.userId || !user.name) {
      res.sendStatus(400);
      return;
   }

   if (!(await userExists(user.id))) {
      res.sendStatus(404);
      return;
   }

   try {
      await run('UPDATE user SET name = ? where id = ?', [user.name, user.id]);
      user = getUser(user.id);
      res.json(user);
   } catch (e) {
      res.sendStatus(500);
   }
});

app.post('/kiyomi/user/:userId/watched', async (req, res) => {
   console.log(`post /kiyomi/${req.params.userId}/watched`, req.body);
   if (!req.body || !req.body.animeId
      || req.body.animeId < 1) {
      res.sendStatus(400);
   }

   if (!(await userExists(req.params.userId))) {
      res.sendStatus(404);
      return;
   }

   const exists = (await select('SELECT 1 FROM user_watching where userId = ? AND animeId = ?',
       [req.params.userId, req.params.animeId])).length > 0 ? true : false;

   if (exists) {
      res.sendStatus(304)
      return;
   }

   try {
      await insert('INSERT INTO user_watching (userid, animeid) values (?, ?)', [req.params.userId, req.body.animeId])
      res.sendStatus(204);
   } catch (e) {
      console.log(e);
      res.sendStatus(500);
   }
});

app.delete('/kiyomi/user/:userId/watched/:animeId', async (req, res) => {
   console.log(`delete /kiyomi/user/${req.params.userId}/watched/${req.params.animeId}`);
   try {
      await run('DELETE FROM user_watching WHERE userid = ? AND animeid = ?', [req.params.userId, req.params.animeId]);
      res.sendStatus(204);
   } catch (e) {
      console.error(e);
      res.sendStatus(500);
   }
});

app.get('/kiyomi/user/:userId/watched', async (req, res) => {
   if (!req.params.userId || isNaN(req.params.userId) || req.params.userId < 1) {
      res.sendStatus(400);
      return;
   }
   const watching = await select('SELECT * FROM user_watching WHERE userid = ?', [], (row, resolve, _) => {
      const r = [];
      if (rows) {
         rows.forEach(x => {
            r.push({ userId: row.userId, animeId: row.animeId });
         });
      }
      resolve(rows);
   });

   res.json(watching);
});

app.listen(port, host, () => console.log(`Kiyomi API listening on ${host}:${port}`))