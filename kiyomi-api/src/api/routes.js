module.exports = function (app, db) {
    app.get('/user', async (req, res) => {
        if (!req.query.name) {
            res.sendStatus(400);
            return;
        }
        try {
            const user = await db.getUserByName(req.query.name);
            if (!user) {
                res.sendStatus(404);
                return;
            }
            res.json(user);
        } catch (e) {
            console.log(e.toString());
            res.sendStatus(500);
        }
    });

    app.get('/user/:id', async (req, res) => {
        if (isNaN(req.params.id)) {
            res.sendStatus(400);
            return;
        }
        try {
            const user = await db.getUserById(req.params.id);
            if (!user) {
                res.sendStatus(404);
                return;
            }
            res.json(user);
        } catch (e) {
            console.log(e.toString());
            res.sendStatus(500);
        }
    });

    app.post('/user', async (req, res) => {
        if ((req.body.id || 0) !== 0 || !req.body.name) {
            res.sendStatus(400);
        } else {
            let user = req.body;
            try {
                const id = await db.insertUser(user);
                const createdUser = await db.getUserById(id);
                res.status(201).json(createdUser);
            } catch (e) {
                console.log(e.toString());
                res.sendStatus(500);
            }
        }
    });

    app.put('/user/:userId', async (req, res) => {
        console.log(`put /user/${req.params.userId}`, req.body);
        let user = req.body;
        if (!user || isNaN(user.id) || user.id !== Number(req.params.userId) || !user.name) {
            res.sendStatus(400);
            return;
        }
        try {
            if (!(await db.userExists(user.id))) {
                res.sendStatus(404);
                return;
            }

            await db.updateUser(user);

            user = await db.getUser(user.id);
            res.json(user);
        } catch (e) {
            console.log(e.toString());
            res.sendStatus(500);
        }
    });

    app.post('/user/:userId/watched', async (req, res) => {
        console.log(`${req.params.userId} : ${req.body.animeId}`);
        if (!req.params.userId || !req.body || !req.body.animeId
            || req.body.animeId < 1) {
            res.sendStatus(400);
        }
        try {
            if (!(await db.userExists(req.params.userId))) {
                res.sendStatus(404);
                return;
            }

            if (await db.watchedExists(req.params.userId, req.body.animeId)) {
                res.sendStatus(304)
                return;
            }
            await db.addWatched(req.params.userId, req.body.animeId);
            res.sendStatus(204);
        } catch (e) {
            console.log(e.toString());
            res.sendStatus(500);
        }
    });


    app.delete('/user/:userId/watched/:animeId', async (req, res) => {
        try {
            await db.deleteWatched(req.params.userId, req.params.animeId);
            res.sendStatus(204);
        } catch (e) {
            console.log(e.toString());
            res.sendStatus(500);
        }
    });

    app.get('/user/:userId/watched', async (req, res) => {
        if (!req.params.userId || isNaN(req.params.userId) || req.params.userId < 1) {
            res.sendStatus(400);
            return;
        }
        try {
            const watching = await db.getWatched(req.params.userId);
            res.json(watching);
        } catch (e) {
            console.log(e.toString())
            res.sendStatus(500);
        }
    });

}

