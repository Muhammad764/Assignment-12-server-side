const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3q0tu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db('leather').collection('services')
        const orderCollection = client.db('leather').collection('order')
      const userCollection = client.db('leather').collection('user')

  const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }
      

  function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
      
      app.get('/service/:id', async (req, res) => {
         const id = req.params.id
         const query = {_id: ObjectId(id)}
         const service = await servicesCollection.findOne(query)
         res.send(service)
      })

      app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
      });
      
      app.get('/user', verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
      });

      app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
     })
      
      app.put('/user/admin/:email', verifyJWT,verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
      
      // order collection api
      app.post('/order', async (req, res) => {
        const order = req.body
        const result = await orderCollection.insertOne(order)
        res.send(result)
      })

      app.get('/order', verifyJWT, async (req, res) => {
        const email = req.query.email
        const decodedEmail = req.decoded.email;
        if (email === decodedEmail) {
          const query ={email:email}
          const orders  = await orderCollection.find(query).toArray()
          return res.send(orders)
        }
        else {
        return res.status(403).send({ message: 'forbidden access' });
      }
            
      })
      
      app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = {_id: ObjectId(id)}
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {
        
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('See the leather collection')
})

app.listen(port, () => {
  console.log(`Leather website listening on port ${port}`)
})