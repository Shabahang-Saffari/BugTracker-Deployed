window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();
// ******************** Show Password Icon ********************************
document.getElementById("show_pass_icon").onclick = function(){
  const pass_textbox = document.getElementById("user_password");
  const show_password_icon = document.getElementById("show_pass");
  const no_show_password_icon = document.getElementById("no_show_pass");
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
// ************************************************************************
const sign_in_button = document.querySelector(".SignIn_button");
const email_textbox = document.querySelector(".email_textbox");
const email_label = document.querySelector(".email_label");
const password_textbox = document.querySelector(".password_textbox");
const sign_up_button = document.querySelector(".SignUp_button");
const demo_button = document.querySelector(".Demo_button");
const forget_pass_button = document.querySelector(".forgot_pass_btn");
const designer_tag_button = document.querySelector(".designer_tag");
const email_pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

email_textbox.addEventListener("change",()=>verify_email(email_textbox.value));
sign_in_button.addEventListener("click", ()=>sign_in_click(email_textbox.value, password_textbox.value));
sign_up_button.addEventListener("click", ()=>{window.location.href ="Sign up.html"});
demo_button.addEventListener("click", ()=>{window.location.href ="Demo login.html"});
forget_pass_button.addEventListener("click", ()=>{window.location.href ="Forgot Pass.html"});
designer_tag_button.addEventListener("click", ()=>{window.location.href ="https://www.google.com"});

// *****************************************************
// **************** Sign in Click() ********************
// *****************************************************
async function sign_in_click(user_email, user_password){
  sign_in_button.style.border = "none";
  if(!user_email){
    email_textbox.placeholder = "* Enter your email here";
    email_textbox.classList.add("error");
  }
  else{
    email_textbox.classList.remove("error");
  }
  if(!user_password){
    password_textbox.placeholder = "* Enter your password here";
    password_textbox.classList.add("error");
  }
  else{
    password_textbox.classList.remove("error");
  }
  if (user_email && user_password){
    if(email_pattern.test(user_email)){
      try{
        
        const { data: {user_token} } = await axios.post('/api/v1/login', {user_email, user_password})
        const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
        const { user_status_id } = user_info;

        if(user_status_id == 1){
          localStorage.setItem('user_token', user_token);
          window.location.href = "Dashboard.html";
        }
        if(user_status_id != 1){
          window.alert("You do not have permission to sign in! or your account has not been verified yet.");
        }
      }
      catch (error){
        if (error.response.status === 401)
          localStorage.removeItem('user_token');
          window.alert(error.response.data.msg);
      }
    }
    else{
      window.alert("You did not enter a valid email address!\nPlease enter a proper email address.");
    }
    
  }
}
// *****************************************************
// ************* Verfiy Email Pattern ******************
// *****************************************************
function verify_email(email){
  if(email){
    if (!email_pattern.test(email)){
      email_label.innerText = "This is not an email address!";
      email_label.classList.add("error");
    }
    else{
      email_label.classList.remove("error");
    }
  }
}