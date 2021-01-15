const {db} = require('../util/admin');


exports.getAllScreams = (req,res) => {
    db
      .collection('screams')
      .orderBy('createdAt','desc')
      .get()
      .then((data) =>{
              let screams = [];
              data.forEach((doc) =>{
              screams.push({
                screamId: doc.id, //screamID
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
              });
              });
              return res.json(screams);
            })
            .catch((err) => console.error(err));
    };


    exports.postOneScream = (req, res)=>{
        if(req.body.body.trim() === ''){
          res.status(400).json({body: 'Body nao pode estar vazio'});
        }
     
     const newScream = {
       body: req.body.body,
       userHandle: req.user.handle,
       userImage: req.user.imageUrl,
       createdAt: new Date().toISOString(),
       likeCount: 0,
       commentCount: 0
     };
     
     db
           .collection('screams')
           .add(newScream)
           .then(doc => {
             const resScream = newScream;
             resScream.screamId = doc.id;
             res.json(resScream);
     
           })
           .catch(err => {
             res.status(500).json({ error: 'something went wrong'});
             console.error(err);
           });
        };

// buscar um scream
        exports.getScream = (req,res) => {
          let screamData = {};
          db.doc(`/screams/${req.params.screamId}`).get()
          .then(doc => {
            if(!doc.exists){
              return res.status(404).json({error: 'Scream não encotrado'})
            }
            screamData = doc.data();
            screamData.screamId = doc.id;
            return db
            .collection('comments')
            .orderBy('createdAt','desc')
            .where('screamId','==',req.params.screamId)
            .get();
          })
          .then(data => {
            screamData.comments = [];
            data.forEach(doc => {
              screamData.comments.push(doc.data())
            });
            return res.json(screamData);
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({error: err.code});
          })
        };
        //comment em scream
        exports.commentarioEmScream = (req,res) => {
          if(req.body.body.trim() === '') return res.status(400).json({error : 'Não deve estar vazio'});

          const newComment = {
            body: req.body.body,
            createdAt: new Date().toISOString(),
            screamId: req.params.screamId,
            userHandle: req.user.handle,
            userImage: req.user.imageUrl
          };

          db.doc(`/screams/${req.params.screamId}`).get()
          .then(doc => {
            if(!doc.exists){
              res.status(404).json({error: 'Scream não existe'});
            }
            return doc.ref.update({ commentCount: doc.data().commentCount + 1});
          })
          .then(() =>{
            return db.collection('comments').add(newComment);
          })
          .then(() => {
            res.json(newComment);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({error: 'Algo está errado :)'});
          });
        };

        //likes
        exports.likeScream = (req, res) => {
          const likeDocument = db
            .collection('likes')
            .where('userHandle', '==', req.user.handle)
            .where('screamId', '==', req.params.screamId)
            .limit(1);
        
          const screamDocument = db.doc(`/screams/${req.params.screamId}`);
        
          let screamData;
        
          screamDocument
            .get()
            .then((doc) => {
              if (doc.exists) {
                screamData = doc.data();
                screamData.screamId = doc.id;
                return likeDocument.get();
              } else {
                return res.status(404).json({ error: 'Scream não encontrado' });
              }
            })
            .then((data) => {
              if (data.empty) {
                return db
                  .collection('likes')
                  .add({
                    screamId: req.params.screamId,
                    userHandle: req.user.handle
                  })
                  .then(() => {
                    screamData.likeCount++;
                    return screamDocument.update({ likeCount: screamData.likeCount });
                  })
                  .then(() => {
                    return res.json(screamData);
                  });
              } else {
                return res.status(400).json({ error: 'Scream já tem like' });
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ error: err.code });
            });
        };
        


        //dislikes


        exports.unlikeScream = (req, res) => {
          const likeDocument = db
            .collection('likes')
            .where('userHandle', '==', req.user.handle)
            .where('screamId', '==', req.params.screamId)
            .limit(1);
        
          const screamDocument = db.doc(`/screams/${req.params.screamId}`);
        
          let screamData;
        
          screamDocument
            .get()
            .then((doc) => {
              if (doc.exists) {
                screamData = doc.data();
                screamData.screamId = doc.id;
                return likeDocument.get();
              } else {
                return res.status(404).json({ error: 'Scream não encontrado' });
              }
            })
            .then((data) => {
              if (data.empty) {
                return res.status(400).json({ error: 'Scream ainda não levou like' });
              } else {
                return db
                  .doc(`/likes/${data.docs[0].id}`)
                  .delete()
                  .then(() => {
                    screamData.likeCount--;
                    return screamDocument.update({ likeCount: screamData.likeCount });
                  })
                  .then(() => {
                    res.json(screamData);
                  });
              }
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ error: err.code });
            });
        };




        //apagar scream
        exports.apagarScream = (req,res) => {const document = db.doc(`/screams/${req.params.screamId}`);
        document
          .get()
          .then((doc) => {
            if (!doc.exists) {
              return res.status(404).json({ error: 'Scream não encontrado' });
            }
            if (doc.data().userHandle !== req.user.handle) {
              return res.status(403).json({ error: 'Não autorizado' });
            } else {
              return document.delete();
            }
          })
          .then(() => {
            res.json({ message: 'Scream apagado com sucesso' });
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
          });
      };
      