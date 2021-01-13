const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/fbAuth');

const { getAllScreams ,postOneScream} = require('./handlers/screams'); 
const { signup, login, uploadImage} = require('./handlers/users');



//util routes
// foram refactored para handlers
app.get('/screams', getAllScreams);
//função middleware pra auth
app.post('/scream' , FBAuth ,postOneScream);

// user routs
app.post('/signup', signup);
app.post('/login',login);
app.post('/user/image',FBAuth,uploadImage);

// express permite exemplo hhtps//blabla.com/API/screams em vez de https//blabla.com/Screams
exports.api = functions.https.onRequest(app);

/* exports.getScreams = functions.https.onRequest((req, res)=>{
admin
.firestore()
.collection('screams')
.get()
.then((data) =>{
        let screams = [];
        data.forEach((doc) =>{
        screams.push(doc.data());
        });
        return res.json(screams);
      })
      .catch((err) => console.error(err));
 });*/




