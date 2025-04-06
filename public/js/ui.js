import store from "./store.js"
import element from './element.js'
import socketHandler from "./socketHandler.js"
const goToChatPage = () => {
    const introductionPage = document.querySelector('.introduction_page')
    const chatPage = document.querySelector('.chat_page')


    introductionPage.classList.add('display_none')

    chatPage.classList.remove('display_none')
    chatPage.classList.add('display_flex')
    
    const username = store.getUsername()
    updateUsername(username)

    createGroupChatbox()
    createRoomChatbox()
}

const chatboxId = 'group-chat-chatbox'
const chatboxMessagesId = 'group-chat-messages'
const chatboxInputId = 'group-chat-input'

const updateUsername = (username) => {
    const usernameLabel = document.querySelector('.username_label')
    usernameLabel.innerHTML = username
}

const createGroupChatbox = () => {
    const data = {
        chatboxLabel: 'Group Chat',
        chatboxId,
        chatboxMessagesId,
        chatboxInputId
    }

    const chatbox = element.getChatbox(data)

    const chatboxesContainer = document.querySelector('.chatboxes_container')
    chatboxesContainer.appendChild(chatbox)

    const newMessageInput = document.getElementById(chatboxInputId)
    newMessageInput.addEventListener('keydown', (e) => {
        const key = e.key

        if(key === 'Enter'){
            const author = store.getUsername()
            const messageContent = e.target.value
            socketHandler.sendGroupChatMessage(author, messageContent)
            //send message to socketio
            newMessageInput.value = ''
            
        }
    })
}

const appendGroupChatMessage = (data) => {
    const groupChatboxMessagesContainer = document.getElementById(chatboxMessagesId)
    const chatMessage = element.getGroupChatMessage(data)
    groupChatboxMessagesContainer.appendChild(chatMessage)

}

const updateActiveChatboxes = (data) => {
    //update active chat boxes
    const { connectedPeers } = data;
    const userSocketId = store.getSocketId()
    console.log(connectedPeers)
    connectedPeers.forEach(peer => {

        const activeChatboxes = store.getActiveChatboxes()
        const activeChatbox = activeChatboxes.find(chatbox => peer.socketId === chatbox.socketId)
        if(!activeChatbox && peer.socketId !== userSocketId){
            createNewUserChatbox(peer)    
        }

        
    })

}

const createNewUserChatbox = (peer) => {
    const chatboxId = peer.socketId
    const chatboxMessagesId = `${peer.socketId}-messages`
    const chatboxInputId = `${peer.socketId}-input`
    const data = {
        chatboxId,
        chatboxMessagesId,
        chatboxInputId,
        chatboxLabel : peer.username,
    }

    const chatbox = element.getChatbox(data)

    //append new chat box

    const chatboxContainer = document.querySelector('.chatboxes_container')
    chatboxContainer.appendChild(chatbox)

    //register event listener for chatbox input to send a message to other user

    const newMessageInput = document.getElementById(chatboxInputId)
    newMessageInput.addEventListener('keydown', e => {
        const key = e.key
        if(key == 'Enter'){
            const author = store.getUsername()
            const messageContent = e.target.value

            const receiverSocketId = peer.socketId
            const authorSocketId = store.getSocketId()

            const data = {
                author,
                messageContent,
                receiverSocketId,
                authorSocketId
            }

            socketHandler.sendDirectMessage(data)
            newMessageInput.value= ""
        }

    })

    //push to active chatbox new user box
    const activeChatboxes = store.getActiveChatboxes()
    const newActiveChatboxes = [...activeChatboxes, peer]
    store.setActiveChatboxes(newActiveChatboxes)
}

const appendDirectChatMessage = (messageData) => {
    const { authorSocketId, author, messageContent, isAuthor, receiverSocketId } = messageData
    const messageContainer =isAuthor ? document.getElementById(`${receiverSocketId}-messages`) : document.getElementById(`${authorSocketId}-messages`)
    
    if(messageContainer) {
        const data = {
            author,
            messageContent,
            alignRight: isAuthor ? true : false,
        }

        const message = element.getDirectChatMessage(data)

        messageContainer.appendChild(message)
    }
}

const removeChatboxOfDisconnectedPeer = (data) => {
    const { socketIdOfDisconnectedPeer } = data

    //remove actuve caht box from our store

    const activeChatboxes = store.getActiveChatboxes()
    const newActiveChatboxes = activeChatboxes.filter(chatbox => chatbox.socketId !== socketIdOfDisconnectedPeer)

    store.setActiveChatboxes(newActiveChatboxes)

    //remove from HTML
    const chatbox = document.getElementById(socketIdOfDisconnectedPeer)

    if(chatbox){
        chatbox.parentElement.removeChild(chatbox)
    }
}

const createRoomChatbox = () => {
    const roomId = store.getRoomId()

    const chatboxLabel = roomId;
    const chatboxId = roomId;
    const chatboxMessagesId = `${roomId}-messages`
    const chatboxInputId = `${roomId}-input`

    const data ={
        chatboxLabel,
        chatboxId,
        chatboxInputId,
        chatboxMessagesId
    }

    const chatbox = element.getChatbox(data)

    const chatboxesContainer = document.querySelector('.chatboxes_container')

    chatboxesContainer.appendChild(chatbox)


    //adding event listener to send room chat messages
    const newMessageInput = document.getElementById(chatboxInputId)
    newMessageInput.addEventListener('keydown', e => {
        const key = e.key
        if(key == 'Enter'){
            const author = store.getUsername()
            const messageContent = e.target.value

            const authorSocketId = store.getSocketId()

            const data = {
                author,
                messageContent,
                authorSocketId,
                roomId
            }

            socketHandler.sendRoomMessage(data)
            newMessageInput.value= ""
        }})
}

const appendRoomChatMessage = (data) => {
    const {roomId} = data;

    const chatboxMessagesId = `${roomId}-messages`
    const roomChatboxMessagesContainer = document.getElementById(chatboxMessagesId)

    const chatMessage = element.getGroupChatMessage(data)

    roomChatboxMessagesContainer.appendChild(chatMessage)
}

export default {
    goToChatPage,
    appendGroupChatMessage,
    updateActiveChatboxes,
    appendDirectChatMessage,
    removeChatboxOfDisconnectedPeer,
    appendRoomChatMessage
}