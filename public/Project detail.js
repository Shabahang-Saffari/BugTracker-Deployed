window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();

// *******************************************************
// ****** Project Tabel/ Contributors Variables **********
// *******************************************************
let prj_table_body = document.querySelector(".prj_info_tbody");
let contributors_tbody = document.querySelector(".contributors_tbody");

// ************* Getting Selected Project info ***********
const params = window.location.search;
const project_id = new URLSearchParams(params).get('project_id');

async function dispaly_project_info(){
  try{
    const user_token = localStorage.getItem("user_token");
    var {data:project_info} = await axios.get(`/api/v1/projects/${project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    prj_table_body.innerText = "";
    prj_table_body.innerHTML += `<tr><td>${project_info[0].project_name}</td><td>${project_info[0].project_desc}</td><td>${project_info[0].contributors}</td><td>${project_info[0].project_status_desc}</tr>`;
    // *************  Contributors  ****************
    var {data:contributors_info} = await axios.get(`/api/v1/users/prj_contributors_info/${project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    for (let i = 0; i < contributors_info.length; i++) {
    contributors_tbody.innerHTML += `<tr><td>${contributors_info[i].project_contributors}</td><td>${contributors_info[i].user_email}</td><td>${contributors_info[i].role_name}</td></tr>`;
  }

  table_tr_for_coloring = contributors_tbody.querySelectorAll(".contributors_tbody tr");
  for (let i = 0; i < table_tr_for_coloring.length; i++) {
    if (i % 2 == 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#48225a00";
    }
    if (i % 2 != 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#ffffff14";
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
dispaly_project_info();

// *******************************************************
// ************* Ticket's Tabel Variables *****************
// *******************************************************
let ticket_table_body = document.querySelector(".tickets_table_content tbody");
let pagination_bar = document.querySelector(".pagination_bar");
let quantity_selector = document.querySelector(".quantity_selector");
let table_tr_for_coloring;
let page_index = 1;
let item_per_page = 4;
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
    return dispaly_ticket_table(item_per_page);
  }
  dispaly_ticket_table(item_per_page, "%" + search_box.value + "%");
}

// ***************************************
// ******** Dispaly Ticket Tabel *********
// ***************************************
async function dispaly_ticket_table(number_of_rows, search_box_input) {
  if (!search_box_input) {
    try {
      var user_token = localStorage.getItem("user_token");
      var {data:prj_all_tickets} = await axios.get(`/api/v1/tickets/project_tickets/${project_id}?page_number=${page_index}&num_per_page=${number_of_rows}`, { headers: { Authorization: `Bearer ${user_token}`}});
    } 
    catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
      
    }

    var tickets_info = prj_all_tickets[0];
    var all_tickets_qty = prj_all_tickets[1][0].all_tickets_qty;
    ticket_table_body.innerText = "";

    for (let i = 0; i < tickets_info.length; i++){
      const formatted_ticket_date = new Date(tickets_info[i].ticket_creation_date).toLocaleDateString(undefined, {timeZone: "UTC"});
      const formatted_ticket_time = new Date(tickets_info[i].ticket_creation_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});


      ticket_table_body.innerHTML += `<tr><td>${tickets_info[i].ticket_id}</td><td>${tickets_info[i].ticket_name}</td><td>${tickets_info[i].ticket_submitter}</td><td>${tickets_info[i].assigned_users}</td><td>${tickets_info[i].ticket_status_desc}</td><td>${formatted_ticket_date}</br>${formatted_ticket_time}</td><td>Detail</td></tr>`;
    }
  }
 
  // ******** Displaying Search Results *******
  if (search_box_input) {
    try {
      var user_token = localStorage.getItem("user_token");
      var { data:search_results } = await axios.get(`/api/v1/tickets/search_tickets_proj_details/${project_id}?page_number=${page_index}&num_per_page=${number_of_rows}&search_word=${search_box_input}`,{ headers: { Authorization: `Bearer ${user_token}`}});
      var { data: search_results_qty } = await axios.get(`/api/v1/tickets/search_tickets_proj_details_qty/${project_id}?search_word=${search_box_input}`,{ headers: { Authorization: `Bearer ${user_token}`}});
      qty_all_projects = search_results_qty.length;
    } catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
    }

    var tickets_info = search_results;
    var all_tickets_qty = search_results_qty.length;
    ticket_table_body.innerText = "";

    for (let i = 0; i < tickets_info.length; i++){
      const formatted_ticket_date = new Date(tickets_info[i].ticket_creation_date).toLocaleDateString(undefined, {timeZone: "UTC"});
      const formatted_ticket_time = new Date(tickets_info[i].ticket_creation_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});


      ticket_table_body.innerHTML += `<tr><td>${tickets_info[i].ticket_id}</td><td>${tickets_info[i].ticket_name}</td><td>${tickets_info[i].ticket_submitter}</td><td>${tickets_info[i].assigned_users}</td><td>${tickets_info[i].ticket_status_desc}</td><td>${formatted_ticket_date}</br>${formatted_ticket_time}</td><td>Detail</td></tr>`;
    }
  }
  // ******************************************


  table_tr_for_coloring = ticket_table_body.querySelectorAll("tr");
  for (let i = 0; i < table_tr_for_coloring.length; i++) {
    if (i % 2 == 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#48225a00";
    }
    if (i % 2 != 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#ffffff14";
    }
  }

  if (all_tickets_qty <= item_per_page) {
    pagination_bar.style.display = "none";
  } else {
    pagination_bar.style.display = "flex";
    num_of_generated_pages = Math.ceil(all_tickets_qty / item_per_page);
    const page_nums_to_delete = pagination_bar.querySelectorAll(".page_numbers");
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
dispaly_ticket_table(item_per_page);
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
        dispaly_ticket_table(item_per_page);
      } else {
        search_box_input = "%" + search_box_input + "%";
        dispaly_ticket_table(item_per_page, search_box_input);
      }
    };
  }
}

// ***************************************
// *************** Search ****************
// ***************************************
search_box.addEventListener("input", (e) => search_ticket_tabel(search_box.value, item_per_page));

async function search_ticket_tabel(search_box_input, item_per_page) {
  search_box_input = "%" + search_box_input.toLowerCase() + "%";
  page_index = 1;
  if (search_box_input == "") {
    return dispaly_ticket_table(item_per_page);
  } 
  dispaly_ticket_table(item_per_page, search_box_input);
}

// *******************************************************
// *************** +New Ticket Button   ****************
// *******************************************************
let back_blur_window = document.querySelector(".back_blur_window");
let new_ticket_btn = document.querySelector("#new_ticket_btn");
let create_ticket_window = document.querySelector(".create_ticket_window");
let create_ticket_title = document.querySelector(".create_ticket_title_input");
let create_ticket_desc = document.querySelector("#create_ticket_desc_textarea");
let create_ticket_cancel_btn = document.querySelector("#create_ticket_cancel_btn");
let create_ticket_create_btn = document.querySelector("#create_ticket_create_btn");
let create_ticket_status = document.querySelector("#create_ticket_status_selector");
let create_ticket_type = document.querySelector("#create_ticket_type_selector");
let create_ticket_priority = document.querySelector("#create_ticket_priority_selector");
let create_ticket_devs = document.querySelectorAll("#create_ticket_dev_selector li");
let create_ticket_dev_checkbox = document.querySelectorAll("#create_ticket_dev_selector input");

new_ticket_btn.addEventListener("click", async()=>{

  const user_token = localStorage.getItem("user_token");
  try{
    var { data:users } = await axios.get(`/api/v1/users/project_assigned_users/${project_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
  }
  catch (error) {
    if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
    window.alert(error.response.data.msg);
  }
  if (create_ticket_window.style.display != "block") {

    // **** removing old users list ****
    // *** For faster performance: search>> first child, Delete>> last child ****
    var create_ticket_dev_selector = document.getElementById("create_ticket_dev_selector");
    while (create_ticket_dev_selector.firstChild) {
    create_ticket_dev_selector.removeChild(create_ticket_dev_selector.lastChild);
    }
    
    create_ticket_title.value = ""
    create_ticket_desc.value = ""
    create_ticket_title.placeholder = "";
    create_ticket_desc.placeholder = "";
    create_ticket_title.style.border = "none";
    create_ticket_desc.style.border = "none";
    create_ticket_status.value = 1;
    create_ticket_type.value = 1;
    create_ticket_priority.value = 1;

    for (let j = 0; j < users.length; j++) {

      const single_li = document.createElement('li');
      const user_check_box = document.createElement('input');
      const user_id_label = document.createElement('label');
      user_id_label.innerText = users[j].user_id;
      user_id_label.classList.add('new_ticket_user_id');
      user_check_box.type = "checkbox";
      single_li.appendChild(user_check_box);
      create_ticket_dev_selector.appendChild(single_li);
      single_li.appendChild(document.createTextNode(users[j].name));
      single_li.appendChild(user_id_label);
    }

    // **************** Making the Edit Window Visible ***************
    create_ticket_window.style.display = "block";
    back_blur_window.style.display = "block";
    document.getElementById("create_ticket_dev_selector").scrollTop = 0;
  }
})

// ************** Create button **************

create_ticket_create_btn.addEventListener("click", async()=>{
  
  let create_ticket_members = document.querySelectorAll("#create_ticket_dev_selector li");
  let create_ticket_members_checkbox = document.querySelectorAll("#create_ticket_dev_selector input");
  if(create_ticket_title.value == ""){
    create_ticket_title.style.border = "1.5px solid #E64645";
    create_ticket_title.placeholder = "Your ticket's title";
  }
  else{
    create_ticket_title.style.border = "none";
    create_ticket_title.placeholder = "";
  }
  if(create_ticket_desc.value == ""){
    create_ticket_desc.style.border = "1.5px solid #E64645";
    create_ticket_desc.placeholder = "Write a brief description of your ticket here.";
  }
  else{
    create_ticket_desc.style.border = "none";
    create_ticket_desc.placeholder = "";
  }
  for(let i=0; i < create_ticket_members.length; i++){
        if(create_ticket_members_checkbox[i].checked == true){
          var users_selected = true;
          break;
        }
  }
  if(!users_selected){
    document.querySelector(".members_wrapper").style.border = "1.5px solid #E64645";
    window.alert("You need to choose at least one developer for the ticket.")
  }
  if(users_selected){
    document.querySelector(".members_wrapper").style.border = "none";
  }

  if(!create_ticket_title.value == "" && !create_ticket_desc.value == "" && users_selected){
    const create_ticket_all_users_id = document.querySelectorAll('.new_ticket_user_id');
    var ticket_project_id = project_id;
    var ticket_name = create_ticket_title.value;
    var ticket_description = create_ticket_desc.value;
    var ticket_status_id = parseInt(create_ticket_status.value);
    var ticket_type_id = parseInt(create_ticket_type.value);
    var ticket_priority_id = parseInt(create_ticket_priority.value);
    var current_date = new Date();

    ticket_creation_date = current_date.toLocaleDateString();
    ticket_creation_time = current_date.toLocaleTimeString();

    try {
      const user_token = localStorage.getItem("user_token");

      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_id: ticket_submitter_id } = user_info;

      const {data: new_ticket_info} = await axios.post(`/api/v1/tickets/`,{ticket_name, ticket_project_id, ticket_description, ticket_type_id, ticket_priority_id, ticket_status_id, ticket_submitter_id, ticket_creation_date, ticket_creation_time}, {headers: { Authorization: `Bearer ${user_token}`}});
      const {ticket_id} = new_ticket_info[0];

      for(let i=0; i<create_ticket_members.length; i++){
        if(create_ticket_members_checkbox[i].checked == true){
          const user_id = parseInt(create_ticket_all_users_id[i].innerText);
          await axios.post(`/api/v1/tickets/ticket_assigned_users/`,{ticket_project_id, user_id, ticket_id}, {headers: { Authorization: `Bearer ${user_token}`}});
          const notification_desc = `You have been assigned the new ticket "${ticket_id}"`;
          const notification_date = ticket_creation_date;
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
      // console.log(error);
    }

    // *** reseting scroll bar position ***
    document.getElementById("create_ticket_dev_selector").scrollTop = 0;
    create_ticket_window.style.display = "none";
    back_blur_window.style.display = "none";
    // ************ Clearing the error red lines ************
    create_ticket_title.value = ""
    create_ticket_desc.value = ""
    create_ticket_title.placeholder = "";
    create_ticket_desc.placeholder = "";
    create_ticket_title.style.border = "none";
    create_ticket_desc.style.border = "none";
    create_ticket_status.value = 1;
    create_ticket_type.value = 1;
    create_ticket_priority.value = 1;
    document.querySelector(".members_wrapper").style.border = "none";
    // *************** Uncheck-mark the members list **************
    for(let j=0; j < create_ticket_devs.length; j++){
      create_ticket_dev_checkbox[j].checked = false;
    }



    // // *** reseting scroll bar position ***
    // document.querySelector("#create_ticket_dev_selector").scrollTop = 0;
    // create_ticket_window.style.display = "none";
    // back_blur_window.style.display = "none";

    // // ************ Clearing the error red lines ************
    // create_ticket_title.style.border = "none";
    // create_ticket_desc.style.border = "none";
    dispaly_ticket_table(item_per_page);
  }
})
// ********** Create Project Window Cancel Button  ***********
create_ticket_cancel_btn.addEventListener("click", ()=>{
    create_ticket_window.style.display = "none";
    back_blur_window.style.display = "none";
    for(let j=0; j < create_ticket_devs.length; j++){
      create_ticket_dev_checkbox[j].checked = false;
    }
})


// ************************************************************
// ***** AddEvent for Table Details/Ticket ID/Name button *******
// ************************************************************

ticket_table_body.addEventListener("click", (e)=>{
  if (e.target.cellIndex === 0 || e.target.cellIndex === 1 || e.target.cellIndex === 6){
    
    const selected_row_index = e.target.parentElement.rowIndex;
    const ticket_table_tr = ticket_table_body.getElementsByTagName("tr");
    const selected_ticket_id = ticket_table_tr[selected_row_index - 1].firstChild.innerText;

    window.location.href = "Ticket detail.html?ticket_id=" + encodeURIComponent(selected_ticket_id);
  }
})



    