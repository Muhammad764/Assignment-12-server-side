const express = require('express')
const cors = require('cors');
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
      
      // order collection api
      app.post('/order', async (req, res) => {
        const order = req.body
        const result = await orderCollection.insertOne(order)
        res.send(result)
      })

      app.get('/order', async (req, res) => {
            const email = req.query.email
            const query ={email:email}
            const orders  = await orderCollection.find(query).toArray()
            res.send(orders)
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