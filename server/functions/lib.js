const axios = require('axios')

const axios_header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const axios_auth = {
  loginId: 'cocklelegalbriefs',
  password: 'Lg3422831!',
}

const authJson = `{"loginId": "${axios_auth.loginId}", "password": "${axios_auth.password}" }`

function getNewAuthAndSaveToDb() {
  axios
    .post(`https://pacer.login.uscourts.gov/services/cso-auth`, authJson, {
      headers: axios_header,
    })
    .then((response) => {
      console.log('Authenticated')

      next_gen_cso = response.data.nextGenCSO
      next_gen_cso_json = response.data
      next_gen_cso_json.date = Date()
      saveAuthToDb()
      console.log(next_gen_cso)
      return next_gen_cso
    })
    .catch((err) => {
      console.log('Error on Authentication')
      console.log(err.message)
      return err.message
    })
}

const getLatestAuthFromDb = async () => {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb+srv://${mongo_creds.username}:${mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`

  const client = new MongoClient(uri)
  let result = {}
  let item = {}

  try {
    const collection = client.db('pacer_auth').collection('nextGenCSO')
    result = await collection.find({}).sort({ date: -1 }).limit(1).toArray()
  } finally {
    await client.close()
  }
  return result[0].nextGenCSO
}

const mongo_creds = {
  username: 'd4okeefe_pacer',
  password: 'C4yprCxVqcdVpMzX',
}

const saveAuthToDb = async () => {
  const { MongoClient } = require('mongodb')
  const uri = `mongodb+srv://${mongo_creds.username}:${mongo_creds.password}@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`
  // const uri = `mongodb+srv://d4okeefe:TE2BOx4XpgSX6NcT@cluster0.jdy6d.gcp.mongodb.net/?retryWrites=true&w=majority`

  const client = new MongoClient(uri)
  let result = {}

  try {
    const database = client.db('pacer_auth')
    const collection = database.collection('nextGenCSO')

    result = await collection.insertOne(next_gen_cso_json)
    console.log(`A document was inserted with the _id: ${result.insertedId}`)
  } finally {
    await client.close()
  }
}

module.exports = { getNewAuthAndSaveToDb, saveAuthToDb, getLatestAuthFromDb }
