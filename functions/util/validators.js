const { user } = require("firebase-functions/lib/providers/auth");

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
  };

  
  exports.validateSignupData = (data) => {
      
  let errors = {};
  
  if(isEmpty(data.email)){
    errors.email = 'Email é um campo obrigatório'
  } else if(!isEmail(data.email)){
    errors.email = 'O email introduzido não é valido'
  }

  if(isEmpty(data.password)) errors.password = 'Password é um campo obrigatório';
  if(data.password !== data.confirmPassword) errors.confirmPassword = 'As passwords não são iguais ';
  if(isEmpty(data.handle)) errors.handle = 'Não pode estar vazio';


  return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false // no keys fica true se tiver fica false (0 erros a data e valida)
  }

  }




  exports.validateLoginData = (data) => {




    let errors = {};
  
    if(isEmpty(data.email)) errors.email= 'Não pode estar vazio';
    if(isEmpty(data.password)) password.email= 'Não pode estar vazio';
  
    
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false // no keys fica true se tiver fica false (0 erros a data e valida)
}
  }

//react manda isto empty caso utilizador n preencha
  exports.reduceUserDetails = (data) =>{
    let userDetails = {};
    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
      // https://website.com
      // pegamos em h t t p se nao tiver acvresentamos
      if(data.website.trim().substring(0,4) != 'http'){
        userDetails.website = `http://${data.website.trim()}`;
      } else userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;
    return userDetails;
  }