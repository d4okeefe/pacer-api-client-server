const express = require('express')
const PORT = process.env.PORT || 3001
const app = express()

const axios = require('axios')
const lib = require('./functions/lib')

lib.getNewAuthAndSaveToDb()

const axios_header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const axios_auth = {
  loginId: 'cocklelegalbriefs',
  password: 'Lg3422831!',
}

const authJson = `{"loginId": "${axios_auth.loginId}", "password": "${axios_auth.password}" }`
// console.log(authJson)

let next_gen_cso = ''
let next_gen_cso_json = {}

/**
 * /mongo/auth
 * Get nextGenCSO from Pacer in order to login & search
 */
app.get('/mongo/auth', async (req, res) => {
  const { MongoClient } = require('mongodb')
  //const uri = `mongodb+srv://${lib.mongo_creds.username}:${lib.mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`
  const uri = `mongodb+srv://d4okeefe_pacer:C4yprCxVqcdVpMzX@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`

  const client = new MongoClient(uri)
  let result = {}

  try {
    const database = client.db('pacer_auth')
    const collection = database.collection('nextGenCSO')

    //result = await collection.find({}).toArray()
    result = await collection.find({}).sort({ date: -1 }).limit(1).toArray()
  } finally {
    await client.close()
  }
  res.json(result)
})

app.get('/mongo/auth/collection', async (req, res) => {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb+srv://${mongo_creds.username}:${mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`

  const client = new MongoClient(uri)
  let result = {}
  let item = {}

  try {
    const collection = client.db('pacer_auth').collection('nextGenCSO')
    result = await collection.find().toArray()
  } finally {
    await client.close()
  }
  res.json(result)
})

app.get('/mongo/auth/collection/latest', async (req, res) => {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb+srv://${mongo_creds.username}:${mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`

  const client = new MongoClient(uri)
  let result = {}

  try {
    const collection = client.db('pacer_auth').collection('nextGenCSO')
    result = await collection.find({}).sort({ date: -1 }).limit(1).toArray()
  } finally {
    await client.close()
  }
  res.json(result)
})

app.get('/pacer/auth', (req, res) => {
  axios
    .post(`https://pacer.login.uscourts.gov/services/cso-auth`, authJson, {
      headers: axios_header,
    })
    .then((response) => {
      console.log('Authenticated')

      next_gen_cso = response.data.nextGenCSO
      next_gen_cso_json = response.data
      next_gen_cso_json.date = Date()
      lib.saveAuthToDb()
      console.log(next_gen_cso)
      res.json(next_gen_cso_json)
    })
    .catch((err) => {
      console.log('Error on Authentication')
      console.log(err.message)
      res.json(err.message)
    })
})

// const getNewAuthAndSaveToDb = () => {
//   axios
//     .post(`https://pacer.login.uscourts.gov/services/cso-auth`, authJson, {
//       headers: axios_header,
//     })
//     .then((response) => {
//       console.log('Authenticated')

//       next_gen_cso = response.data.nextGenCSO
//       next_gen_cso_json = response.data
//       next_gen_cso_json.date = Date()
//       saveAuthToDb()
//       console.log(next_gen_cso)
//       return next_gen_cso
//     })
//     .catch((err) => {
//       console.log('Error on Authentication')
//       console.log(err.message)
//       return err.message
//     })
// }

// const { MongoClient } = require('mongodb')
// const uri = `mongodb+srv://${mongo_creds.username}:${mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`
// const getNewAuthAndSaveToDbWithPromise = () => {
//   axios
//     .post(`https://pacer.login.uscourts.gov/services/cso-auth`, authJson, {
//       headers: axios_header,
//     })
//     .then((response) => {
//       console.log('Authenticated')

//       next_gen_cso = response.data.nextGenCSO
//       next_gen_cso_json = response.data
//       next_gen_cso_json.date = Date()
//       console.log(next_gen_cso)
//       return next_gen_cso
//     })
//     .then((result) => {
//       const client = new MongoClient.connect(uri)
//       const database = client.db('pacer_auth')
//       const collection = database.collection('nextGenCSO')
//     })
//     .then((result) => {
//       return result
//     })
//     .catch((err) => {
//       console.log('Error on Authentication')
//       console.log(err.message)
//       return err.message
//     })
// }

app.get('/pacer/party/:partyname', async (req, res) => {
  //res.send({ partyname: req.params.partyname })
  // const result = await getLatestAuthFromDb()

  const result = await getNewAuthAndSaveToDb()
  // const result = await getLatestAuthFromDb()
  res.send(result)
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})
