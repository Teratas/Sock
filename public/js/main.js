import store from "./store.js"
import ui from './ui.js'
import socketHandler from "./socketHandler.js"


const nameInput = document.querySelector('.introduction_page_name_input')
nameInput.addEventListener('keyup', (event) => {
    store.setUsername(event.target.value)
})

const roomSelect = document.getElementById('room_select')
roomSelect.addEventListener('change', (e) => {
    // console.log('room changed')
    // console.log(e.target.value)
    store.setRoomId(e.target.value)
})
const chatPageButton = document.getElementById('enter_chats_button')

chatPageButton.addEventListener('click', () => {
    ui.goToChatPage();
    socketHandler.connectToSocketIoServer()
})