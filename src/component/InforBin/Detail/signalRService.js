import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';

let connection = null;
let receiveCallbacks = [];
let tagCallbacks = [];

export const initializeSignalR = (token, url) => {
  if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${url}/NotificationHub`, {
        accessTokenFactory: () => token,
        logger: signalR.LogLevel.Information,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 5) {
            return 2000;
          }
          toast.error('Failed to reconnect to server after multiple attempts.');
          return null;
        },
      })
      .build();

    connection.on('ReceiveForAdmin', (data) => {
      receiveCallbacks.forEach((callback) => callback(data));
    });

    connection.on('TagForAdmin', (data) => {
      tagCallbacks.forEach((callback) => callback(data));
    });

    connection.onreconnecting((error) => {
      console.warn('Reconnecting...', error);
      toast.warn('Lost connection to server. Reconnecting...');
    });

    connection.onclose((error) => {
      console.error('Connection closed:', error);
      toast.error('Connection to server lost.');
    });

    connection
      .start()
      .then(() => {
        toast.success('Connected to NotificationHub successfully!');
        connection.invoke('GetBufferForAdmin').catch((error) => {
          console.error('Error invoking GetBufferForAdmin:', error);
        });
      })
      .catch((err) => {
        console.error('Error while connecting to SignalR:', err);
        toast.error('Failed to connect to server. Retrying...');
      });
  }
  return connection;
};

export const registerReceiveCallback = (callback) => {
  receiveCallbacks.push(callback);
  return () => {
    receiveCallbacks = receiveCallbacks.filter((cb) => cb !== callback);
  };
};

export const registerTagCallback = (callback) => {
  tagCallbacks.push(callback);
  return () => {
    tagCallbacks = tagCallbacks.filter((cb) => cb !== callback);
  };
};

export const getSignalRConnection = () => connection;

export const stopSignalRConnection = () => {
  if (connection) {
    connection.stop().then(() => console.log('SignalR connection stopped'));
    connection = null;
    receiveCallbacks = [];
    tagCallbacks = [];
  }
};