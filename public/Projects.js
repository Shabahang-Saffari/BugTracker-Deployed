import {hidden_users} from './data.js';

window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();
// *******************************************************
// ************* Project Tabel Variables *****************
// *******************************************************
let table_body = document.querySelector("tbody");
let pagination_bar = document.querySelector(".pagination_bar");
let quantity_selector = document.querySelector(".quantity_selector");
let table_tr_for_coloring;
let page_index = 1;
let item_per_page = 10;
let qty_all_projects;
let num_of_generated_pages;
let pagination_a_tags;
let page_numbers_buttons;
let search_box = document.querySelector(".search_bar");


// ***************************************
// ******* quantity/page selector ********
// ***************************************
quantity_selector.onchange = function () {
  debugger;
  item_per_page = this.value;
  item_per_page = parseInt(item_per_page);
  page_index = 1;

  if (!search_box.value) {
    return dispaly_table(item_per_page);
  }
  dispaly_table(item_per_page, ("%" + search_box.value + "%"));
  
};

// ***************************************
// *********** Dispaly Tabel *************
// ***************************************
async function dispaly_table(number_of_rows, search_box_input) {
  
  if (!search_box_input) {
    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role, user_id } = user_info;

      if(user_role == "Admin"){
        var { data } = await axios.get(`/api/v1/projects/projs_page?page_number=${page_index}&num_per_page=${number_of_rows}`,{ headers: { Authorization: `Bearer ${user_token}` } });

        var { data: data_length } = await axios.get(`/api/v1/projects/number_of_projects`,{headers:{ Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length[0].projects_qty;
      }
      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/projects/projs_page_selective_prjs?page_number=${page_index}&num_per_page=${number_of_rows}`,{user_id},{headers: { Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/projects/projs_page_selective_prjs_qty`,{user_id}, {headers: { Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }
    }
    
    catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
    }
  }
  // ******** Displaying Search Results *******
  if (search_box_input) {
    try{
      var user_token = localStorage.getItem('user_token');
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role, user_id } = user_info;

      if(user_role == "Admin"){
        
        var {data}= await axios.get(`/api/v1/projects/search_proj_page?page_number=${page_index}&num_per_page=${number_of_rows}&search_word=${search_box_input}`, {headers:{Authorization: `Bearer ${user_token}`}});
        
        var {data:data_length}= await axios.get(`/api/v1/projects/search_proj_page_qty?search_word=${search_box_input}`, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }

      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/projects/search_proj_page/?page_number=${page_index}&num_per_page=${number_of_rows}&search_word=${search_box_input}`,{user_id}, {headers:{Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/projects/search_proj_page_qty/?search_word=${search_box_input}`,{user_id}, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }
    } 
    catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
    }
  }

  // ******************************************
  table_body.innerText = "";
  const edit_icon = document.createElement("img");
  edit_icon.src = "pictures and icons/Edit-pen.svg";
  edit_icon.alt = "Edit Icon";
  edit_icon.classList.add("my_edit");

  const delete_icon = document.createElement("img");
  delete_icon.src = "pictures and icons/Delete-bin.svg";
  delete_icon.alt = "Delete Icon";
  delete_icon.classList.add("my_delete");
  delete_icon.setAttribute("id", "table_delete_proj");

  for (let i = 0; i < data.length; i++) {
    table_body.innerHTML += `<tr><td>${data[i].project_ID}</td><td>${data[i].project_name}</td><td>${data[i].project_desc}</td><td>${data[i].contributors}</td><td>${data[i].project_status_desc}</td><td>Details</td></tr>`;
    let first_cell = table_body.rows[i].insertCell(-1);
    first_cell.appendChild(edit_icon);
    let second_cell = table_body.rows[i].insertCell(-1);
    second_cell.appendChild(delete_icon);
  }

  table_tr_for_coloring = table_body.querySelectorAll("tr");
  for (let i = 0; i < table_tr_for_coloring.length; i++) {
    if (i % 2 == 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#48225a00";
    }
    if (i % 2 != 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#ffffff14";
    }
  }

  if (qty_all_projects <= number_of_rows) {
    pagination_bar.style.display = "none";
  } else {
    pagination_bar.style.display = "flex";
    num_of_generated_pages = Math.ceil(qty_all_projects / number_of_rows);
    const page_nums_to_delete =
      pagination_bar.querySelectorAll(".page_numbers");
    page_nums_to_delete.forEach((item) => item.remove());
    for (let i = 1; i <= num_of_generated_pages; i++) {
      const new_li = document.createElement("li");
      new_li.className = "page_numbers";
      const new_a = document.createElement("a");
      new_a.href = "#";
      if (i < 10) {
        new_a.innerText = "0" + i;
      } else {
        new_a.innerText = i;
      }
      new_a.setAttribute("data-page", i);
      new_li.appendChild(new_a);
      pagination_bar.insertBefore(
        new_li,
        pagination_bar.querySelector(".next_page")
      );
    }
    page_numbers_buttons = document.querySelectorAll(".page_numbers");
    page_numbers_buttons.forEach((item) => item.classList.remove("active"));
    page_numbers_buttons[page_index - 1].classList.add("active");

    pagination_a_tags = pagination_bar.querySelectorAll("a");
    page_runner(pagination_a_tags, search_box.value);
  }
}
dispaly_table(item_per_page);
// ***************************************
// ************* Page Runner *************
// ***************************************
function page_runner(pagination_a_tags, search_box_input) {
  pagination_a_tags.forEach((each_button)=>{
    each_button.onclick = (e) => {
      const page_number_selected = e.target.getAttribute("data-page");
      const page_mover = e.target.getAttribute("id");
      if (page_number_selected != null) {
        page_index = parseInt(page_number_selected);
      } else {
        if (page_mover == "next_page") {
          page_index = page_index + 1;
          if (page_index > num_of_generated_pages) {
            page_index = num_of_generated_pages;
          }
        } else if (page_mover == "previous_page") {
          page_index = page_index - 1;
          if (page_index < 1) {
            page_index = 1;
          }
        }
      }
      if (!search_box_input) {
        dispaly_table(item_per_page);
      } else {
        search_box_input = "%" + search_box_input + "%";
        dispaly_table(item_per_page, search_box_input);
      }
    };
  })
}

// ***************************************
// *************** Search ****************
// ***************************************
search_box.addEventListener("input", (e) => search_tabel(search_box.value, item_per_page));

async function search_tabel(search_box_input, item_per_page) {
  page_index = 1;
  if (search_box_input == "") {
    return dispaly_table(item_per_page);
  } 
  search_box_input = "%" + search_box_input.toLowerCase() + "%";
  dispaly_table(item_per_page, search_box_input);
}

// *******************************************************
// *************** Table's Edit button  ******************
// *******************************************************
let table_edit_btn = document.querySelectorAll(".my_edit");
let edit_table_window = document.querySelector(".edit_table_window");
let back_blur_window = document.querySelector(".back_blur_window");

let edit_window_cancel_btn = document.querySelector("#edit_project_cancel_btn");
let edit_window_save_btn = document.querySelector("#edit_project_save_btn");
let project_name_input = document.querySelector("#edit_project_name_input");
let project_id_label = document.querySelector(".project_id_label");
let project_status_selector = document.querySelector("#project_status_selector");
let project_desc_textarea = document.querySelector("#edit_project_desc_textarea");

// ************* AddEvent for Edit button *************
table_body.addEventListener("click", async(e) => {
  if (e.target.classList.contains("my_edit")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_project_id = table_tr[selected_row_index-1].firstChild.innerText;

    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role } = user_info;
      if(user_role != "Admin" && user_role != "Project Manager"){
         return window.alert("You are not authorized to access this section!");
      }
      var { data:project_info } = await axios.get(`/api/v1/projects/${selected_project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
      var { data:users } = await axios.get(`/api/v1/users`,{ headers: { Authorization: `Bearer ${user_token}`}});
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
    if (edit_table_window.style.display != "block") {

      // **** removing old users list ****
      // *** For faster performance: search>> first child, Delete>> last child ****
      var edit_proj_members_selector = document.getElementById("edit_project_members_selector");
      while (edit_proj_members_selector.firstChild) {
      edit_proj_members_selector.removeChild(edit_proj_members_selector.lastChild);
    }
      project_name_input.value = project_info[0].project_name;
      project_id_label.innerText = project_info[0].project_ID;
      project_desc_textarea.value = project_info[0].project_desc;
      // project_status_selector.innerText = empty_box[i].querySelector('tbody>tr>:nth-child(4)').innerText;
      const project_status = project_info[0].project_status_desc;
      // **** finding the project contributors
      let contributors = project_info[0].contributors;
      let contributors_array = contributors.split("|");
      

      for (let j = 0; j < users.length; j++) {
          if(hidden_users.includes(users[j].user_id))continue;
          
          
          const single_li = document.createElement('li');
          const user_check_box = document.createElement('input');
          const user_id_label = document.createElement('label');
          user_id_label.innerText = users[j].user_id;
          user_id_label.classList.add('user_id');
          user_check_box.type = "checkbox";
          single_li.appendChild(user_check_box);
          edit_proj_members_selector.appendChild(single_li);
          single_li.appendChild(document.createTextNode(users[j].name));
          single_li.appendChild(user_id_label);

          for (let i = 0; i < contributors_array.length; i++) {
            contributors_array[i] = contributors_array[i].trim();
            // check-marking the contributors iside the edit window
            if (users[j].name == contributors_array[i]){
              user_check_box.checked = true;
              
            }
          }
        }
      // finding the value for the project_status_selector
      switch (true) {
        case project_status == "In Progress":
          project_status_selector.value = 1;
          break;
        case project_status == "Completed":
          project_status_selector.value = 2;
          break;
        case project_status == "Closed":
          project_status_selector.value = 3;
          break;
      }

      // **************** Making the Edit Window Visible ***************
      edit_table_window.style.display = "block";
      back_blur_window.style.display = "block";
    }
  }

});
// *******************************************************
// *************** Edit Window Buttons  ******************
// *******************************************************

// ********** Edit Window Save/Cancel Buttons  ***********
edit_window_cancel_btn.addEventListener("click", () => {
  // *** reseting scroll bar position ***
  document.querySelector("#edit_project_members_selector").scrollTop = 0;
  edit_table_window.style.display = "none";
  back_blur_window.style.display = "none";

  // ************ Clearing the error red lines ************
  project_name_input.style.border = "none";
  project_name_input.placeholder = "";
  project_desc_textarea.style.border = "none";
  project_desc_textarea.placeholder = "";
  document.querySelector(".members_wrapper").style.border = "none"
});

// ************** Edit Save button **************

edit_window_save_btn.addEventListener("click", async () => {
  let edit_project_members = document.querySelectorAll("#edit_project_members_selector li");
  let edit_project_members_checkbox = document.querySelectorAll("#edit_project_members_selector input");

  if (project_name_input.value == "") {
    project_name_input.style.border = "1.5px solid #E64645";
    project_name_input.placeholder = "Your project name";
  } else {
    project_name_input.style.border = "none";
    project_name_input.placeholder = "";
  }
  if (project_desc_textarea.value == "") {
    project_desc_textarea.style.border = "1.5px solid #E64645";
    project_desc_textarea.placeholder =
      "Write a brief description of your project here.";
  } else {
    project_desc_textarea.style.border = "none";
    project_desc_textarea.placeholder = "";
  }
  for(let i=0; i<edit_project_members.length; i++){
        if(edit_project_members_checkbox[i].checked == true){
          var users_selected = true;
          break;
        }
  }
  if(!users_selected){
    document.querySelector(".members_wrapper").style.border = "1.5px solid #E64645";
    window.alert("You need to choose at least one team member for the project.")
  }
  if(users_selected){
    document.querySelector(".members_wrapper").style.border = "none";
  }
  if (!project_name_input.value == "" && !project_desc_textarea.value == "" && users_selected) {
    // *** reseting scroll bar position ***
    document.querySelector("#edit_project_members_selector").scrollTop = 0;
    const all_users_id = document.querySelectorAll('.user_id');
    const project_id = parseInt(project_id_label.innerText);
    const project_name = project_name_input.value;
    const project_desc = project_desc_textarea.value;
    const project_status_id = parseInt(project_status_selector.value);
    try {
      const user_token = localStorage.getItem("user_token");
      await axios.patch(`/api/v1/projects/${project_id}`,{project_name, project_desc, project_status_id}, {headers: { Authorization: `Bearer ${user_token}`}});
      await axios.delete(`/api/v1/projects/delete_proj_users/${project_id}`, {headers: { Authorization: `Bearer ${user_token}`}});
      for(let i=0; i<edit_project_members.length; i++){
        if(edit_project_members_checkbox[i].checked == true){
          const user_id = parseInt(all_users_id[i].innerText);
          await axios.post(`/api/v1/projects/create_proj_users/${project_id}`,{user_id}, {headers: { Authorization: `Bearer ${user_token}`}});
        }
      }
      
    } 
    catch (error) {
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }


    edit_table_window.style.display = "none";
    back_blur_window.style.display = "none";

    // ************ Clearing the error red lines ************
    project_desc_textarea.style.border = "none";
    project_name_input.style.border = "none";
    document.querySelector(".members_wrapper").style.border = "none"

    dispaly_table(item_per_page);
  }
});

// *******************************************************
// *************** +New Project Button   ****************
// *******************************************************
let create_new_project_btn = document.querySelector(".new_project_btn");
let create_project_window = document.querySelector(".create_project_window");
let create_project_name = document.querySelector("#create_project_name_input");
let create_project_desc = document.querySelector("#create_project_desc_textarea");
let create_project_cancel_btn = document.querySelector("#create_project_cancel_btn");
let create_project_create_btn = document.querySelector("#create_project_create_btn");
let create_project_status = document.querySelector("#create_project_status_selector");
let create_project_members = document.querySelectorAll("#create_project_members_selector li");
let create_project_members_checkbox = document.querySelectorAll("#create_project_members_selector input");

create_new_project_btn.addEventListener("click", async() => {

  const user_token = localStorage.getItem("user_token");
  try{
    const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
    const { user_role } = user_info;
    if(user_role != "Admin" && user_role != "Project Manager"){
        return window.alert("You are not authorized to access this section!");
    }
    var { data:users } = await axios.get(`/api/v1/users`,{ headers: { Authorization: `Bearer ${user_token}`}});
  }
  catch (error) {
    if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
    window.alert(error.response.data.msg);
  }
  if (create_project_window.style.display != "block") {

    // **** removing old users list ****
    // *** For faster performance: search>> first child, Delete>> last child ****
    var create_project_members_selector = document.getElementById("create_project_members_selector");
    while (create_project_members_selector.firstChild) {
    create_project_members_selector.removeChild(create_project_members_selector.lastChild);
    }
    create_project_name.value = "";
    create_project_name.placeholder = "";
    create_project_desc.value = "";
    create_project_desc.placeholder = "";

    for (let j = 0; j < users.length; j++) {
      if(hidden_users.includes(users[j].user_id))continue;

      const single_li = document.createElement('li');
      const user_check_box = document.createElement('input');
      const user_id_label = document.createElement('label');
      user_id_label.innerText = users[j].user_id;
      user_id_label.classList.add('new_proj_user_id');
      user_check_box.type = "checkbox";
      single_li.appendChild(user_check_box);
      create_project_members_selector.appendChild(single_li);
      single_li.appendChild(document.createTextNode(users[j].name));
      single_li.appendChild(user_id_label);
    }

    // **************** Making the Edit Window Visible ***************
    create_project_window.style.display = "block";
    back_blur_window.style.display = "block";
  }
});


// ************** Create button **************
create_project_create_btn.addEventListener("click", async () => {
  let create_project_members = document.querySelectorAll("#create_project_members_selector li");
  let create_project_members_checkbox = document.querySelectorAll("#create_project_members_selector input");

  if (create_project_name.value == "") {
    create_project_name.style.border = "1.5px solid #E64645";
    create_project_name.placeholder = "Your project name";
  } else {
    create_project_name.style.border = "none";
    create_project_name.placeholder = "";
  }
  if (create_project_desc.value == "") {
    create_project_desc.style.border = "1.5px solid #E64645";
    create_project_desc.placeholder ="Write a brief description of your project here.";
  } else {
    create_project_desc.style.border = "none";
    create_project_desc.placeholder = "";
  }
  for(let i=0; i<create_project_members.length; i++){
        if(create_project_members_checkbox[i].checked == true){
          var users_selected = true;
          break;
        }
  }
  if(!users_selected){
    document.querySelector("#create_proj_members_wrapper").style.border = "1.5px solid #E64645";
    window.alert("You need to choose at least one team member for the project.")
  }
  if(users_selected){
    document.querySelector("#create_proj_members_wrapper").style.border = "none";
  }

  if (!create_project_name.value == "" && !create_project_desc.value == "" && users_selected) {

    const create_proj_all_users_id = document.querySelectorAll('.new_proj_user_id');
    var new_project_name = create_project_name.value;
    var new_project_desc = create_project_desc.value;
    var new_project_status_id = parseInt(create_project_status.value);
    var current_date = new Date();

    new_project_creating_date = current_date.toLocaleDateString();
    new_project_creating_time = current_date.toLocaleTimeString();

    try {
      const user_token = localStorage.getItem("user_token");

      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_id: new_project_creator_id } = user_info;

      const {data: new_project_info} = await axios.post(`/api/v1/projects/`,{new_project_name, new_project_desc, new_project_status_id, new_project_creator_id, new_project_creating_date, new_project_creating_time}, {headers: { Authorization: `Bearer ${user_token}`}});
      const {new_project_id} = new_project_info[0];

      for(let i=0; i<create_project_members.length; i++){
        if(create_project_members_checkbox[i].checked == true){
          const user_id = parseInt(create_proj_all_users_id[i].innerText);
          await axios.post(`/api/v1/projects/create_proj_users/${new_project_id}`,{user_id}, {headers: { Authorization: `Bearer ${user_token}`}});
          const notification_desc = `You have been added to the new project "${new_project_name}"`;
          const notification_date = new_project_creating_date;
          await axios.post(`/api/v1/notifications/new_notification/`,{user_id, notification_desc, notification_date }, {headers: { Authorization: `Bearer ${user_token}`}});
        }
      }
      // ****** HERE I have to add the code to refresh the Notification of the top page *******
    } 
    catch (error) {
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
      console.log(error);
    }

    // *** reseting scroll bar position ***
    document.getElementById("create_project_members_selector").scrollTop = 0;
    create_project_window.style.display = "none";
    back_blur_window.style.display = "none";

    // ************ Clearing the error red lines ************
    create_project_desc.style.border = "none";
    create_project_desc.placeholder = "";
    create_project_name.style.border = "none";
    create_project_name.placeholder = "";
    document.querySelector(".members_wrapper").style.border = "none";
    

    dispaly_table(item_per_page);
  }
});

// ********** Create Project Window Cancel Button  ***********
create_project_cancel_btn.addEventListener("click", () => {
  document.getElementById("create_project_members_selector").scrollTop = 0;
  create_project_window.style.display = "none";
  back_blur_window.style.display = "none";
  create_project_desc.style.border = "none";
  create_project_name.style.border = "none";
  create_project_status.value = 1;
  document.querySelector("#create_proj_members_wrapper").style.border = "none"
  for (let j = 0; j < create_project_members.length; j++) {
    create_project_members_checkbox[j].checked = false;
  }
});

// ************************************************************
// ************* AddEvent for Table Delete button *************
// ************************************************************
table_body.addEventListener("click", async(e) => {
  if (e.target.classList.contains("my_delete")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_project_id = table_tr[selected_row_index-1].firstChild.innerText;
    const selected_project_name = table_tr[selected_row_index-1].children[1].innerText;

    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role } = user_info;
      if(user_role != "Admin" && user_role != "Project Manager"){
         return window.alert("You are not authorized to access this section!");
      }
      
      let delete_confirm_result = window.confirm(`Are you sure you want to delete "${selected_project_name}" project?!\n*Attention all your data related to this project will be remevoed!`);
      if (delete_confirm_result == true) {
        let delete_prompt_entery = window.prompt(`Type delete in order to delete "${selected_project_name}" project:`);
        if (delete_prompt_entery.toLowerCase() === "delete") {
          
          var {data} = await axios.delete(`/api/v1/projects/${selected_project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
          
          window.alert(`The project "${selected_project_name}" was deleted sucessfully.`);
          page_index = 1;
          dispaly_table(item_per_page);
        }
      }
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
  }
});

// ************************************************************
// ***** AddEvent for Table Details/Project Name button *******
// ************************************************************

table_body.addEventListener("click", (e)=>{
  if (e.target.cellIndex === 5 || e.target.cellIndex === 1){
    
    const selected_row_index = e.target.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_project_id = table_tr[selected_row_index-1].firstChild.innerText;

    window.location.href = "Project detail.html?project_id=" + encodeURIComponent(selected_project_id);
  }
})

