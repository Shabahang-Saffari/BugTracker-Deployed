// ***************************************
// *********** Tickets % Cards ***********
// ***************************************
async function get_user_id(){
  try{
    const user_token = localStorage.getItem('user_token');
    const {data:user_info} = await axios.get('/api/v1/notifications/user_info', {headers:{Authorization: `Bearer ${user_token}`}});
    var {user_id} = user_info;
    tickets_status_qty(user_id)
    tickets_type_qty(user_id);
    tickets_priority_qty(user_id);
  }
  catch (error){
    if (error.response.status === 401){
      localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    }
  }
}
get_user_id();
// ***************************************
// ********** Tickets By Status **********
// ***************************************
async function tickets_status_qty (user_id){
  let new_tickets_label = document.querySelector('#new_tickets_label');
  let inProgress_tickets_label = document.querySelector('#inProgress_tickets_label');
  let resolved_tickets_label = document.querySelector('#resolved_tickets_label');
  
  try{
    const user_token = localStorage.getItem('user_token');
    const {data: tickets_status_qty} = await axios.get(`/api/v1/tickets/ticket_status_qty/${user_id}`, {headers:{Authorization: `Bearer ${user_token}`}});
    
    for(let i=0; i< tickets_status_qty.length; i++){
      let {ticket_status_desc} =tickets_status_qty[i]
      switch(ticket_status_desc){
        case("In Progress"):
          var {number:inProgress_tickets} = tickets_status_qty[i];
          break;
        case("New"):
          var {number:new_tickets} = tickets_status_qty[i];
          break;
        case("Resolved"):
          var {number:resolved_tickets} = tickets_status_qty[i];
          break;
      }
    }
    // *** setting 0 as default  *******
    if(!inProgress_tickets)
      inProgress_tickets =0;
    if(!new_tickets)
      new_tickets=0;
    if(!resolved_tickets)
      resolved_tickets=0;
    // ***********
    
    const total_tickets = inProgress_tickets + new_tickets + resolved_tickets;
    if(inProgress_tickets !== 0)
      inProgress_tickets = (inProgress_tickets * 100) / total_tickets;
    if(new_tickets !== 0)
      new_tickets = (new_tickets * 100) / total_tickets;
    if(resolved_tickets !== 0)
      resolved_tickets = (resolved_tickets * 100) / total_tickets;

    let label1_start = -1;
    let label1_end = new_tickets;
    card1_intv_label1 = setInterval(()=>{
      if(label1_start === parseInt(label1_end)){
        
        if(!Number.isInteger(label1_end))new_tickets_label.innerText = `New %${label1_end.toFixed(2)}`;
        
        clearInterval(card1_intv_label1);
        return;
      }
      label1_start = label1_start + 1;
      new_tickets_label.innerText = `New %${label1_start}`;
    },50)

    let label2_start = -1;
    let label2_end = inProgress_tickets;
    card1_intv_label2 = setInterval(()=>{
      if(label2_start === parseInt(label2_end)){
        if(!Number.isInteger(label2_end))inProgress_tickets_label.innerText = `In Progress %${label2_end.toFixed(2)}`;

        clearInterval(card1_intv_label2);
        return;
      }
      label2_start = label2_start + 1;
      inProgress_tickets_label.innerText = `In Progress %${label2_start}`;
    },50)

    
    let label3_start = -1;
    let label3_end = resolved_tickets;
    card1_intv_label3 = setInterval(()=>{
      if(label3_start === parseInt(label3_end)){
        if(!Number.isInteger(label3_end))resolved_tickets_label.innerText = `Resolved %${label3_end.toFixed(2)}`;
        
        clearInterval(card1_intv_label3);
        return;
      }
      label3_start = label3_start + 1;
      resolved_tickets_label.innerText = `Resolved %${label3_start}`;
    },50)
    
    // ************************************
    // ************ PIE Chart *************
    // ************************************
    new_tickets = (360 * new_tickets)/100;
    let circle2_a2=0;
    interval_circle2 = setInterval(()=>{
      
      if(circle2_a2 === parseInt(new_tickets)){
        document.documentElement.style.setProperty('--card1_circel2_a2', `${new_tickets}deg`);
        clearInterval(interval_circle2);
        return;
      }
      document.documentElement.style.setProperty('--card1_circel2_a2', `${circle2_a2}deg`);
      circle2_a2 = circle2_a2 + 1;
    },5)
    // ***************************************
    inProgress_tickets = ((360 * inProgress_tickets)/100) + new_tickets;
    let circle3_a1 = 0;
    interval1_circle3 = setInterval(()=>{
      if(circle3_a1 === parseInt(new_tickets)){
        document.documentElement.style.setProperty('--card1_circel3_a1', `${new_tickets}deg`);
        clearInterval(interval1_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card1_circel3_a1', `${circle3_a1}deg`);
      circle3_a1 = circle3_a1 + 1;
    },5);
    
    let circle3_a2 = 0;
    interval2_circle3 = setInterval(()=>{
      if(circle3_a2 === parseInt(inProgress_tickets)){
        document.documentElement.style.setProperty('--card1_circel3_a2', `${inProgress_tickets}deg`);
        clearInterval(interval2_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card1_circel3_a2', `${circle3_a2}deg`);
      circle3_a2 = circle3_a2 + 1;
    },5)
  }
  catch (error){
    if (error.response.status === 401){
      localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    }
    else{
      window.alert(error);
    }
  }

}

// ***************************************
// ********** Tickets By Type ************
// ***************************************
async function tickets_type_qty (user_id){
  let bug_tickets_label = document.querySelector('#bug_tickets_label');
  let feat_req_tickets_label = document.querySelector('#feat_req_tickets_label');
  let revise_tickets_label = document.querySelector('#revise_tickets_label');
  
  try{
    const user_token = localStorage.getItem('user_token');
    const {data: tickets_type_qty} = await axios.get(`/api/v1/tickets/ticket_type_qty/${user_id}`, {headers:{Authorization: `Bearer ${user_token}`}});


    for(let i=0; i< tickets_type_qty.length; i++){
      let {ticket_type_desc} =tickets_type_qty[i]
      switch(ticket_type_desc){
        case("Bug"):
          var {number:bug_tickets} = tickets_type_qty[i];
          break;
        case("Feature Request"):
          var {number:feat_req_tickets} = tickets_type_qty[i];
          break;
        case("Revise"):
          var {number:revise_tickets} = tickets_type_qty[i];
          break;
      }
    }
    // *** setting 0 as default  *******
    if(!bug_tickets)
      bug_tickets =0;
    if(!feat_req_tickets)
      feat_req_tickets=0;
    if(!revise_tickets)
      revise_tickets=0;
    // ***********

    const total_tickets = bug_tickets + feat_req_tickets + revise_tickets;
    if(bug_tickets !== 0)
      bug_tickets = (bug_tickets * 100) / total_tickets;
    if(feat_req_tickets !== 0)
      feat_req_tickets = (feat_req_tickets * 100) / total_tickets;
    if(revise_tickets !== 0)
      revise_tickets = (revise_tickets * 100) / total_tickets;

    let label1_start = -1;
    let label1_end = bug_tickets;
    card2_intv_label1 = setInterval(()=>{
      if(label1_start === parseInt(label1_end)){
        if(!Number.isInteger(label1_end))bug_tickets_label.innerText = `Bug %${label1_end.toFixed(2)}`;

        clearInterval(card2_intv_label1);
        return;
      }
      label1_start = label1_start + 1;
      bug_tickets_label.innerText = `Bug %${label1_start}`;
    },50)

    let label2_start = -1;
    let label2_end = feat_req_tickets;
    card2_intv_label2 = setInterval(()=>{
      if(label2_start === parseInt(label2_end)){
        if(!Number.isInteger(label2_end)){feat_req_tickets_label.innerText = `Feature Req. %${label2_end.toFixed(2)}`;}
        
        clearInterval(card2_intv_label2);
        return;
      }
      label2_start = label2_start + 1;
      feat_req_tickets_label.innerText = `Feature Req. %${label2_start}`;
    },50)


    let label3_start = -1;
    let label3_end = revise_tickets;
    card2_intv_label3 = setInterval(()=>{
      if(label3_start === parseInt(label3_end)){
        if(!Number.isInteger(label3_end))revise_tickets_label.innerText = `Revise %${label3_end.toFixed(2)}`;
        
        clearInterval(card2_intv_label3);
        return;
      }
      label3_start = label3_start + 1;
      revise_tickets_label.innerText = `Revise %${label3_start}`;
    },50)
    
    // ************************************
    // ************ PIE Chart *************
    // ************************************
    bug_tickets = (360 * bug_tickets)/100;
    let circ2_a2=0;
    intv_circle2 = setInterval(()=>{
      if(circ2_a2 === parseInt(bug_tickets)){
        document.documentElement.style.setProperty('--card2_circel2_a2', `${bug_tickets}deg`);
        clearInterval(intv_circle2);
        return;
      }
      document.documentElement.style.setProperty('--card2_circel2_a2', `${circ2_a2}deg`);
      circ2_a2 = circ2_a2 + 1;
    },5);
    // ***************************************
    feat_req_tickets = ((360 * feat_req_tickets)/100) + bug_tickets;
    let circ3_a1 = 0;
    intv1_circle3 = setInterval(()=>{
      if(circ3_a1 === parseInt(bug_tickets)){
        document.documentElement.style.setProperty('--card2_circel3_a1', `${bug_tickets}deg`);
        clearInterval(intv1_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card2_circel3_a1', `${circ3_a1}deg`);
      circ3_a1 = circ3_a1 + 1;
    },5)

    let circ3_a2=0;
    intv2_circle3 = setInterval(()=>{
      if(circ3_a2 === parseInt(feat_req_tickets)){
        document.documentElement.style.setProperty('--card2_circel3_a2', `${feat_req_tickets}deg`);
        clearInterval(intv2_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card2_circel3_a2', `${circ3_a2}deg`);
      circ3_a2 = circ3_a2 + 1;
    },5)
  }
  catch (error){
    if (error.response.status === 401){
      localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    }
  }
}
// ***************************************
// ******** Tickets By Priority **********
// ***************************************
async function tickets_priority_qty (user_id){
  let immediate_tickets_label = document.querySelector('#immediate_tickets_label');
  let high_tickets_label = document.querySelector('#high_tickets_label');
  let medium_tickets_label = document.querySelector('#medium_tickets_label');
  let low_tickets_label = document.querySelector('#low_tickets_label');
  
  try{
    const user_token = localStorage.getItem('user_token');
    const {data: tickets_priority_qty} = await axios.get(`/api/v1/tickets/ticket_priority_qty/${user_id}`, {headers:{Authorization: `Bearer ${user_token}`}});
    
    for(let i=0; i< tickets_priority_qty.length; i++){
      let {ticket_priority_desc} = tickets_priority_qty[i]
      switch(ticket_priority_desc){
        case("High"):
          var {number:high_tickets} = tickets_priority_qty[i];
          break;
        case("Immediate"):
          var {number:immediate_tickets} = tickets_priority_qty[i];
          break;
        case("Low"):
          var {number:low_tickets} = tickets_priority_qty[i];
          break;
        case("Medium"):
          var {number:medium_tickets} = tickets_priority_qty[i];
          break;
      }
    }
    // *** setting 0 as default  *******
    if(!high_tickets)
      high_tickets =0;
    if(!immediate_tickets)
      immediate_tickets=0;
    if(!low_tickets)
      low_tickets=0;
    if(!medium_tickets)
      medium_tickets=0;
    // ***********
    
    
    const total_tickets = high_tickets + immediate_tickets + medium_tickets + low_tickets;
    if(high_tickets !== 0)
      high_tickets = (high_tickets * 100) / total_tickets;
    if(immediate_tickets !== 0)
      immediate_tickets = (immediate_tickets * 100) / total_tickets;
    if(medium_tickets !== 0)
      medium_tickets = (medium_tickets * 100) / total_tickets;
    if(low_tickets !== 0)
      low_tickets = (low_tickets * 100) / total_tickets;

    let label1_start = -1;
    let label1_end = immediate_tickets;
    card3_intv_label1 = setInterval(()=>{
      if(label1_start === parseInt(label1_end)){
        if(!Number.isInteger(label1_end))immediate_tickets_label.innerText = `Immediate %${label1_end.toFixed(2)}`;

        clearInterval(card3_intv_label1);
        return;
      }
      label1_start = label1_start + 1;
      immediate_tickets_label.innerText = `Immediate %${label1_start}`;
    },50)


    let label2_start = -1;
    let label2_end = high_tickets;
    card3_intv_label2 = setInterval(()=>{
      if(label2_start === parseInt(label2_end)){
        if(!Number.isInteger(label2_end))high_tickets_label.innerText = `High %${label2_end.toFixed(2)}`;

        clearInterval(card3_intv_label2);
        return;
      }
      label2_start = label2_start + 1;
      high_tickets_label.innerText = `High %${label2_start}`;
    },50)


    let label3_start = -1;
    let label3_end = medium_tickets;
    card3_intv_label3 = setInterval(()=>{
      if(label3_start === parseInt(label3_end)){
        if(!Number.isInteger(label3_end))medium_tickets_label.innerText = `Medium %${label3_end.toFixed(2)}`;

        clearInterval(card3_intv_label3);
        return;
      }
      label3_start = label3_start + 1;
      medium_tickets_label.innerText = `Medium %${label3_start}`;
    },50)


    let label4_start = -1;
    let label4_end = low_tickets;
    card3_intv_label4 = setInterval(()=>{
      if(label4_start === parseInt(label4_end)){
        if(!Number.isInteger(label4_end))low_tickets_label.innerText = `Low %${label4_end.toFixed(2)}`;

        clearInterval(card3_intv_label4);
        return;
      }
      label4_start = label4_start + 1;
      low_tickets_label.innerText = `Low %${label4_start}`;
    },50)

    // ************************************
    // ************ PIE Chart *************
    // ************************************
    immediate_tickets = (360 * immediate_tickets)/100;
    let cir2_a2=0;
    int_circle2 = setInterval(()=>{
      if(cir2_a2 === parseInt(immediate_tickets)){
        document.documentElement.style.setProperty('--card3_circel2_a2', `${immediate_tickets}deg`);
        clearInterval(int_circle2);
        return;
      }
      document.documentElement.style.setProperty('--card3_circel2_a2', `${cir2_a2}deg`);
      cir2_a2 = cir2_a2 + 1;
    },5);
    // ***************************************
    high_tickets = ((360 * high_tickets)/100) + immediate_tickets;
    let cir3_a1 = 0;
    int1_circle3 = setInterval(()=>{
      if(cir3_a1 === parseInt(immediate_tickets)){
        document.documentElement.style.setProperty('--card3_circel3_a1', `${immediate_tickets}deg`);
        clearInterval(int1_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card3_circel3_a1', `${cir3_a1}deg`);
      cir3_a1 = cir3_a1 + 1;
    },5)

    let cir3_a2=0;
    int2_circle3 = setInterval(()=>{
      if(cir3_a2 === parseInt(high_tickets)){
        document.documentElement.style.setProperty('--card3_circel3_a2', `${high_tickets}deg`);
        clearInterval(int2_circle3);
        return;
      }
      document.documentElement.style.setProperty('--card3_circel3_a2', `${cir3_a2}deg`);
      cir3_a2 = cir3_a2 + 1;
    },5)
    // ***************************************
    medium_tickets = ((360 * medium_tickets)/100) + high_tickets;
    let cir4_a1 = 0;
    int1_circle4 = setInterval(()=>{
      if(cir4_a1 === parseInt(high_tickets)){
        document.documentElement.style.setProperty('--card3_circel4_a1', `${high_tickets}deg`);
        clearInterval(int1_circle4);
        return;
      }
      document.documentElement.style.setProperty('--card3_circel4_a1', `${cir4_a1}deg`);
      cir4_a1 = cir4_a1 + 1;
    },5)

    let cir4_a2=0;
    int2_circle4 = setInterval(()=>{
      if(cir4_a2 === parseInt(medium_tickets)){
        document.documentElement.style.setProperty('--card3_circel4_a2', `${medium_tickets}deg`);
        clearInterval(int2_circle4);
        return;
      }
      document.documentElement.style.setProperty('--card3_circel4_a2', `${cir4_a2}deg`);
      cir4_a2 = cir4_a2 + 1;
    },5)
  }
  catch (error){
    if (error.response.status === 401){
      localStorage.removeItem('user_token');
      window.alert(error.response.data.msg);
    }
  }
}