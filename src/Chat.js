import React from "react";
import io from "socket.io-client"; // npm i socket.io-client
import MessageList from "./MessageList";

// const socketURL = 'http://3.120.96.16:3000';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { newMessage: "", users: [], color: "black" };
    this.socket = io("http://3.120.96.16:3000");
    this.historyMsg = this.historyMsg.bind(this);
    this.updateNewMsg = this.updateNewMsg.bind(this);
    this.pushNewMsg = this.pushNewMsg.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.timeConverter = this.timeConverter.bind(this);
    this.ctnRef = React.createRef();
  }

  componentDidMount() {
    this.socket.on("messages", this.historyMsg);
    this.socket.on("new_message", this.pushNewMsg);
  }

  // to get the history message
  historyMsg(historyData) {
    console.log("historyMsg: ", historyData);
    this.setState({ users: historyData });
    this.scrollToBottom();
  }

  // to grab the new message from the input value and update to state
  updateNewMsg(e) {
    this.setState({ newMessage: e.target.value });
    console.log("updateNewMsg: ", e.target.value);
  }

  // to push new message to history
  pushNewMsg(message) {
    let copyMessage = [...this.state.users];
    copyMessage.splice(0, 1);

    console.log("newMsg: ", message);
    this.setState({ users: [...copyMessage, message] });
    this.scrollToBottom();
  }

  scrollToBottom() {
    let chatCtn = this.ctnRef.current;
    chatCtn.scrollTop = chatCtn.scrollHeight;
  }

  timeConverter(UNIX_timestamp) {
    let moment =
      new Date(UNIX_timestamp).toLocaleDateString("sv-se") +
      " " +
      new Date(UNIX_timestamp).toLocaleTimeString("sv-se");
    return moment;
  }

  componentWillUnmount() {
    this.socket.off("new_messages");
    this.socket.once("disconnect", () => {
      console.log("Disconnected");
    });
    this.socket.disconnect();
  }

  //send new message
  sendMessage(e) {
    e.preventDefault();
    console.log("newMsg:", this.state.newMessage);
    this.socket.emit(
      "message",
      {
        username: this.props.username,
        content: this.state.newMessage
      },
      response => {
        console.log("Emitted", "response:", response);
        this.pushNewMsg(response.data.newMessage);
      } // callback function to check if its sucessful
    );
    // to reset the input value
    this.setState({ newMessage: "" });
  }

  render() {
    // validation for the word count in the chat message input
    let characters = this.state.newMessage;
    let disabled;
    let warning;
    let numOfCharacters = characters.length;
    if (numOfCharacters > 200) {
      disabled = true;
      warning = (
        <span className="inputWarning">Ooopss! Max 200 characters</span>
      );
    } else if (numOfCharacters === 0) {
      disabled = true;
      warning = <span className="inputWarning">Speak up your mind...</span>;
    } else {
      disabled = false;
      warning = "";
    }

    return (
      <div className="Chat">
        <div className="messageCtn">
          <MessageList
            username={this.props.username}
            users={this.state.users}
            timeConverter={this.timeConverter}
            ctnRef={this.ctnRef}
          />

          <form
            className="sendCtn"
            onSubmit={this.sendMessage}
            disabled={disabled}
          >
            <input
              type="text"
              className="msgInput"
              onChange={this.updateNewMsg}
              value={this.state.newMessage}
            />

            <button className="msg-Btn" disabled={disabled}>
              Send
            </button>
          </form>
          <p className="wordsCount">
            {warning} {numOfCharacters} / 200
          </p>
        </div>
      </div>
    );
  }
}

export default Chat;
