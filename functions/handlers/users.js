
const {admin, db } = require('../util/admin');

const config = require('../util/config')

const firebase = require('firebase');
firebase.initializeApp(config)

const { validateSignupData, validateLoginData ,reduceUserDetails} = require('../util/validators');

exports.signup = (req,res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };


    const{ valid,errors } = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors); // se não for valido devolvemos erros
 
    const noImg = 'no-img.png' // imagem  vazia
 
    let token, userId; //user ID como variavel para ser acedivel
    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists){ //user ja existe
        return res.status(400).json({ handle: 'Este nome já foi escolhido'});
      } else { 
      return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
  .then(data =>{ // login depois do signup
    userId = data.user.uid;
   return data.user.getIdToken();
  })
  .then(idToken => {
    token = idToken;
    const userCredentials = { // credenciais para o firebase
      handle : newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      imageUrl:  `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`, //imagem vazia default
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
  
    
    return res.status(500).json({ general : 'Alguma coisa está errada. Por favor tenta de novo'});
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
      return data.user.getIdToken(); //buscar a token
    })
    .then(token => {
      return res.json({token}); //passar a token
    })
    .catch(err =>{
      console.error(err);
      // auth/wrong-password
      if(err.code === 'auth/wrong-password'){
        return res.status(403).json({ general: "Credenciaís errados. Por favor tente de novo"}); // 403 = nao autorizado
      } else {
        return res.status(500).json({
          error: err.code
        });
      }
    });
  
  };

//update details do user
exports.addUserDetails = (req,res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`).update(userDetails)
  .then(() =>{
    return res.json({message : "Detalhes atualizados com sucesso"});
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({error: err.code});
  });
}

//detalhes de utilizador
exports.getDetalhesUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("screams")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "Utilizador não foi encontrado" });
      }
    })
    .then((data) => {
      userData.screams = [];
      data.forEach((doc) => {
        userData.screams.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          screamId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};


//dados do proprio utilizador
exports.getUserAutenticado = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

















/*(req,res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`).get()
  .then(doc => {
    //prevenir crash
    if(doc.exists){
      userData.credentials = doc.data();
      return db.collection('likes').where('userHandle','==',req.user.handle).get();
    }
  })
  .then(data => {
    
    userData.likes = [];
    data.forEach( doc => {
      userData.likes.push(doc.data());
      });
      return db
      .collection("notifications")
      .where("recipient", "==", req.user.handle)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({error: err.code});
  });
}*/


//profile image para o utilizador
//module busboy com npm install --save busboy
  exports.uploadImage = (req,res) => {
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

const busboy = new BusBoy({ headers: req.headers});

let imageFileName;
let imageToBeUploaded = {};


busboy.on('file',(fieldname,file,filename,encoding,mimetype) => {
  console.log(fieldname);
  console.log(filename);
  console.log(mimetype);
  // my.image.png iria causar problemas por isso dividimos por .
  const imageExtension = filename.split('.')[filename.split('.').length - 1];
  //7543267345643756.png
  imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`;
  const filepath = path.join(os.tmpdir(), imageFileName);
  imageToBeUploaded = {filepath,mimetype};
  file.pipe(fs.createWriteStream(filepath));
}); //firebase doc sdk documentação
busboy.on('finish', () =>{
admin.storage().bucket().upload(imageToBeUploaded.filepath, {
  resumable: false,
  metadata:{
    metadata: {
      contentType: imageToBeUploaded.mimetype
    }
  }
})
.then(() =>{
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
  return db.doc(`/users/${req.user.handle}`).update({imageUrl});
})
.then(() => {
  return res.json({message: 'Imagem uploaded com sucesso'});
})
.catch(err =>{
  console.error(err);
  return res.status(500).json({error: err.code});
});
});
busboy.end(req.rawBody);
  };


  

exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: "Notifications marked read" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};