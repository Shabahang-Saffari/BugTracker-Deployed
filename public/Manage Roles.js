import {hidden_users} from './data.js';
// ****************************************
window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();

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
  debugger;
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



// **********************************************
// ************ Users Tabel Variables ***********
// **********************************************
let users_table_body = document.querySelector(".users_table_content tbody");
let users_sorting_order = "ascending";
let saved_user_id_selected;

// *********************************************
// *********** Dispaly Users Tabel *************
// *********************************************

async function dispaly_users_table(search_box_input){

  if(!search_box_input)
  {
    try{
      const user_token = localStorage.getItem("user_token");
      var {data:users} = await axios.get(`/api/v1/users/`,{ headers: { Authorization: `Bearer ${user_token}`}});
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
  }

  if(search_box_input)
  {
    try{
      var user_token = localStorage.getItem('user_token');
      var { data: users } = await axios.get(`/api/v1/users/search_users?search_word=${search_box_input}`, { headers: { Authorization: `Bearer ${user_token}` } });
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
      
    }
  }
  users_table_body.innerHTML = "";
  const delete_icon = document.createElement("img");
  delete_icon.src = "pictures and icons/Delete-bin.svg";
  delete_icon.alt = "Delete Icon";
  delete_icon.classList.add("my_delete");
  delete_icon.setAttribute("id", "table_delete_proj");

  let index_2nd = 0;

  for (let i = 0; i < users.length; i++) {

    if(hidden_users.includes(users[i].user_id))continue;

    users_table_body.innerHTML += `<tr><td>${users[i].user_id}</td><td>${users[i].name}</td><td>${users[i].role_name}</td></tr>`;
    let delete_cell = users_table_body.rows[index_2nd].insertCell(-1);
    delete_cell.appendChild(delete_icon);

    index_2nd++;
  }
}
dispaly_users_table();

// ****************************************************
// ******************* Search Users *******************
// ****************************************************
let users_search_bar = document.querySelector(".search_bar");

users_search_bar.addEventListener("input", e=>search_users_tabel(users_search_bar.value));
async function search_users_tabel(search_box_input, item_per_page) {
  page_index = 1;
  if (search_box_input == "") {
    return dispaly_users_table(item_per_page);
  } 
  search_box_input = "%" + search_box_input.toLowerCase() + "%";
  dispaly_users_table(search_box_input);
}
// ****************************************************
// *********** Dispalying Search Results **************
// ****************************************************
function dispaly_search_result(indexes_result){
  users_table_body.innerText="";
  for(index of indexes_result){
    users_table_body.appendChild(users_empty_box[index]);
  }
}


// **********************************************
// ***** User's Information Tabel Variables *****
// **********************************************
const firstname_input = document.getElementById("fname_textbox");
const nickname_input = document.getElementById("nickname_textbox");
const lastname_input = document.getElementById("lname_textbox");
const phone_input = document.getElementById("phone_textbox");
const role_drop_box = document.getElementById("role_selector");
const status_drop_box = document.getElementById("status_selector");
const email_input = document.getElementById("user_email");

const edit_info_btn = document.getElementById("edit_info_btn");
const save_info_btn = document.getElementById("edit_info_save_btn");
const cancel_info_btn = document.getElementById("edit_info_cancel_btn");

// *********** Setting Defaults ***********
firstname_input.disabled = true;
nickname_input.disabled = true;
lastname_input.disabled = true;
phone_input.disabled = true;
role_drop_box.disabled = true;
status_drop_box.disabled = true;
email_input.disabled = true;

firstname_input.value = "";
nickname_input.value = "";
lastname_input.value = "";
email_input.value = "";
phone_input.value = "";
role_drop_box.value = 1;
status_drop_box.value = 1;

// **********************************************
// ***** Add Event for Click on Users table *****
// **********************************************
users_table_body.addEventListener("click", async (e)=>{
  
  if (!e.target.classList.contains("my_delete")){
    const selected_row_index = e.target.parentElement.rowIndex;
    const users_table_tr = users_table_body.getElementsByTagName("tr");
    const selected_user_id = users_table_tr[selected_row_index - 1].firstChild.innerText;
    saved_user_id_selected = selected_user_id;

    try{
      const user_token = localStorage.getItem("user_token");
      var { data:selected_user_info } = await axios.get(`/api/v1/users/${selected_user_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
    firstname_input.value = selected_user_info[0].user_fname;
    nickname_input.value = selected_user_info[0].user_nick_name;
    lastname_input.value = selected_user_info[0].user_lname;
    phone_input.value = selected_user_info[0].user_phone;
    role_drop_box.value = selected_user_info[0].user_role_id;
    status_drop_box.value = selected_user_info[0].user_status_id;
    email_input.value = selected_user_info[0].user_email;

    edit_info_btn.style.display = "inline-block";
  }
  // ************ Delete User Button ************
  if (e.target.classList.contains("my_delete")){
    
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const users_table_tr = users_table_body.getElementsByTagName("tr");
    const selected_user_id = users_table_tr[selected_row_index - 1].firstChild.innerText;

    let delete_confirm_result = window.confirm(`Are you sure you want to delete this user?!`);
    if(delete_confirm_result){
      try{
      const user_token = localStorage.getItem("user_token");
      await axios.delete(`/api/v1/users/${selected_user_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
    firstname_input.value = "";
    nickname_input.value = "";
    lastname_input.value = "";
    email_input.value = "";
    phone_input.value = "";
    role_drop_box.value = 1;
    status_drop_box.value = 1;

    dispaly_users_table();
    }
  }
})

// **********************************************
// ******** Add Event for Edit Button ***********
// **********************************************
edit_info_btn.addEventListener("click", ()=>{
  firstname_input.disabled = false;
  nickname_input.disabled = false;
  lastname_input.disabled = false;
  phone_input.disabled = false;
  role_drop_box.disabled = false;
  status_drop_box.disabled = false;

  firstname_input.classList.remove("inactive");
  nickname_input.classList.remove("inactive");
  lastname_input.classList.remove("inactive");
  phone_input.classList.remove("inactive");
  role_drop_box.classList.remove("inactive");
  status_drop_box.classList.remove("inactive");

  edit_info_btn.style.display = "none";
  cancel_info_btn.style.display = "inline-block";
  save_info_btn.style.display = "inline-block";
})

// **********************************************
// ******** Add Event for Cancel Button *********
// **********************************************
cancel_info_btn.addEventListener("click", async ()=>{

  try{
      const user_token = localStorage.getItem("user_token");
      var { data:selected_user_info } = await axios.get(`/api/v1/users/${saved_user_id_selected}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    }
  catch(error){
    if (error.response.status === 401){
      localStorage.removeItem("user_token");
    } 
    window.alert(error.response.data.msg);
  }
  
  firstname_input.value = selected_user_info[0].user_fname;
  nickname_input.value = selected_user_info[0].user_nick_name;
  lastname_input.value = selected_user_info[0].user_lname;
  phone_input.value = selected_user_info[0].user_phone;
  role_drop_box.value = selected_user_info[0].user_role_id;
  status_drop_box.value = selected_user_info[0].user_status_id;

  edit_info_btn.style.display = "inline-block";

  firstname_input.disabled = true;
  nickname_input.disabled = true;
  lastname_input.disabled = true;
  phone_input.disabled = true;
  role_drop_box.disabled = true;
  status_drop_box.disabled = true;

  firstname_input.classList.add("inactive");
  nickname_input.classList.add("inactive");
  lastname_input.classList.add("inactive");
  phone_input.classList.add("inactive");
  role_drop_box.classList.add("inactive");
  status_drop_box.classList.add("inactive");

  edit_info_btn.style.display = "inline-block";
  cancel_info_btn.style.display = "none";
  save_info_btn.style.display = "none";

  firstname_input.style.border = "none";
  lastname_input.style.border = "none";
})

// **********************************************
// ******** Add Event for Save Button *********
// **********************************************
save_info_btn.addEventListener("click", async ()=>{

  if (firstname_input.value == "") {
    firstname_input.style.border = "1.5px solid #E64645";
    firstname_input.placeholder = "* Requiered";
  } else {
    firstname_input.style.border = "none";
    firstname_input.placeholder = "";
  }

   if (lastname_input.value == "") {
    lastname_input.style.border = "1.5px solid #E64645";
    lastname_input.placeholder = "* Requiered";
  } else {
    lastname_input.style.border = "none";
    lastname_input.placeholder = "";
  }

  if(firstname_input.value != "" && lastname_input.value != ""){
    const user_fname = firstname_input.value;
    const user_nick_name = nickname_input.value;
    const user_lname = lastname_input.value;
    const user_phone = phone_input.value;
    const user_role_id = role_drop_box.value;
    const user_status_id = status_drop_box.value;

    try{
        const user_token = localStorage.getItem("user_token");
        await axios.patch(`/api/v1/users/${saved_user_id_selected}`, {user_fname, user_nick_name, user_lname, user_phone, user_role_id, user_status_id},{ headers: { Authorization: `Bearer ${user_token}`}});
      }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }

    firstname_input.disabled = true;
    nickname_input.disabled = true;
    lastname_input.disabled = true;
    phone_input.disabled = true;
    role_drop_box.disabled = true;
    status_drop_box.disabled = true;

    firstname_input.classList.add("inactive");
    nickname_input.classList.add("inactive");
    lastname_input.classList.add("inactive");
    phone_input.classList.add("inactive");
    role_drop_box.classList.add("inactive");
    status_drop_box.classList.add("inactive");

    cancel_info_btn.style.display = "none";
    save_info_btn.style.display = "none";
    edit_info_btn.style.display = "inline-block";

    dispaly_users_table();
  }
  
})