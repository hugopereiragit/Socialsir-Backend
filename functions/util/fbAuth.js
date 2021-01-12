const {admin} = require('./admin');


module.exports = 

//            request , response , next devolve respota ao handler
 (req,res,next) => {                        //Bearer e um standart de programação para vereficar a condição
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
    idToken = req.headers.authorization.split('Bearer ')[1] //array de 2 strings Bearer e a token o [1] vai buscar a token
  } else {
    console.error('No token found')
    return res.status(403).json({error : 'Unauthorized'}) //403 erro de autorização
  }

  admin.auth().verifyIdToken(idToken)
  .then(decodedToken => {
    req.user = decodedToken; // para eliminar data extra a fim de nao afetar proximos requests
    console.log(decodedToken);
    return db.collection('users')
    .where('userId', '==', req.user.uid)
    .limit(1) // 1 resultado
    .get();
  })
  .then(data => {
   req.user.handle = data.docs[0].data().handle; // busca do handle e attach ao user.handle
   return next();
  })
  .catch(err => {
    console.error('Erro ao verificar a token', err)
    return res.status(403).json(err);
  })
}


