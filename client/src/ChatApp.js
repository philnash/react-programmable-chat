import React, { Component } from 'react';
import NameBox from './NameBox.js';
import Chat from 'twilio-chat';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';

class ChatApp extends Component {
  constructor(props) {
    super(props);
    const name = localStorage.getItem('name') || '';
    const loggedIn = name !== '';
    this.state = {
      name,
      loggedIn,
      token: '',
      chatReady: false,
      messages: [],
      newMessage: ''
    };
    this.membersTyping = new Set();
    this.channelName = 'general';
  }

  startTyping = event => {
    this.channel.typing();
  };

  componentDidMount = () => {
    if (this.state.loggedIn) {
      this.getToken();
    }
    this.input = document.querySelector('.k-input');
    this.input.addEventListener('keydown', this.startTyping);
  };

  componentWillUnmount = () => {};

  onNameChanged = event => {
    this.setState({ name: event.target.value });
  };

  logIn = event => {
    event.preventDefault();
    if (this.state.name !== '') {
      localStorage.setItem('name', this.state.name);
      this.setState({ loggedIn: true }, this.getToken);
    }
  };

  logOut = event => {
    event.preventDefault();
    this.setState({
      name: '',
      loggedIn: false,
      token: '',
      chatReady: false,
      messages: [],
      newMessage: ''
    });
    localStorage.removeItem('name');
    this.chatClient.shutdown();
    this.channel = null;
  };

  getToken = () => {
    fetch(`/token/${this.state.name}`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        this.setState({ token: data.token }, this.initChat);
      });
  };

  async initChat() {
    this.chatClient = await Chat.create(this.state.token);
    this.chatClient.initialize().then(this.clientInitiated.bind(this));
  }

  clientInitiated = () => {
    this.setState({ chatReady: true }, () => {
      this.chatClient
        .getChannelByUniqueName(this.channelName)
        .then(channel => {
          if (channel) {
            return (this.channel = channel);
          }
        })
        .catch(err => {
          if (err.body.code === 50300) {
            return this.chatClient.createChannel({
              uniqueName: this.channelName
            });
          }
        })
        .then(channel => {
          this.channel = channel;
          window.channel = channel;
          return this.channel.join().catch(() => {
            return;
          });
        })
        .then(() => {
          this.channel.getMessages().then(this.messagesLoaded);
          this.channel.on('messageAdded', this.messageAdded);
          this.channel.on('typingStarted', this.typingStarted);
          this.channel.on('typingEnded', this.typingEnded);
        });
    });
  };

  typingStarted = member => {
    this.membersTyping.add(member.identity);
    const author = {
      id: Array.from(this.membersTyping).join(', '),
      name: Array.from(this.membersTyping).join(', ')
    };
    const typingMessage = {
      author: author,
      typing: true
    };
    this.setState(prevState => ({
      messages: [
        ...this.removeLastTypingMessage(prevState.messages),
        typingMessage
      ]
    }));
  };

  removeLastTypingMessage(messages) {
    if (messages[messages.length - 1].typing) {
      return messages.slice(0, messages.length - 1);
    }
    return messages;
  }

  typingEnded = member => {
    console.log('typingEnded');
    this.membersTyping.delete(member.identity);
    this.setState(prevState => {
      if (this.membersTyping.size === 0) {
        return { messages: this.removeLastTypingMessage(prevState.messages) };
      } else {
        const author = {
          id: Array.from(this.membersTyping).join(', '),
          name: Array.from(this.membersTyping).join(', ')
        };
        const typingMessage = {
          author: author,
          typing: true
        };
        return {
          messages: [
            ...this.removeLastTypingMessage(prevState.messages),
            typingMessage
          ]
        };
      }
    });
  };

  mapMessagePagetoMessages(messagePage) {
    return messagePage.items.map(message => ({
      text: message.body,
      timestamp: message.timestamp,
      author: {
        id: message.author,
        name: message.author
      }
    }));
  }

  messagesLoaded = messagePage => {
    this.lastMessageIndex = messagePage.items[0].index - 1;
    const messages = this.mapMessagePagetoMessages(messagePage);
    // const botMessage = {
    //   text: 'This is a bot',
    //   author: {
    //     id: 'bot'
    //   },
    //   suggestedActions: [
    //     {
    //       value: 'A sample reply',
    //       type: 'reply'
    //     },
    //     {
    //       title: 'A sample link',
    //       value: '#link',
    //       type: 'openUrl'
    //     },
    //     {
    //       title: 'Place a call',
    //       value: '555-123-456',
    //       type: 'call'
    //     },
    //     {
    //       title: 'A custom action',
    //       value: 'Custom action clicked',
    //       type: 'alert'
    //     }
    //   ]
    // };
    this.setState({ messages }, () => {
      this.topMessage = document.querySelector('.k-message-list-content > div');
      this.chatWindow = document.querySelector('.k-message-list');
      this.intersectionObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && this.lastMessageIndex > 0) {
              this.channel
                .getMessages(30, this.lastMessageIndex)
                .then(messagePage => {
                  this.lastMessageIndex = messagePage.items[0].index - 1;
                  const messages = this.mapMessagePagetoMessages(messagePage);
                  this.setState(prevState => ({
                    messages: [...messages, ...prevState.messages]
                  }));
                });
            }
          });
        },
        {
          root: this.chatWindow
        }
      );
      setTimeout(() => {
        this.intersectionObserver.observe(this.topMessage);
      }, 1000);
    });
  };

  messageAdded = message => {
    const newMessage = {
      text: message.body,
      author: { id: message.author, name: message.author },
      timestamp: message.timestamp
    };

    this.setState(prevState => {
      return {
        messages: [...prevState.messages, newMessage]
      };
    });
  };

  sendMessage = event => {
    const message = event.message;
    this.channel.sendMessage(message.text);
  };

  newMessageAdded = li => {
    if (li) {
      li.scrollIntoView();
    }
  };

  onActionExecute = event => {
    alert(event.action.type);
  };

  onAction = event => {
    console.log(event);
  };

  render() {
    var loginOrChat;
    if (this.state.loggedIn) {
      const user = { id: this.state.name, name: this.state.name };
      loginOrChat = (
        <div>
          <p>Logged in as {this.state.name}</p>
          <ChatUI
            user={user}
            messages={this.state.messages}
            onMessageSend={this.sendMessage}
            onActionExecute={this.onActionExecute}
          />
        </div>
      );
    } else {
      loginOrChat = (
        <div>
          <NameBox
            name={this.state.name}
            onNameChanged={this.onNameChanged}
            logIn={this.logIn}
          />
        </div>
      );
    }
    return <div>{loginOrChat}</div>;
  }
}

export default ChatApp;
