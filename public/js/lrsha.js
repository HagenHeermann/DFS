function login_hash(l_form)
{
    var input_u_pw = l_form['password'];        
    input_u_pw.value = CryptoJS.SHA3(input_u_pw.value);
}

function registration_hash(r_form)
{
    var input_u_pw_0 = r_form['password0'];
    var input_u_pw_1 = r_form['password1'];
    input_u_pw_0.value = CryptoJS.SHA3(input_u_pw_0.value);
    input_u_pw_1.value = CryptoJS.SHA3(input_u_pw_1.value);
}