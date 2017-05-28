function login_hash(l_form)
{
    var input_u_name = l_form['username'];
    var input_u_pw = l_form['password'];        
    input_u_name.value = CryptoJS.SHA3(input_u_name.value);
    input_u_pw.value = CryptoJS.SHA3(input_u_pw.value);
}

function registration_hash(r_form)
{
    var input_u_name = r_form['username'];
    var input_u_pw_0 = r_form['password0'];
    var input_u_pw_1 = r_form['password1'];
    input_u_name.value = CryptoHS.SHA3(input_u_name.value);
    input_u_pw_0.value = CryptoHS.SHA3(input_u_pw_0.value);
    input_u_pw_1.value = CryptoHS.SHA3(input_u_pw_1.value);
}