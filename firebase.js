const admin = require('firebase-admin')

const serviceAccount = require('.key_service_account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

export { db }
