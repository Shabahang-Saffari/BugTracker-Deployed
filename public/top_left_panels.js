// *******************************************************
// ****************** Login Status  **********************
// *******************************************************
const login_status = document.querySelector(".login_status");
const profile_name = document.querySelector(".profile_name");
let user_id_storage;
let notification_id_storage = [];

async function decode_token() {
  try {
    const user_token = localStorage.getItem("user_token");
    const { data: user_info } = await axios.get(
      "/api/v1/notifications/user_info",
      { headers: { Authorization: `Bearer ${user_token}` } }
    );
    const { user_id, user_role } = user_info;
    user_id_storage = user_id;
    login_status.innerText = `Logged in as: ${user_role}`;

    const { data: data_nickname } = await axios.get(
      `/api/v1/users/${user_id}`,
      { headers: { Authorization: `Bearer ${user_token}` } }
    );
    profile_name.innerText = data_nickname[0].user_nick_name;

    const { data: data_notification } = await axios.get(
      `/api/v1/notifications/user_notification/${user_id_storage}`,
      { headers: { Authorization: `Bearer ${user_token}` } }
    );
    notification_number.innerText = data_notification.length;
  } catch (error) {
    if (error.response.status === 401) localStorage.removeItem("user_token");
    window.alert(error.response.data.msg);
  }
}
decode_token();

// *******************************************************
// **************** Top Notifiacation  *******************
// *******************************************************
const notification_btn = document.querySelector(".notification_wrapper");
const notification_box_wrapper = document.querySelector(".notification_box_wrapper");
const notification_box = document.querySelector(".notification_box");
const notification_number = document.querySelector(".notification_number");

notification_btn.addEventListener("click", load_notifications);
async function load_notifications(){
  
  if (notification_box_wrapper.style.display != "block") {
    while (notification_box.firstChild) {
      notification_box.removeChild(notification_box.lastChild);
    }
    const user_token = localStorage.getItem("user_token");
    const { data } = await axios.get(`/api/v1/notifications/user_notification/${user_id_storage}`,{ headers: { Authorization: `Bearer ${user_token}` } });

    if (data.length > 0) {
      for (let i = data.length - 1; i >= 0; i--) {
        const notifi_row = document.createElement("div");
        notifi_row.classList.add("notifi_row");
        notification_box.appendChild(notifi_row);
        const notifi_row_left = document.createElement("div");
        notifi_row_left.classList.add("notifi_row_left");
        notifi_row.appendChild(notifi_row_left);
        const notifi_row_right = document.createElement("div");
        notifi_row_right.classList.add("notifi_row_right");
        notifi_row.appendChild(notifi_row_right);
        let notification_desc = document.createElement("label");
        notification_desc.innerHTML = "&bull; " + data[i].notification_desc;
        notifi_row_left.appendChild(notification_desc);
        const notifi_date = document.createElement("label");
        notifi_date.innerText = data[i].notification_date;
        notifi_row_right.appendChild(notifi_date);
        const delete_bin = document.createElement("img");
        delete_bin.src = "pictures and icons/Delete-bin.svg";
        delete_bin.classList.add("my_delete");
        notifi_row_right.appendChild(delete_bin);

        notification_id_storage.push(data[i].notification_id);
      }
    }
    if (data.length < 1) {
      const notifi_row = document.createElement("div");
      notifi_row.classList.add("notifi_row");
      notification_box.appendChild(notifi_row);
      const notifi_row_left = document.createElement("div");
      notifi_row_left.classList.add("notifi_row_left");
      notifi_row.appendChild(notifi_row_left);
      const notifi_row_right = document.createElement("div");
      notifi_row_right.classList.add("notifi_row_right");
      notifi_row.appendChild(notifi_row_right);
      let notification_desc = document.createElement("label");
      notification_desc.innerText = "You do not have any notifications!";
      notifi_row_left.appendChild(notification_desc);
    }
    notification_box_wrapper.style.display = "block";
    notification_btn.classList.add("active");

    // ******* Delete Buttons of Notifications *********
    const notifications_delete_buttons = document.querySelectorAll(".my_delete");
    for (let i = 0; i < notifications_delete_buttons.length; i++) {
      notifications_delete_buttons[i].addEventListener("click", async () => {
        const deleting_index = data.length - 1 - i;
        await axios.delete(`/api/v1/notifications/${data[deleting_index].notification_id}`,{ headers: { Authorization: `Bearer ${user_token}` } });
        notification_number.innerText = (data.length) - 1;
        notification_box_wrapper.style.display = "none";
        // ** There might be backward compatibility issue with this code!
        notification_btn.dispatchEvent(new Event("click"));
      });
    }
  } else {
    notification_box_wrapper.style.display = "none";
    notification_btn.classList.remove("active");
  }
}

// *******************************************************
// ******* Click anywhere to close Notification  *********
// *******************************************************
document.addEventListener("click", (e) => {
  
  if (
    !notification_box_wrapper.contains(e.target) &&
    !notification_btn.contains(e.target)
  ) {
    notification_box_wrapper.style.display = "none";
    notification_btn.classList.remove("active");
  }
});
// *******************************************************
// ****************** Profile msg Box  *******************
// *******************************************************
let profile_btn = document.querySelector(".profile_pic");
let profile_msg_box = document.querySelector(".profile_msg_box");
profile_btn.addEventListener("click", () => {
  if (profile_msg_box.style.display != "flex") {
    profile_msg_box.style.display = "flex";
  } else {
    profile_msg_box.style.display = "none";
  }
});
// *******************************************************
// ******* Click anywhere to close sign out box  *********
// *******************************************************
document.addEventListener("click", (e) => {
  if (profile_msg_box.style.display == "flex") {
    if (
      !profile_msg_box.contains(e.target) &&
      !profile_btn.contains(e.target)
    ) {
      profile_msg_box.style.display = "none";
    }
  }
});
// *******************************************************
// ******************** Sign Out btn  ********************
// *******************************************************
let sign_out_btn = document.querySelector(".sign_out_btn");
sign_out_btn.addEventListener("click", async () => {
  const user_token = localStorage.getItem("user_token");
  const { data } = await axios.get(`/api/v1/logout`, {
    headers: { Authorization: `Bearer ${user_token}` },
  });
  localStorage.removeItem("user_token");
  window.location.href = "index.html";
});
// *******************************************************
// ************* Left Panel btns click *******************
// *******************************************************
const hamburger_menu_btn = document.getElementById("hamburger_menu");
const close_menu_btn = document.getElementById("close_menu");
const left_panel = document.querySelector(".left_panel");

let dashboard_btn = document.getElementById("dashboard_btn");
let projects_btn = document.getElementById("projects_btn");
let tickets_btn = document.getElementById("tickets_btn");
let mng_btn = document.getElementById("mng_btn");
let user_btn = document.getElementById("user_btn");

hamburger_menu_btn.addEventListener("click", ()=>{
  left_panel.classList.toggle("active");
  close_menu_btn.classList.add("active");
  hamburger_menu_btn.classList.toggle("active");
})
close_menu_btn.addEventListener("click", ()=>{
  left_panel.classList.toggle("active");
  close_menu_btn.classList.remove("active");
  hamburger_menu_btn.classList.toggle("active");
})



dashboard_btn.addEventListener("click", () => {
  window.location.href = "Dashboard.html";
});
projects_btn.addEventListener("click", () => {
  window.location.href = "Projects.html";
});
tickets_btn.addEventListener("click", () => {
  window.location.href = "Tickets.html";
});
mng_btn.addEventListener("click", async () => {
  try{
      const user_token = localStorage.getItem("user_token");
      const { data: user_info } = await axios.get("/api/v1/notifications/user_info", { headers: { Authorization: `Bearer ${user_token}` } });
      const { user_role } = user_info;
      if(user_role != "Admin"){
         return window.alert("You are not authorized to access this section!");
      }
      window.location.href = "Manage Roles.html";
    }
  catch(error){
    if (error.response.status === 401){
      localStorage.removeItem("user_token");
    } 
    window.alert(error.response.data.msg);
  }
});
user_btn.addEventListener("click", () => {
  // window.location.href = "Projects.html";
});
