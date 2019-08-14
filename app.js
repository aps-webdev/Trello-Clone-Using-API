let checklistItems = document.getElementById('checklistItems');
let key = '*********';
let token = '*******';
let listId = '******';

// get all card in listId = 5d02407022a12505f37b119a
const getAllCards = (listId) => {    
    return fetch(`https://api.trello.com/1/lists/${listId}/cards`).then(response => response.json()).catch(error => errorMessage(3000))
}

// get all checklist-items-Ids in the list
const getAllChecklistsIds = (cards) => {
    let checklistsId = cards.reduce((acc, card) => {        
        let checklistArray = card.idChecklists;        
        checklistArray.map((checklistItemId) => {
            acc.push(checklistItemId);
        })        
        return acc;
    }, []);

    return checklistsId;    
}

// get check-items
const getCheckItems = (checklistsId) => {
    let promises = checklistsId.map(id => fetchCheckItems(id));
    Promise.all(promises)
    .then(data => {        
        createChecklistItems(data);
    })
}

// init function
const init = () => {
    getAllCards(listId)
    .then(cards => getAllChecklistsIds(cards))
    .then(checklistsId => {        
        getCheckItems(checklistsId);    
    })
}
init();

// fetch check-items
const fetchCheckItems = (checkItemId) => {    
    return fetch(`https://api.trello.com/1/checklists/${checkItemId}/checkItems?key=${key}&token=${token}&fields=all`)
    .then(data => data.json())    
}

const generateList = (item) => {    
    let li = 
    `<li class="list-item">
        <label>
            <input ${item.state === "complete" ? "checked" : ""} type="checkbox"></input>
            <span class="checkbox"></span>
        </label>
        <p class="${item.state === "complete" ? "strike" : ""} list-text"
            data-checklistId="${item.idChecklist}" 
            data-checkitemId="${item.id}" 
            data-state="${item.state}">                                
            ${item.name}                
        </p>
        <div class="hide test">
            <div class="update-input-div">
                <input class="update-input" type="text">
                <button class="update">esc</button>
            </div>            
        </div>
        <i class="cross material-icons">clear</i>
    </li>`;    
    
    $("#checklistItems").append(li);    
    $("#myInput").val("");
}

// generate check-items and render
const createChecklistItems = (result) => {    
    result.flat().map(generateList);    
}

// create checklist-item
const createNewCheckitem = (checkitemName) => {
    return fetch(`https://api.trello.com/1/checklists/5d051daa4005da635665b4e0/checkItems?name=${checkitemName}&pos=top&checked=false&key=${key}&token=${token}`, {
        method: 'post'
    })
    .then((response) => response.json())
    .then(data => generateList(data))
    .catch(error => errorMessage())
}

const errorMessage = (time = 1500) => {
    $("#message").fadeIn().text("Error!!! Check your connection or Try again.")
    setTimeout(function(){
        $("#message").fadeOut()        
    }, time)
}

// update checkbox checklist-item's status
const updateStatus = (checkitemId, checklistId, state) => {    
    return fetch(`https://api.trello.com/1/checklists/${checklistId}?fields=name&cards=all&card_fields=name&key=${key}&token=${token}`)
    .then(data => data.json())    
    .then(data => {               
        let cardId = data.cards[0].id;        
        return fetch(`https://api.trello.com/1/cards/${cardId}/checkItem/${checkitemId}?state=${state}&key=${key}&token=${token}`, {
            method: 'put'
        })
        .then((response) => response.status)
    })    
}

// delete checklist-item
const deleteCheckitem = (checklistId, checkitemId) => {
    return fetch(`https://api.trello.com/1/checklists/${checklistId}/checkItems/${checkitemId}?key=${key}&token=${token}`, {
        method: 'delete',        
    })    
}

// create checklist-item
$('input[type="text"]').on('keypress' , async function(event){
    if(event.which === 13) {
        let checkitemName = $(this).val();                
        try{
            await createNewCheckitem(checkitemName);
        }catch(error){        
            errorMessage();
        }     
    }
})

// update checkbox checklist-item's status
$("#checklistItems").on("change", "input", async function(){
    
    let state = $(this).parent().next()[0].dataset["state"]
    let checklistId =  $(this).parent().next()[0].dataset["checklistid"]
    let checkitemId = $(this).parent().next()[0].dataset["checkitemid"]
    
    state = $(this).is(":checked") ? "complete" : "incomplete";
        
    $($(this).parent().next()[0]).toggleClass("strike");    
    
    
    
    try{
        await updateStatus(checkitemId, checklistId, state);
    }catch(error){
        errorMessage();
        $(this).prop('checked', !$(this).is(":checked"));
        $($(this).parent().next()[0]).toggleClass("strike");
    }     
});

// delete checklist-item
$("#checklistItems").on("click", "i", async function(){        

    let checklistId =  $($(this).parent().children('p'))[0].dataset["checklistid"]
    let checkitemId = $($(this).parent().children('p'))[0].dataset["checkitemid"]    
    
    $($(this).parent()[0]).addClass('hide');

    // delete checkItem
    try{
        await deleteCheckitem(checklistId, checkitemId);        
    }catch(error){
        errorMessage();
        $($(this).parent()[0]).removeClass('hide');
    } 
});






















// edit 


// $("#checklistItems").on("click", "p", function(){
//     let checkitemName = $(this).parent().children('p').html().trim();
    
//     $($(this).parent().children('div')[0]).toggleClass("hide");                    
//     $(this).parent().children('div').children().children('input').attr("value", checkitemName);
//     $('input').focus();
//   });
  
  
  
  
  
//   $('input[type="text"]').on('keypress', function(event){
//       if(event.which === 13) {
//           $("p").text($(this).val());
//         $(".test").addClass("hide");
//       }
//   })
