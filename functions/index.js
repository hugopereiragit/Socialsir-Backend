const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/fbAuth');
//imports
const { getAllScreams ,postOneScream,getScream,commentarioEmScream} = require('./handlers/screams'); 
const { signup, login, uploadImage,addUserDetails,getUserAutenticado} = require('./handlers/users');



//util routes
// foram refactored para handlers
app.get('/screams', getAllScreams);
//função middleware pra auth (FBAuth) serve para podermos aceder a dados protegidos
app.post('/scream' , FBAuth ,postOneScream);
app.get('/scream/:screamId',getScream);
app.post('/scream/:screamId/comment',FBAuth,commentarioEmScream);

// user routs
app.post('/signup', signup);
app.post('/login',login);
app.post('/user/image',FBAuth,uploadImage);
app.post('/user',FBAuth,addUserDetails);
app.get('/user',FBAuth, getUserAutenticado);
//TODO DELETE SCREAM
//TODO LIKE SCREAM
//TODO UNLIKE SCREAM
//TODO COMMENT SCREAM

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




