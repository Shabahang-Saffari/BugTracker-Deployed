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
let item_per_page = 5;
let qty_all_projects;
let num_of_generated_pages;
let pagination_a_tags;
let page_numbers_buttons;
let search_box = document.querySelector(".search_bar");

// ***************************************
// ******* quantity/page selector ********
// ***************************************
quantity_selector.onchange = function(){
  item_per_page = this.value;
  item_per_page = parseInt(item_per_page);
  page_index = 1;
  if(!search_box.value){
    dispaly_table(item_per_page);
  }
  else{
    dispaly_table(item_per_page, ("%"+search_box.value+"%"));
  }
}

// ***************************************
// *********** Dispaly Tabel *************
// ***************************************
async function dispaly_table(number_of_rows, search_box_input){
  
  if(!search_box_input){
    try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role, user_id } = user_info;

      if(user_role == "Admin"){
        var {data}= await axios.get(`/api/v1/projects?page_number=${page_index}&num_per_page=${number_of_rows}`, {headers:{Authorization: `Bearer ${user_token}`}});
    
        var {data:data_length}= await axios.get(`/api/v1/projects/number_of_dash_projects`, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length[0].projects_qty;
      }
      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/projects/dash_selective_prjs?page_number=${page_index}&num_per_page=${number_of_rows}`,{user_id},{headers: { Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/projects/dash_selective_prjs_qty`,{user_id}, {headers: { Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }
    }
    catch (error){
      if (error.response.status === 401)
        localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    
    }
  }
  // ******** Displaying Search Results *******
  if(search_box_input){
    try{
      var user_token = localStorage.getItem('user_token');
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role, user_id } = user_info;

      if(user_role == "Admin"){
        
        var {data}= await axios.get(`/api/v1/projects/search?page_number=${page_index}&num_per_page=${number_of_rows}&search_word=${search_box_input}`, {headers:{Authorization: `Bearer ${user_token}`}});
        
        var {data:data_length}= await axios.get(`/api/v1/projects/search_project_qty?search_word=${search_box_input}`, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }

      if(user_role != "Admin"){
        var { data } = await axios.post(`/api/v1/projects/search_dash_selective/?page_number=${page_index}&num_per_page=${number_of_rows}&search_word=${search_box_input}`,{user_id}, {headers:{Authorization: `Bearer ${user_token}`}});

        var { data: data_length} = await axios.post(`/api/v1/projects/search_dash_selective_qty/?search_word=${search_box_input}`,{user_id}, {headers:{Authorization: `Bearer ${user_token}`}});
        qty_all_projects = data_length.length;
      }
    }
    catch(error){
      if (error.response.status === 401)
        localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    } 
  }

  // ******************************************
  table_body.innerText="";
  for(let i = 0; i<data.length; i++){
    
    table_body.innerHTML += `<tr><td>${data[i].project_ID}</td><td>${data[i].project_name}</td><td>${data[i].project_desc}</td><td>${data[i].contributors}</td></tr>`;
  }
  table_tr_for_coloring = table_body.querySelectorAll("tr");
  for(let i=0; i<table_tr_for_coloring.length; i++){
  if(i%2 == 0){
    table_tr_for_coloring[i].style.backgroundColor = "#48225a00";
  }
  if(i%2 != 0){
    table_tr_for_coloring[i].style.backgroundColor = "#ffffff14";
  }
  }

  if (qty_all_projects <= number_of_rows){
    pagination_bar.style.display = "none";
  }
  else{
    pagination_bar.style.display = "flex";
    num_of_generated_pages = Math.ceil(qty_all_projects / number_of_rows);
    const page_nums_to_delete = pagination_bar.querySelectorAll(".page_numbers");
    page_nums_to_delete.forEach(item => item.remove());
    
    for(let i=1; i<= num_of_generated_pages; i++){
      const new_li = document.createElement('li');
      new_li.className = "page_numbers";
      const new_a = document.createElement('a');
      new_a.href = "#";
      if(i<10){
        new_a.innerText = "0" + i;
      }
      else{new_a.innerText = i;}
      new_a.setAttribute("data-page", i);
      new_li.appendChild(new_a);
      pagination_bar.insertBefore(new_li, pagination_bar.querySelector(".next_page"));
    }
    page_numbers_buttons = document.querySelectorAll(".page_numbers");
    page_numbers_buttons.forEach(item=> item.classList.remove("active"));
    page_numbers_buttons[page_index - 1].classList.add("active");

    pagination_a_tags = pagination_bar.querySelectorAll('a');
    page_runner(pagination_a_tags, search_box.value);
    
  }
}
dispaly_table(item_per_page);
// ***************************************
// ************* Page Runner *************
// ***************************************
function page_runner(pagination_a_tags, search_box_input){
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
search_box.addEventListener("input", e=>search_tabel(search_box.value, item_per_page));

async function search_tabel(search_box_input, item_per_page){
  
  page_index = 1;
  
  if(search_box_input == ""){
    return dispaly_table(item_per_page);
  }

  search_box_input = '%'+search_box_input+'%';
  dispaly_table(item_per_page, search_box_input);
  }




// ************************************************************
// ********* AddEvent for Table Project Name button ***********
// ************************************************************
table_body.addEventListener("click", async (e)=>{
  if (e.target.cellIndex === 1){
    const selected_row_index = e.target.parentElement.rowIndex;
    const table_tr = table_body.getElementsByTagName("tr");
    const selected_project_id = table_tr[selected_row_index-1].firstChild.innerText;

    window.location.href = "Project detail.html?project_id="+encodeURIComponent(selected_project_id);
  }
})