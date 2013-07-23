
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Späti Admin' });
};

exports.login = function(req, res){
  res.render('login', { title: 'Login - Späti Admin' });
};