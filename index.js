const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f0ilt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("alpha-bikes");
        const productsCollection = database.collection("products");
        const purchasesCollection = database.collection("purchases")
        const reviewsCollection = database.collection("reviews")
        const usersCollection = database.collection("users")


        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
            console.log(result);
        });

        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // load products get api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // load singlr product get api
        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.json(result);
            // console.log(result);
        });

        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            const result = await purchasesCollection.insertOne(purchase);
            res.json(result);
            // console.log(result);
        });

        // find all order by email api
        app.get('/purchases', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const orders = purchasesCollection.find(query);
            const result = await orders.toArray();
            res.json(result);
        });

        // delete data to delete api
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await purchasesCollection.deleteOne(query);
            res.json(result);
        });

        // user api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // console.log(user);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
            // console.log(result);
        });

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
            // console.log(result);
        })

        // app.put('/users/admin', async (req, res) => {
        //     const user = req.body;
        //     const requester = req.decodedEmail;
        //     console.log(requester);
        //     if (requester) {
        //         const requesterAccount = await usersCollection.findOne({ email: requester });
        //         if (requesterAccount.roll === 'admin') {
        //             const filter = { email: user.email };
        //             const updateDoc = { $set: { roll: 'admin' } };
        //             const result = await usersCollection.updateOne(filter, updateDoc);
        //             res.json(result);
        //             console.log(result);
        //         }
        //     }
        //     else {
        //         res.status(403).json({ message: 'You do not have this access!' });
        //     }
        // });

    }

    finally {
        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello Alpha Bikes')
});

app.listen(port, () => {
    console.log(`listening at: `, port)
});