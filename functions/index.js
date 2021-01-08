const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
admin.initializeApp();


const config = {
  
    apiKey: "AIzaSyBoZ2_YgsV1Fix3WDRJuKrYRfOxko3WFY8",
    authDomain: "socialsir-e995c.firebaseapp.com",
    databaseURL: "https://socialsir-e995c-default-rtdb.firebaseio.com",
    projectId: "socialsir-e995c",
    storageBucket: "socialsir-e995c.appspot.com",
    messagingSenderId: "440530050035",
    appId: "1:440530050035:web:f3983dbdb5411f10e6d086",
    measurementId: "G-8Y0W92RML6"
  
};

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req,res) => {
db
  .collection('screams')
  .orderBy('createdAt','desc')
  .get()
  .then((data) =>{
          let screams = [];
          data.forEach((doc) =>{
          screams.push({
            screamID: doc.id,
            body: doc.data().body,
            userHandle: doc.data().userHandle,
            createdAt: doc.data().createdAt
          });
          });
          return res.json(screams);
        })
        .catch((err) => console.error(err));
});

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

 app.post('/scream' ,(req, res)=>{
   if(req.method !== 'POST'){
     res.status(400).json({error: 'Method not allowed'});
   }

const newScream = {
  body: req.body.body,
  userHandle: req.body.userHandle,
  createdAt: new Date().toISOString()
};

db
      .collection('screams')
      .add(newScream)
      .then(doc => {
        res.json({ message: `document ${doc.id} created sucessfully`});

      })
      .catch(err => {
        res.status(500).json({ error: 'something went wrong'});
        console.error(err);
      });
   });



const isEmail = (email) => {
  //reg expression retirada da net para verificar se o email e valido
  // https://emailregex.com/
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(regEx)) return true; //esta string está formatadaa como um email regular
  else return false;
}

const isEmpty = (string) => { //verificar se esta a ser enviado algo vazio
  if(string.trim() === '') return true;
  else return false;
}




// signup rout
app.post('/signup', (req,res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

let errors = {};

  if(isEmpty(newUser.email)){
    errors.email = 'Email é um campo obrigatório'
  } else if(!isEmail(newUser.email)){
    errors.email = 'O email introduzido não é valido'
  }

  if(isEmpty(newUser.password)) errors.password = 'Password é um campo obrigatório';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'As passwords não são iguais ';
  if(isEmpty(newUser.handle)) errors.handle = 'Não pode estar vazio';


  if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    //todo validar data
    let token, userId; //user ID como variavel para ser acedivel
  db.doc(`/users/${newUser.handle}`).get()
  .then(doc => {
    if(doc.exists){ //user ja existe
      return res.status(400).json({ handle: 'this handle is allready taken'});
    } else { 
    return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    }
  })
.then(data =>{
  userId = data.user.uid;
 return data.user.getIdToken();
})
.then(idToken => {
  token = idToken;
  const userCredentials = {
    handle : newUser.handle,
    email: newUser.email,
    createdAt: new Date().toISOString(),
    userId
  };
  db.doc(`/users/${newUser.handle}`).set(userCredentials); //criar o documento
})
.then(() =>{
  return res.status(201).json({ token });
})
.catch(err => {
  console.error(err);
  if(err.code === 'auth/email-already-in-use'){
    return res.status(400).json({email: 'Email is already in use'})
  }else {

  
  return res.status(500).json({error : err.code});
  }
})

 /* firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
  .then(data =>{
    return res.status(201).json({message:`user ${data.user.uid} signed up sucessfully`})
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({ error: err.code});
  });*/
});



app.post('/login',(req,res) => {

  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if(isEmpty(user.email)) errors.email= 'Não pode estar vazio';
  if(isEmpty(user.password)) password.email= 'Não pode estar vazio';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(data => {
    return data.user.getIdToken();
  })
  .then(token => {
    return res.json({token});
  })
  .catch(err =>{
    console.error(err);
    if(err.code === 'auth/wrong-password'){
      return res.status(403).json({ general: "Password Errada "}); // 403 = nao autorizado
    } else {
      return res.status(500).json({
        error: err.code
      });
    }
  });

})

   // express permite exemplo hhtps//blabla.com/API/screams em vez de https//blabla.com/Screams
   exports.api = functions.https.onRequest(app);


