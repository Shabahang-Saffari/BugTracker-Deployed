window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
  console.log("The size:", win_inner_height, win_inner_width)
}
window_measuring();

// ************************************************************************
const reset_pass_button = document.querySelector(".reset_pass_button");
const email_textbox = document.querySelector(".email_textbox");
const email_label = document.querySelector(".email_label");
const password_textbox = document.querySelector(".password_textbox");
const sign_up_button = document.querySelector(".SignUp_button");
const demo_button = document.querySelector(".Demo_button");
const sign_in_button = document.querySelector(".sign_in_label");
const designer_tag_button = document.querySelector(".designer_tag");
const email_pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

email_textbox.addEventListener("change",()=>verify_email(email_textbox.value));
reset_pass_button.addEventListener("click", e=>reset_button(email_textbox.value, password_textbox.value));
sign_up_button.addEventListener("click", ()=>{setTimeout(()=>{window.location.href ="Sign up.html"}, 20);});
demo_button.addEventListener("click", ()=>{setTimeout(()=>{window.location.href ="Demo login.html"}, 20);});
sign_in_button.addEventListener("click", ()=>{setTimeout(()=>{window.location.href ="index.html"}, 20);});
designer_tag_button.addEventListener("click", ()=>{setTimeout(()=>{window.location.href ="Sign up.html"}, 20);});

// *****************************************************
// **************** Reset Button ***********************
// *****************************************************
async function reset_button(user_email){
  
  if(!user_email){
    email_textbox.placeholder = "* Enter your email here";
    email_textbox.classList.add("error");
  }
  else{
    email_textbox.classList.remove("error");
  }
  
  if (user_email){
    if(email_pattern.test(user_email)){
      try{
        const { data } = await axios.post('/api/v1/login/reset_pass', {user_email})
        window.alert("Your password has been reset. We emailed you your new password.")
        window.location.href = "index.html";
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