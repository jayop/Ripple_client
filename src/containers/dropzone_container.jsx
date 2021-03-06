import React, { Component } from 'react'
// import { FormGroup } from 'react-bootstrap'
import axios from 'axios'
import io from 'socket.io-client'
import SocketIOFileUpload from 'socketio-file-upload';
import URL from '../../config/url.js';
import { connect } from 'react-redux';
import { FormGroup } from 'react-bootstrap';
import FileListEntry from './file_list_entry.jsx'

class Dropzone extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this);
    this.handleFlagFromSocket = this.handleFlagFromSocket.bind(this)
    this.handleFileUploaded = this.handleFileUploaded.bind(this)
    this.getFileList = this.getFileList.bind(this)
    this.state = {
        filesToDownload: []
    }
  }
handleClick(file){
  console.log('file handle click invokes biatch ', file)
}

  componentDidMount(){
    this.handleFlagFromSocket()

    let context = this;
    let files = [];
    let currentUser = this.props.currentChatStore.currentUser;
    let currentFriend = this.props.currentChatStore.currentFriend;
    var socket = io.connect(URL.SOCKET_SERVER_URL);
    var uploader = new SocketIOFileUpload(socket);

    this.getFileList()
    let loggedUser = {
      user: currentUser
    }
    axios.post(`${URL.LOCAL_SERVER_URL}/main/getFiles`,loggedUser).then(function(response){
      console.log('this is getFiles response ', response)
      response.data.forEach(function(file){
        files.push(file)
      })
      context.setState({
        filesToDownload: files
      })
    })

    
    uploader.listenOnInput(document.getElementById("siofu_input"));

    uploader.addEventListener("complete", function(event){
      console.log('im sending this yo ',event);
      let fileNfo = {
        from: currentUser,
        to: currentFriend,
        fileName: event.file.name
      }
      axios.post(`${URL.LOCAL_SERVER_URL}/main/privateSendFile`, fileNfo).then(function (response) {
        // axios.post(`/main/privateChatStore`, message).then(function (response) {
          console.log('file record nfo', response)
        context.handleFileUploaded()
        })
    });
  }

  getFileList() {
    let context = this;
    let files = [];
    let loggedUser = {
      user: this.props.currentChatStore.currentUser
    }
    axios.post(`${URL.LOCAL_SERVER_URL}/main/getFiles`, loggedUser).then(function (response) {
      console.log('this is getFiles response ', response)
      response.data.forEach(function (file) {
        files.push(file)
      })
      context.setState({
        filesToDownload: files
      })
    })
  }

  handleFlagFromSocket() {
    this.socket = io(URL.SOCKET_SERVER_URL, { secure: true })
    this.socket.on('fileUploaded', fileUploaded => {
      console.log('fileUploaded got from socket:', fileUploaded)
      if (fileUploaded.requested === this.props.currentChatStore.currentUser) {
        alert('File uploaded by ' + fileUploaded.requestee)
        this.getFileList()
      }
    })
  }

  handleFileUploaded() {
    let fileUploaded = {
      requestee: this.props.currentChatStore.currentUser,
      requested: this.props.currentChatStore.currentFriend
    }
    this.socket.emit('fileUploaded', fileUploaded)
    console.log('fileUploaded emitted thru socket', fileUploaded)
  }

  render() {
    let context = this;
    return (
      <div className="dropzone">
        <h1>DROPZONE</h1>
        <input type="file" id="siofu_input"></input>
        <div>
          My Files: 
          <ul> {context.state.filesToDownload.map(function(file, i){
         
            return <FileListEntry file={file} key = {i} id = {i} onClick={context.handleClick}/> 
          })} 
          </ul>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentChatStore: state.currentChatStore
  }
}

export default connect(mapStateToProps)(Dropzone);