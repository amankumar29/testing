import React ,{createContext}from 'react'
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

export const WebsocketContext = createContext()

export  function WebsocketProvider({children}) {
  let socket = null
  let engineSocket = null
  const token = Cookies.get('ilAuth');

  if(token){
    socket = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket", "polling", "flashsocket"],
        auth: {
            token: token,
        },
    });

    engineSocket = io(process.env.REACT_APP_NODE_ENGINE_SOCKET_URL, {
        transports: ["websocket", "polling", "flashsocket"],
        auth: {
            token: token,
        },
    });
  }
      
  return (
      <WebsocketContext.Provider value={{ socket, engineSocket }}>
          {children}
      </WebsocketContext.Provider>
  )
}
