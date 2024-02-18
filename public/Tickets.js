window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();
// *******************************************************
// ************* Ticket Tabel Variables *****************
// *******************************************************
let table_body = document.querySelector("tbody");
let pagination_bar = document.querySelector(".pagination_bar");
let quantity_selector = document.querySelector(".quantity_selector");
let table_tr_for_coloring;
let page_index = 1;
let item_per_page = 10;
let qty_all_tickets;
let num_of_generated_pages;
let pagination_a_tags;
let page_numbers_buttons;
let sorting_order = "ascending";
let search_box = document.querySelector(".search_bar");
let indexes_of_search_result = [];



// ***************************************
// ******* quantity/page selector ********
// ***************************************
quantity_selector.onchange = function () {
  item_per_page = this.value;
  item_per_page = parseInt(item_per_page);
  page_index = 1;
  // ***** Reseting variables *****
  sorted_list_indexes = [];
  sorting_order = "ascending";

  if (!search_box.value) {
    return dispaly_table(item_per_page);
  }
  dispaly_table(item_per_page, "%" + search_box.value + "%");
  
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
        var { data } = await axios.post(`/api/v1/tickets/tickets_page`,{page_index, number_of_rows},{ headers: { Authorization: `Bearer ${user_token}` } });

        var { data: data_length } = await axios.get(`/api/v1/tickets/tickets_page`,{headers:{ Authorization: `Bearer ${user_token}`}});
        qty_all_tickets = data_length[0].all_tickets_qty;
      }
      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/tickets/tickets_page_selective_tiks`,{page_index, number_of_rows, user_id},{headers: { Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/tickets/tickets_page_selective_tiks_qty`,{user_id}, {headers: { Authorization: `Bearer ${user_token}`}});
        qty_all_tickets = data_length.length;
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
        
        var {data}= await axios.post(`/api/v1/tickets/search_tickets_page?search_word=${search_box_input}`,{page_index, number_of_rows}, {headers:{Authorization: `Bearer ${user_token}`}});
        
        var {data:data_length}= await axios.get(`/api/v1/tickets/search_tickets_page?search_word=${search_box_input}`, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_tickets = data_length.length;
      }

      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/tickets/search_tickets_page_selective_user?search_word=${search_box_input}`,{page_index, number_of_rows, user_id}, {headers:{Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/tickets/search_tickets_page_selective_user_qty?search_word=${search_box_input}`,{user_id}, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_tickets = data_length.length;
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
  delete_icon.setAttribute("id", "table_delete_ticket");

  for (let i = 0; i < data.length; i++) {
    const formatted_ticket_date = new Date(data[i].ticket_creation_date).toLocaleDateString(undefined, {timeZone: "UTC"});
    const formatted_ticket_time = new Date(data[i].ticket_creation_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});

    table_body.innerHTML += `<tr><td>${data[i].ticket_id}</td><td>${data[i].ticket_name}</td><td>${data[i].project_name}</td><td>${data[i].assigned_users}</td><td>${data[i].ticket_type_desc}</td><td>${data[i].ticket_priority_desc}</td><td>${data[i].ticket_status_desc}</td><td>${formatted_ticket_date}</br>${formatted_ticket_time}</td><td>Details</td></tr>`;
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

  if (qty_all_tickets <= number_of_rows) {
    pagination_bar.style.display = "none";
  } else {
    pagination_bar.style.display = "flex";
    num_of_generated_pages = Math.ceil(qty_all_tickets / number_of_rows);
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
  for (each_button of pagination_a_tags) {
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
  }
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

let ticket_id_label = document.querySelector(".ticket_id_label");
let project_id_label = document.querySelector(".project_id_label");
let edit_ticket_title_input = document.querySelector("#edit_ticket_title_input");
let edit_ticket_desc_textarea = document.querySelector("#edit_ticket_desc_textarea");
let edit_ticket_cancel_btn = document.querySelector("#edit_ticket_cancel_btn");
let edit_ticket_save_btn = document.querySelector("#edit_ticket_save_btn");
let edit_ticket_status = document.querySelector("#edit_ticket_status_selector");
let edit_ticket_type = document.querySelector("#edit_ticket_type_selector");
let edit_ticket_priority = document.querySelector("#edit_ticket_priority_selector");
let edit_ticket_devs = document.querySelectorAll("#edit_ticket_dev_selector li");
let edit_ticket_devs_checkbox = document.querySelectorAll("#edit_ticket_dev_selector input");


// ************* AddEvent Listener *************
table_body.addEventListener("click", async(e) => {
  debugger;
  if (e.target.classList.contains("my_edit")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_ticket_id = table_tr[selected_row_index - 1].firstChild.innerText;

    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role } = user_info;
      if(user_role == "Submitter"){
         return window.alert("You are not authorized to access this section!");
      }
      var { data:ticket_info } = await axios.get(`/api/v1/tickets/${selected_ticket_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
      const project_id = parseInt(ticket_info[0].ticket_project_id);
      
      var { data:users } = await axios.get(`/api/v1/users/project_assigned_users/${project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
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
      var edit_ticket_dev_selector = document.getElementById("edit_ticket_dev_selector");
      while (edit_ticket_dev_selector.firstChild) {
      edit_ticket_dev_selector.removeChild(edit_ticket_dev_selector.lastChild);
    }
      edit_ticket_title_input.value = ticket_info[0].ticket_name;
      ticket_id_label.innerText = ticket_info[0].ticket_id;
      project_id_label.innerText = ticket_info[0].ticket_project_id;
      const ticket_status = ticket_info[0].ticket_status_desc;
      const ticket_type = ticket_info[0].ticket_type_desc;
      const ticket_priority = ticket_info[0].ticket_priority_desc
      edit_ticket_desc_textarea.value = ticket_info[0].ticket_description;
      // **** finding the project contributors
      let assigned_devs = ticket_info[0].assigned_users;
      let assigned_devs_array = assigned_devs.split("|");
      for (let j = 0; j < users.length; j++) {

          const single_li = document.createElement('li');
          const user_check_box = document.createElement('input');
          const user_id_label = document.createElement('label');
          user_id_label.innerText = users[j].user_id;
          user_id_label.classList.add('user_id');
          user_check_box.type = "checkbox";
          single_li.appendChild(user_check_box);
          edit_ticket_dev_selector.appendChild(single_li);
          single_li.appendChild(document.createTextNode(users[j].name));
          single_li.appendChild(user_id_label);

          for (let i = 0; i < assigned_devs_array.length; i++) {
            assigned_devs_array[i] = assigned_devs_array[i].trim();
            // check-marking the contributors iside the edit window
            if (users[j].name == assigned_devs_array[i]){
              user_check_box.checked = true;
            }
          }
        }
      // finding the value for the project_status_selector
      switch (true) {
        case ticket_status == "New":
          edit_ticket_status.value = 1;
          break;
        case ticket_status == "In Progress":
          edit_ticket_status.value = 2;
          break;
        case ticket_status == "Resolved":
          edit_ticket_status.value = 3;
          break;
      }

      switch (true) {
        case ticket_type == "Bug":
          edit_ticket_type.value = 1;
          break;
        case ticket_type == "Feature Request":
          edit_ticket_type.value = 2;
          break;
        case ticket_type == "Revise":
          edit_ticket_type.value = 3;
          break;
      }

      switch (true) {
        case ticket_priority == "Immediate":
          edit_ticket_priority.value = 1;
          break;
        case ticket_priority == "High":
          edit_ticket_priority.value = 2;
          break;
        case ticket_priority == "Medium":
          edit_ticket_priority.value = 3;
          break;
        case ticket_priority == "Low":
          edit_ticket_priority.value = 4;
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



// ************** Save Changes button **************

edit_ticket_save_btn.addEventListener("click", async()=>{
  
  let edit_ticket_members = document.querySelectorAll("#edit_ticket_dev_selector li");
  let edit_ticket_members_checkbox = document.querySelectorAll("#edit_ticket_dev_selector input");

  if(edit_ticket_title_input.value == ""){
    edit_ticket_title_input.style.border = "1.5px solid #E64645";
    edit_ticket_title_input.placeholder = "Your ticket's title";
  }
  else{
    edit_ticket_title_input.style.border = "none";
    edit_ticket_title_input.placeholder = "none";
  }
  if(edit_ticket_desc_textarea.value == ""){
    edit_ticket_desc_textarea.style.border = "1.5px solid #E64645";
    edit_ticket_desc_textarea.placeholder = "Write a brief description of your ticket here.";
  }
  else{
    edit_ticket_desc_textarea.style.border = "none";
    edit_ticket_desc_textarea.placeholder = "none";
  }

  for(let i=0; i<edit_ticket_members.length; i++){
        if(edit_ticket_members_checkbox[i].checked == true){
          var users_selected = true;
          break;
        }
  }
  if(!users_selected){
    document.querySelector(".members_wrapper").style.border = "1.5px solid #E64645";
    window.alert("You need to choose at least one user for the project.")
  }
  if(!edit_ticket_title_input.value == "" && !edit_ticket_desc_textarea.value == "" && users_selected){
    document.querySelector("#edit_ticket_dev_selector").scrollTop = 0;
    
    const all_users_id = document.querySelectorAll('.user_id');
    const ticket_id = parseInt(ticket_id_label.innerText);
    const ticket_project_id = parseInt(project_id_label.innerText);
    const ticket_name = edit_ticket_title_input.value;
    const ticket_description = edit_ticket_desc_textarea.value;
    const ticket_status_id = parseInt(edit_ticket_status.value);
    const ticket_type_id = parseInt(edit_ticket_type.value);
    const ticket_priority_id = parseInt(edit_ticket_priority.value);
    try {
      const user_token = localStorage.getItem("user_token");
      await axios.patch(`/api/v1/tickets/${ticket_id}`,{ticket_name, ticket_project_id, ticket_description, ticket_status_id, ticket_type_id, ticket_priority_id}, {headers: { Authorization: `Bearer ${user_token}`}});
      await axios.delete(`/api/v1/tickets/delete_ticket_users/${ticket_id}`, {headers: { Authorization: `Bearer ${user_token}`}});
      for(let i=0; i<edit_ticket_members.length; i++){
        if(edit_ticket_members_checkbox[i].checked == true){
          const user_id = parseInt(all_users_id[i].innerText);
          await axios.post(`/api/v1/tickets/ticket_assigned_users/`,{ticket_project_id, user_id, ticket_id}, {headers: { Authorization: `Bearer ${user_token}`}});
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
    edit_ticket_title_input.style.border = "none";
    edit_ticket_desc_textarea.style.border = "none";

    document.querySelector(".members_wrapper").style.border = "none"
    dispaly_table(item_per_page);
  }
})
// ********** Edit Ticket Window Cancel Button  ***********
edit_ticket_cancel_btn.addEventListener("click", ()=>{

  document.querySelector("#edit_ticket_dev_selector").scrollTop = 0;
  edit_table_window.style.display = "none";
  back_blur_window.style.display = "none";
})

// // *******************************************************
// // *************** Tabel Delete Button  ******************
// // *******************************************************
table_body.addEventListener("click", async(e) => {
  debugger;
  if (e.target.classList.contains("my_delete")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_ticket_id = table_tr[selected_row_index-1].firstChild.innerText;
    const selected_ticket_title = table_tr[selected_row_index-1].children[1].innerText;

    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role } = user_info;
      if(user_role != "Admin" && user_role != "Project Manager"){
         return window.alert("You are not authorized to access this section!");
      }
      
      let delete_confirm_result = window.confirm(`Are you sure you want to delete "${selected_ticket_id}" ticket?!\n*Attention all your data related to this ticket will be remevoed!`);
      if (delete_confirm_result == true) {
        let delete_prompt_entery = window.prompt(`Type delete in order to delete "${selected_ticket_title}" ticket:`);
        if (delete_prompt_entery.toLowerCase() === "delete") {
          
          var {data} = await axios.delete(`/api/v1/tickets/${selected_ticket_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
          
          window.alert(`The ticket "${selected_ticket_title}" was deleted sucessfully.`);
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
// ** AddEvent for Table Details/Ticket Name/ Number buttons **
// ************************************************************

table_body.addEventListener("click", (e)=>{
  debugger;
  if (e.target.cellIndex === 0 || e.target.cellIndex === 1 || e.target.cellIndex === 8){
    
    const selected_row_index = e.target.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_ticket_id = table_tr[selected_row_index - 1].firstChild.innerText;

    window.location.href = "Ticket detail.html?ticket_id=" + encodeURIComponent(selected_ticket_id);
  }
})

// *******************************************************
// *************** +New Ticket Button   ****************
// *******************************************************

// let create_ticket_window = document.querySelector(".create_ticket_window");
// let create_ticket_title = document.querySelector("#create_ticket_title_input");
// let create_ticket_desc = document.querySelector("#create_ticket_desc_textarea");
// let create_ticket_cancel_btn = document.querySelector("#create_ticket_cancel_btn");
// let create_ticket_save_btn = document.querySelector("#create_ticket_save_btn");
// let create_ticket_status = document.querySelector("#create_ticket_status_selector");
// let create_ticket_type = document.querySelector("#create_ticket_type_selector");
// let create_ticket_priority = document.querySelector("#create_ticket_priority_selector");
// let create_ticket_devs = document.querySelectorAll("#create_ticket_dev_selector li");
// let create_ticket_devs_checkbox = document.querySelectorAll("#create_ticket_dev_selector input");
// let create_new_ticket_btn = document.querySelector(".new_ticket_btn");
// let create_ticket_create_btn = document.querySelector("#create_ticket_save_btn");

// create_new_ticket_btn.addEventListener("click", ()=>{
//   // clearing the inputs
//   create_ticket_title.value = ""
//   create_ticket_desc.value = ""
//   create_ticket_title.placeholder = "";
//   create_ticket_desc.placeholder = "";
//   create_ticket_title.style.border = "none";
//   create_ticket_desc.style.border = "none";
//   create_ticket_status.value = 1;
//   create_ticket_type.value = 1;
//   create_ticket_priority.value = 1;


//   if(create_ticket_window.style.display != "block"){
//     create_ticket_window.style.display = "block";
//     back_blur_window.style.display = "block";
//   }
// })

// // ************** Create button **************

// create_ticket_create_btn.addEventListener("click", ()=>{

//   if(create_ticket_title.value == ""){
//     create_ticket_title.style.border = "1.5px solid #E64645";
//     create_ticket_title.placeholder = "Your project name";
//   }
//   else{
//     create_ticket_title.style.border = "none";
//     create_ticket_title.placeholder = "none";
//   }
//   if(create_ticket_desc.value == ""){
//     create_ticket_desc.style.border = "1.5px solid #E64645";
//     create_ticket_desc.placeholder = "Write a brief description of your project here.";
//   }
//   else{
//     create_ticket_desc.style.border = "none";
//     create_ticket_desc.placeholder = "none";
//   }
//   if(!create_ticket_title.value == "" && !create_ticket_desc.value == ""){
//     // *** reseting scroll bar position ***
//     document.querySelector("#create_ticket_dev_selector").scrollTop = 0;
//     // sending the following varaibles to DB
//     console.log(create_ticket_title.value);
//     console.log(create_ticket_status.value);
//     console.log(create_ticket_type.value);
//     console.log(create_ticket_priority.value);
//     console.log(create_ticket_desc.value);
//     // also adding members to DB
//     create_ticket_window.style.display = "none";
//     back_blur_window.style.display = "none";

//     // ************ Clearing the error red lines ************
//     create_ticket_title.style.border = "none";
//     create_ticket_desc.style.border = "none";
//     // *************** Uncheck-mark the members list **************
//     for(let j=0; j < create_ticket_devs.length; j++){
//       create_ticket_devs_checkbox[j].checked = false;
//     }
//   }
// })
// // ********** Create Project Window Cancel Button  ***********
// create_ticket_cancel_btn.addEventListener("click", ()=>{
//   create_ticket_window.style.display = "none";
//     back_blur_window.style.display = "none";
//     for(let j=0; j < create_ticket_devs.length; j++){
//       create_ticket_devs_checkbox[j].checked = false;
//     }
// })

