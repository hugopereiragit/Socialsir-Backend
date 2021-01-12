
const { db } = require('../util/admin');

const config = require('../util/config')

const firebase = require('firebase');
firebase.initializeApp(config)

const { validateSignupData, validateLoginData } = require('../util/validators');

exports.signup = (req,res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };


    const{ valid,errors } = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors);
 
 
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
  }



  exports.login = (req,res) => {

    const user = {
      email: req.body.email,
      password: req.body.password
    };
  
    const{ valid,errors } = validateLoginData(user);
    if(!valid) return res.status(400).json(errors);


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
  
  }