window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();
// ******************** Show Password ********************************
document.getElementById("show_pass_icon").onclick = function(){
  let pass_textbox = document.getElementById("user_password");
  let show_password_icon = document.getElementById("show_pass");
  let no_show_password_icon = document.getElementById("no_show_pass");
  if (pass_textbox.type === "password"){
    pass_textbox.type = "text";
    show_password_icon.style.display = "none";
    no_show_password_icon.style.display = "block";
  }
  else{
    pass_textbox.type = "password";
    show_password_icon.style.display = "block";
    no_show_password_icon.style.display = "none";
  }
}
// *********************************************************************
let sign_up_button = document.querySelector(".signup_button");
let fname_textbox = document.querySelector(".fname_textbox");
let fname_labe = document.querySelector(".fname_label");
let nick_name_textbox = document.querySelector(".nickname_textbox");
let lname_textbox = document.querySelector(".lname_textbox");
let phone_textbox = document.querySelector(".phone_textbox");
let email_label = document.querySelector("#email_label");
let email_textbox = document.querySelector(".email_textbox");
let password_textbox = document.querySelector(".password_textbox");
let password_label1 = document.querySelector(".pass_requirement1");
let password_label2 = document.querySelector(".pass_requirement2");

let requiered_field_entered = false;
let email_approved = false;
let pass_approved = false;
const first_name_pattern = /^[a-zA-Z]+[-_]?[a-zA-Z]*$/;

const email_pattern2 = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const password_pattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
// *****************************************************
// ******************* ADD-EVENTs **********************
// *****************************************************
sign_up_button.addEventListener("click", e=>sign_up_click(fname_textbox.value, nick_name_textbox.value, lname_textbox.value, 
  phone_textbox.value, email_textbox.value, password_textbox.value));


email_textbox.addEventListener("change", e=>verify_email(email_label));
password_textbox.addEventListener("input", e=>verify_password(password_label1, password_label2, email_label));

// *****************************************************
// ************* blockSpecialChar(e) ******************
// *****************************************************
function block_special_char(e) {
  var k = e.keyCode;
  return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 45);
}
// *****************************************************
// ***************** blockNumsChar(e) ******************
// *****************************************************
function block_not_nums_char(e) {
  var k = e.keyCode;
  return ((k > 47 && k < 58)|| k == 8);
}
// *****************************************************
// ***************** blockNumsPast(e) ******************
// *****************************************************
function block_special_paste(e){
  debugger;
  let user_paste = (e.clipboardData || window.clipboardData).getData("text");
  let acceptable_enteries = [];
  let my_char;
  for(let i=0; i< user_paste.length; i++){
    my_char = user_paste.codePointAt(i);
    if ((my_char > 64 && my_char < 91) || (my_char > 96 && my_char < 123) || my_char == 45){
      acceptable_enteries.push(my_char);
    }
  }
  if (acceptable_enteries.length > 0){
    acceptable_enteries.forEach(my_element =>{return my_element});
  }
  else{ return false;}
}
// *****************************************************
// ***************** blockExNumsPast(e) ****************
// *****************************************************
function block_ex_nums_paste(e){
  let user_paste = (e.clipboardData || window.clipboardData).getData("text");
  let acceptable_enteries = [];
  let my_char;
  for(let i=0; i< user_paste.length; i++){
    my_char = user_paste.codePointAt(i);
    if ((my_char > 47 && my_char < 58)){
      acceptable_enteries.push(my_char);
    }
  }
  if (acceptable_enteries.length > 0){
    acceptable_enteries.forEach(my_element =>{return my_element});
  }
  else{ return false;}
}
 


// *****************************************************
// **************** Sign up Click() ********************
// *****************************************************
async function sign_up_click(user_fname, user_nick_name, user_lname, user_phone, user_email, user_pass){
  let list_of_fields = [];
  list_of_fields.push(fname_textbox, lname_textbox, email_textbox, password_textbox);
  requiered_field_entered = true;
  
  for(let i=0; i< list_of_fields.length; i++){
    list_of_fields[i].style.border = "none";
    if(list_of_fields[i].value == ""){
      requiered_field_entered = false;
      list_of_fields[i].style.border = "1.5px solid #E64645";
      list_of_fields[i].placeholder = "* Requiered";
      list_of_fields[i].classList.add("error");
    }
  }
  if(requiered_field_entered && email_approved && pass_approved){
    try {
      const {data} = await axios.post('/api/v1/sign_up', {user_fname, user_nick_name, user_lname, user_phone, user_email, user_pass});
      window.alert(`${user_fname} your account has been created successfully.`)
      
      // ******* Adding Notification for Admins **********
      const user_password = user_pass;
      const {data:{user_token}} = await axios.post('/api/v1/login', {user_email, user_password})
      var {data:users} = await axios.get(`/api/v1/users/`,{ headers: { Authorization: `Bearer ${user_token}`}});

      for(let i=0; i < users.length; i++){
        if(users[i].role_name === "Admin"){
          const user_id = users[i].user_id;
          const notification_desc = `New user "${user_fname} ${user_lname}" has created a new account.`;
          var current_date = new Date();
          const notification_date = current_date.toLocaleDateString();

          await axios.post(`/api/v1/notifications/new_notification/`,{user_id, notification_desc, notification_date }, {headers: { Authorization: `Bearer ${user_token}`}});
        }
      }

      window.location.href = "index.html";
    } 
    catch (error) {
      if (error.response.status === 401)
          localStorage.removeItem('user_token');
          window.alert(error.response.data.msg);
    }
    
  }
}
// *****************************************************
// ***************** verify_email() ********************
// *****************************************************
function verify_email(label){
  if(email_textbox.value != ""){
    if (!email_pattern2.test(email_textbox.value)){
      label.innerText = "This is not an email address!";
      label.classList.add("error");
      email_approved = false;
    }
    else{
      label.innerText = "Email";
      label.classList.remove("error");
      email_approved = true;
    }
  }
  else{
    label.innerText = "Email";
    label.classList.remove("error");
    email_approved = false;
  }
}
// *****************************************************
// ***************** verify_password() *****************
// *****************************************************
function verify_password(pass_label1, pass_label2){
  
  setInterval(()=>{if(password_textbox.value !=""){
    if(!password_pattern.test(password_textbox.value)){
      pass_label1.innerText = "⊗ Your password does not meet the requierments.";
      pass_label2.innerText = "Your passwrd needs to be 8-16 charcters long, a combination of uppercase letters, lowercase letters, numbers, and symbols."
      pass_label1.classList.remove("approved_pass");
      pass_label1.classList.add("error_pass1");
      pass_label2.classList.add("error_pass2");
      
      pass_approved =false;
    }
    else{
      pass_label1.innerText = "✓ Your password was approved.";
      pass_label2.innerText = ""
      pass_label1.classList.remove("error_pass1");
      pass_label2.classList.remove("error_pass2");
      pass_label1.classList.add("approved_pass");

      pass_approved =true;
    }
  }
  if(password_textbox.value ==""){
    pass_label1.innerText = "Your password needs to be 8-16 characters long,";
    pass_label2.innerText = "a combination of uppercase letters, lowercase letters, numbers, and symbols."
    pass_label1.classList.remove("error_pass1");
    pass_label2.classList.remove("error_pass2");

    pass_approved =false;
  }
},3000);
}