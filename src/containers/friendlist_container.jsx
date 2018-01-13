import React, { Component } from 'react'
import { FormGroup } from 'react-bootstrap'
import axios from 'axios'
import { bindActionCreators } from 'redux';
import {connect} from  'react-redux'
import URL from '../../config/url.js'
import FriendlistEntry from './friendlist_entry.jsx'
import { setPrivateChat } from '../actions/setPrivateChat.jsx';
import { setCurrentChatView } from '../actions/setCurrentChatView.jsx';
import { setCurrentFriends } from '../actions/setCurrentFriends.jsx';
import Functions from '../functions/functions.js';
import io from 'socket.io-client'

class Friendlist extends Component {
  constructor(props) {
    super(props)
    this.handleFindFriend = this.handleFindFriend.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      friendsArr: []
    }
  }

  componentDidMount(){
    var context = this;
    var friends = this.state.friendsArr.slice()
    //retrieve friends for current user
    var currentUser = this.props.currentUserStore
    // console.log('currentUser', this.props.currentUserStore)
    let userRef = {
      user: this.props.currentUserStore
    }
    // console.log('currentUser', currentUser)
    // axios.post(`/main/getFriends`, userRef).then(function (response) {
    axios.post(`${URL.LOCAL_SERVER_URL}/main/getFriends`,userRef)
    .then(function(response){
      // console.log('this is getFriends response', response)
      response.data.forEach(function(friend){
        friends.push(friend)
      })
      context.setState({
        friendsArr: friends
      })
      context.setCurrentFriends({
        currentUser: this.currentUserStore.username,
        currentFriends: friends
      })
    })
    .catch(function(err){
      console.log('error in POST request to url /getFriends', err)
    })
    this.socket = io(URL.SOCKET_SERVER_URL, { secure: true })
  }

  async handleFindFriend() {
    // console.log(document.getElementById('friendSearchBar').value);
    let newFriend = document.getElementById('friendSearchBar').value;
    let currentUser = this.props.currentUserStore;
    // console.log(' this is the current logged user ', currentUser)

    if (newFriend === currentUser.username) {
      alert('cannot add friend myself')
    } else {

      let friendRequest = {
        requestee: currentUser,
        requested: newFriend
      }
      let userRef = {
        user: this.props.currentUserStore
      }
      let context = this;
      let findFriendResponse = await axios.post(`${URL.LOCAL_SERVER_URL}/main/findFriend`, friendRequest)
      // console.log('add friend findFriendResponse', findFriendResponse)
      if (findFriendResponse.data.error) {
        alert(findFriendResponse.data.alert)
      } else {
        //send friend request
        let requestResponse = await axios.post(`${URL.LOCAL_SERVER_URL}/main/requestFriend`, friendRequest)
        console.log('add friend requestResponse', requestResponse)
        let socketFriendRequest = {
          requestee: currentUser.username,
          requested: newFriend
        }
        this.socket.emit('request', socketFriendRequest)

        alert('friend request sent ')
      }
    }
  }

  handleClick(friend){
    var context = this
    const privateChat = async () => {
      await context.props.setCurrentChatView({
        chatview: 1
      })

      const responseGetRoomID = await axios.post(`${URL.LOCAL_SERVER_URL}/main/getDirectRoomID`, {
        username: context.props.currentUserStore.username,
        friendname: friend
      })
      let directRoomId = responseGetRoomID.data.room_id
      
      let response = await axios.post(`${URL.LOCAL_SERVER_URL}/main/getPrivateChatHistory`, {
        directRoomId: directRoomId
      })

      console.log('this is getPrivateChatHistory response.data', response.data)
      var messageAry = []
      if (response.data.length !== 0) {
        messageAry = Functions.messageObjToArray(response.data.messageObj)
      }
      await context.props.setPrivateChat({
        currentUser: context.props.currentUserStore.username,
        currentFriend: friend,
        directRoomId: directRoomId,
        messages: messageAry
      })

      console.log('this.props.currentChatStore.messages', this.props.currentChatStore.messages)
    }
    privateChat()

  }

  render() {
    var context = this;
    return (
      <div className="friendlist" id="friendsComponent">
        <h2 id="spaceit">Friends</h2>
        <input id="friendSearchBar"></input>
        <button id="findFriendButton" onClick={this.handleFindFriend}>add</button>
        <div id="friendslist2">
          <span id="common">My Friends: </span>
          <ul> {context.props.currentFriendsStore.currentFriends.map(function(friend, i){
            return <FriendlistEntry friend={friend} key = {i} id = {i} onClick={context.handleClick}/> 
          })} 
          </ul>
        </div>
        {/* {<div>current chat view: {context.props.currentChatView.chatview}</div>} */}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUserStore: state.currentUserStore,
    currentChatStore: state.currentChatStore,
    currentChatView: state.currentChatView,
    currentFriendsStore: state.currentFriendsStore
  }
}

function matchDispatchToProps(dispatch) {
  // call selectUser in index.js
  return bindActionCreators(
    { setPrivateChat: setPrivateChat,
      setCurrentChatView: setCurrentChatView,
      setCurrentFriends: setCurrentFriends }, dispatch)
}

export default connect(mapStateToProps, matchDispatchToProps)(Friendlist);