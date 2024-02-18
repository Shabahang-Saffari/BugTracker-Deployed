window.addEventListener('resize', window_measuring);
function window_measuring(){
  let win_inner_width = window.innerWidth;
  let win_inner_height = window.innerHeight;
  document.documentElement.style.setProperty('--window_inner_width', `${win_inner_width}px`);
  document.documentElement.style.setProperty('--window_inner_height', `${win_inner_height}px`);
}
window_measuring();
// *******************************************************
// ****** Ticket Tabel/Assigned Devs Variables ***********
// *******************************************************
let ticket_info_tbody = document.querySelector(".ticket_info_tbody");
let contributors_tbody = document.querySelector(".contributors_tbody");

// ************* Getting Selected Project info ***********
const params = window.location.search;
const ticket_id = new URLSearchParams(params).get('ticket_id');
let project_id;

async function dispaly_ticket_info(){
  try{
    const user_token = localStorage.getItem("user_token");
    var {data:ticket_info} = await axios.get(`/api/v1/tickets/${ticket_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});

    const formatted_ticket_date = new Date(ticket_info[0].ticket_creation_date).toLocaleDateString(undefined, {timeZone: "UTC"});
    const formatted_ticket_time = new Date(ticket_info[0].ticket_creation_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});
    ticket_info_tbody.innerText = "";
    ticket_info_tbody.innerHTML += `<tr><td>${ticket_info[0].ticket_id}</td><td>${ticket_info[0].ticket_name}</td><td>${ticket_info[0].project_name}</td><td>${ticket_info[0].ticket_description}</td><td>${ticket_info[0].ticket_type_desc}</td><td>${ticket_info[0].ticket_priority_desc}</td><td>${ticket_info[0].ticket_status_desc}</td><td>${formatted_ticket_date}</br>${formatted_ticket_time}</td></tr>`;

    project_id = ticket_info[0].ticket_project_id;
    // *************  Assigned Devs  ****************
    var {data:assigned_devs_info} = await axios.get(`/api/v1/users/ticket_assigned_users/${ticket_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
    for (let i = 0; i < assigned_devs_info.length; i++) {
      contributors_tbody.innerHTML += `<tr><td>${assigned_devs_info[i].name}</td><td>${assigned_devs_info[i].user_email}</td><td>${assigned_devs_info[i].role_name}</td></tr>`;
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
    // console.log(error);
  }
}
dispaly_ticket_info();

// *******************************************************
// ************* Comments Tabel Variables ****************
// *******************************************************
let comment_table_body = document.querySelector(".comments_table_content tbody");
let pagination_bar = document.querySelector(".pagination_bar");
let quantity_selector = document.querySelector(".quantity_selector");
let comment_table_tr = document.querySelectorAll(".comments_table_content tr");
let table_tr_for_coloring = comment_table_body.querySelectorAll("tr");
let page_index = 1;
let item_per_page = 4;
let page_numbers_buttons = document.querySelectorAll(".page_numbers");
let sorting_order = "ascending";
let search_box = document.querySelector(".search_bar");

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
    return dispaly_comment_table(item_per_page);
  }
  dispaly_comment_table(item_per_page, "%" + search_box.value + "%");
}

// ***************************************
// ******** Dispaly Comment Tabel ********
// ***************************************
async function dispaly_comment_table(number_of_rows, search_box_input) {
  if (!search_box_input) {
    try {
      var user_token = localStorage.getItem("user_token");
      var {data:ticket_comments} = await axios.post(`/api/v1/comments/${ticket_id}`, {page_index, number_of_rows}, { headers: { Authorization: `Bearer ${user_token}`}});
      var {data:ticket_comments_qty} = await axios.get(`/api/v1/comments/all_comments_qty/${ticket_id}`, { headers: { Authorization: `Bearer ${user_token}`}});
    } 
    catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
      // console.log(error);
    }

    comment_table_body.innerText = "";
    const edit_icon = document.createElement("img");
    edit_icon.src = "pictures and icons/Edit-pen.svg";
    edit_icon.alt = "Edit Icon";
    edit_icon.classList.add("my_edit");

    const delete_icon = document.createElement("img");
    delete_icon.src = "pictures and icons/Delete-bin.svg";
    delete_icon.alt = "Delete Icon";
    delete_icon.classList.add("my_delete");
    delete_icon.setAttribute("id", "table_delete_comment");
    let comment_row_index = 0;

    for (let i = 0; i < ticket_comments.length ; i++){
      const formatted_comment_date = new Date(ticket_comments[i].comment_date).toLocaleDateString(undefined, {timeZone: "UTC"});
      const formatted_comment_time = new Date(ticket_comments[i].comment_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});

      comment_table_body.innerHTML += `<tr><td>${ticket_comments[i].comment_id}</td><td>${ticket_comments[i].created_by}</td><td>${ticket_comments[i].comment_desc}</td><td>${formatted_comment_date}</br>${formatted_comment_time}</td></tr>`;
      let first_cell = comment_table_body.rows[comment_row_index].insertCell(-1);
      first_cell.appendChild(edit_icon);
      let second_cell = comment_table_body.rows[comment_row_index].insertCell(-1);
      second_cell.appendChild(delete_icon);
      comment_row_index = comment_row_index + 1;
    }
  }
 
  // ******** Displaying Search Results *******
  if (search_box_input) {
    try {
      debugger;
      var user_token = localStorage.getItem("user_token");
      var { data:search_tik_comments_result } = await axios.post(`/api/v1/comments/search_comments/${ticket_id}?search_word=${search_box_input}`, {page_index, number_of_rows}, { headers: { Authorization: `Bearer ${user_token}`}});

      var { data: ticket_comments_qty } = await axios.get(`/api/v1/comments/search_comments_qty/${ticket_id}?search_word=${search_box_input}`, { headers: { Authorization: `Bearer ${user_token}`}});
      debugger;
      
    } catch (error) {
      if (error.response.status === 401) localStorage.removeItem("user_token");
      window.alert(error.response.data.msg);
    }

    comment_table_body.innerText = "";
    const edit_icon = document.createElement("img");
    edit_icon.src = "pictures and icons/Edit-pen.svg";
    edit_icon.alt = "Edit Icon";
    edit_icon.classList.add("my_edit");

    const delete_icon = document.createElement("img");
    delete_icon.src = "pictures and icons/Delete-bin.svg";
    delete_icon.alt = "Delete Icon";
    delete_icon.classList.add("my_delete");
    delete_icon.setAttribute("id", "table_delete_comment");
    let comment_row_index = 0;

    for (let i = 0; i < search_tik_comments_result.length; i++){
      const formatted_comment_date = new Date(search_tik_comments_result[i].comment_date).toLocaleDateString(undefined, {timeZone: "UTC"});
      const formatted_comment_time = new Date(search_tik_comments_result[i].comment_time).toLocaleTimeString(undefined, {timeZone: "UTC", hour:"2-digit", minute:"2-digit"});


      comment_table_body.innerHTML += `<tr><td>${search_tik_comments_result[i].comment_id}</td><td>${search_tik_comments_result[i].created_by}</td><td>${search_tik_comments_result[i].comment_desc}</td><td>${formatted_comment_date}</br>${formatted_comment_time}</td></tr>`;
      let first_cell = comment_table_body.rows[comment_row_index].insertCell(-1);
      first_cell.appendChild(edit_icon);
      let second_cell = comment_table_body.rows[comment_row_index].insertCell(-1);
      second_cell.appendChild(delete_icon);
      comment_row_index = comment_row_index + 1;
    }
  }
  // ******************************************

  
  table_tr_for_coloring = comment_table_body.querySelectorAll("tr");
  for (let i = 0; i < table_tr_for_coloring.length; i++) {
    if (i % 2 == 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#48225a00";
    }
    if (i % 2 != 0) {
      table_tr_for_coloring[i].style.backgroundColor = "#ffffff14";
    }
  }

  if (ticket_comments_qty.length <= item_per_page) {
    pagination_bar.style.display = "none";
  } else {
    pagination_bar.style.display = "flex";
    num_of_generated_pages = Math.ceil(ticket_comments_qty.length / item_per_page);
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
dispaly_comment_table(item_per_page);
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
        dispaly_comment_table(item_per_page);
      } else {
        search_box_input = "%" + search_box_input + "%";
        dispaly_comment_table(item_per_page, search_box_input);
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
    return dispaly_comment_table(item_per_page);
  } 
  dispaly_comment_table(item_per_page, search_box_input);
}



// *******************************************************
// *************** Edit Comment Window   ****************
// *******************************************************
let back_blur_window = document.querySelector(".back_blur_window");
let table_edit_btn = document.querySelectorAll(".my_edit");
let edit_comment_window = document.querySelector(".edit_comment_window");
let edit_comment_desc = document.querySelector("#edit_comment_desc_textarea");
let edit_comment_cancel_btn = document.querySelector("#edit_comment_cancel_btn");
let edit_comment_save_btn = document.querySelector("#edit_comment_save_btn");
let edit_comment_id_label = document.querySelector(".comment_id_label")

// ************* AddEvent for Edit button *************
comment_table_body.addEventListener("click", async(e) => {
  
  if (e.target.classList.contains("my_edit")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const comment_table_tr = comment_table_body.getElementsByTagName("tr");
    const selected_comment_id = comment_table_tr[selected_row_index - 1].firstChild.innerText;
    edit_comment_id_label.innerText = selected_comment_id;
    
    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role, user_id } = user_info;
      var { data:comment_info } = await axios.get(`/api/v1/comments/single_comment/${selected_comment_id}`, { headers: { Authorization: `Bearer ${user_token}`}});
      
      if(user_id != comment_info[0].created_by){
         return window.alert("You cannot edit this comment, another user has created this comment!");
      }
      
    }
    catch(error){
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
    }
    if (edit_comment_window.style.display != "block") {
      
      edit_comment_desc.value = comment_info[0].comment_desc;
      // **************** Making the Edit Window Visible ***************
      edit_comment_window.style.display = "block";
      back_blur_window.style.display = "block"
    }
  }

});

// ************** Save Changes button **************

edit_comment_save_btn.addEventListener("click", async ()=>{

  if(edit_comment_desc.value == ""){
    edit_comment_desc.style.border = "1.5px solid #E64645";
    edit_comment_desc.placeholder = "Write your comment here.";
  }
  else{
    edit_comment_desc.style.border = "none";
    edit_comment_desc.placeholder = "";
  }

  if(!edit_comment_desc.value == ""){
    try {
      
      const user_token = localStorage.getItem("user_token");
      const comment_id = edit_comment_id_label.innerText;
      const edited_comment_desc = edit_comment_desc.value;

      await axios.patch(`/api/v1/comments/${comment_id}`,{edited_comment_desc}, {headers: { Authorization: `Bearer ${user_token}`}});

    } 
    catch (error) {
      if (error.response.status === 401){
        localStorage.removeItem("user_token");
      } 
      window.alert(error.response.data.msg);
      // console.log(error);
    }


    edit_comment_window.style.display = "none";
    back_blur_window.style.display = "none";

    // ************ Clearing the error red lines ************
    edit_comment_desc.style.border = "none";
    dispaly_comment_table(item_per_page);
  }
})
// ********** Edit Comment Cancel Button  ***********
edit_comment_cancel_btn.addEventListener("click", ()=>{
    edit_comment_desc.style.border = "none";
    edit_comment_desc.placeholder = "";
    edit_comment_window.style.display = "none";
    back_blur_window.style.display = "none";
})
// *******************************************************
// *************** Tabel Delete Button  ******************
// *******************************************************
comment_table_body.addEventListener("click", async(e) => {
  if (e.target.classList.contains("my_delete")) {
    const selected_row_index = e.target.parentElement.parentElement.rowIndex;
    const comment_table_tr = comment_table_body.getElementsByTagName("tr");
    const selected_comment_id = comment_table_tr[selected_row_index - 1].firstChild.innerText;
    // const selected_project_name = table_tr[selected_row_index-1].children[1].innerText;

    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      var { data:comment_info } = await axios.get(`/api/v1/comments/single_comment/${selected_comment_id}`, { headers: { Authorization: `Bearer ${user_token}`}});

      const { user_role, user_id } = user_info;
      if(user_id != comment_info[0].created_by && user_role != "Admin" && user_role != "Project Manager"){
         return window.alert("You cannot delete this comment!");
      }
      
      let delete_confirm_result = window.confirm(`Are you sure you want to delete this comment?`);
      if (delete_confirm_result == true) {
        var {data} = await axios.delete(`/api/v1/comments/${selected_comment_id}`, { headers: { Authorization: `Bearer ${user_token}`}});
        
        page_index = 1;
        dispaly_comment_table(item_per_page);
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

// *******************************************************
// *************** +New Comment Button   ****************
// *******************************************************
let new_comment_btn = document.querySelector("#new_commnet_btn");
let create_comment_window = document.querySelector(".create_comment_window");
let create_comment_desc = document.querySelector("#create_comment_desc_textarea");
let create_comment_cancel_btn = document.querySelector("#create_comment_cancel_btn");
let create_comment_create_btn = document.querySelector("#create_comment_create_btn");


new_comment_btn.addEventListener("click", ()=>{
  // clearing the inputs
  create_comment_desc.value = ""
  create_comment_desc.placeholder = "";
  create_comment_desc.style.border = "none";

  if(create_comment_window.style.display != "block"){
    create_comment_window.style.display = "block";
    back_blur_window.style.display = "block";
  }
})

// ************** Create button **************

create_comment_create_btn.addEventListener("click", async ()=>{
  debugger;
  if(create_comment_desc.value == ""){
    create_comment_desc.style.border = "1.5px solid #E64645";
    create_comment_desc.placeholder = "Write your comment here.";
  }
  else{
    create_comment_desc.style.border = "none";
    create_comment_desc.placeholder = "";
  }
  if(!create_comment_desc.value == ""){
    try {
      const new_comment_desc = create_comment_desc.value;
      
      var current_date = new Date();
      var new_comment_date = current_date.toLocaleDateString();
      var new_comment_time = current_date.toLocaleTimeString();
      
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const {user_id : comment_submitter_id} = user_info;
      await axios.post(`/api/v1/comments/`,{project_id, ticket_id, comment_submitter_id, new_comment_desc, new_comment_date, new_comment_time}, {headers: { Authorization: `Bearer ${user_token}`}});
      
      var {data:assigned_devs_info} = await axios.get(`/api/v1/users/ticket_assigned_users/${ticket_id}`,{ headers: { Authorization: `Bearer ${user_token}`}});
      

      for(let i=0; i < assigned_devs_info.length; i++){
        if(assigned_devs_info[i].user_id != comment_submitter_id){
          const user_id = assigned_devs_info[i].user_id;
          const notification_desc = `A new comment has been added for the ticket# "${ticket_id}".`;
          const notification_date = new_comment_date;
          await axios.post(`/api/v1/notifications/new_notification/`,{user_id, notification_desc, notification_date }, {headers: { Authorization: `Bearer ${user_token}`}});
        }
      }
      // ****** HERE I have to add the code to refresh the Notification of the top page *******
    } 
    catch (error) {
      // if (error.response.status === 401){
      //   localStorage.removeItem("user_token");
      // } 
      window.alert(error.response.data.msg);
      // console.log(error);
    }


    create_comment_window.style.display = "none";
    back_blur_window.style.display = "none";

    // ************ Clearing the error red lines ************
    create_comment_desc.style.border = "none";
    dispaly_comment_table(item_per_page);
  }
})
// ********** Create Project Window Cancel Button  ***********
create_comment_cancel_btn.addEventListener("click", ()=>{
    create_comment_window.style.display = "none";
    back_blur_window.style.display = "none";
})

