window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();

// ********************  Demo User  *****************
const project_manager = document.querySelector(".top_left_avatar");
const admin = document.querySelector(".top_right_avatar");
const submitter = document.querySelector(".bottom_left_avatar");
const developer = document.querySelector(".bottom_right_avatar");

admin.addEventListener('click', ()=>{

    const user_email = 'demo_user4@gmail.com';
    const user_password = 'Home@2024';
    demo_users(user_email, user_password);
})

project_manager.addEventListener('click', async()=>{

    const user_email = 'demo_user3@gmail.com';
    const user_password = 'Home@2024';
    demo_users(user_email, user_password);
})

developer.addEventListener('click', ()=>{

    const user_email = 'demo_user2@gmail.com';
    const user_password = 'Home@2024';
    demo_users(user_email, user_password);
})

submitter.addEventListener('click', ()=>{

    const user_email = 'demo_user@gmail.com';
    const user_password = 'Home@2024';
    demo_users(user_email, user_password);
})


// ******************** Logging Demo User *********************
async function demo_users(user_email, user_password){

  try{
    const { data: {user_token} } = await axios.post('/api/v1/login', {user_email, user_password});
    localStorage.setItem('user_token', user_token);
    window.location.href = "Dashboard.html";
  }
  catch (error){
    if (error.response.status === 401)
      localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
  }

}