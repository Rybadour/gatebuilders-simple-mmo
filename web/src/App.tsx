import { useForm, type SubmitHandler } from 'react-hook-form';
import { sendMessage } from './sockets/socket';
import { useEffect, useState } from 'react';
import Registration from './Registration';
import { DbConnection, type ErrorContext, Message, User } from './module_bindings';
import { Identity } from '@clockworklabs/spacetimedb-sdk';
import { useMessages, useUsers } from './hooks';

interface Inputs {
  username: string;
  message: string;
}

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [conn, setConn] = useState<DbConnection | null>(null);

  useEffect(() => {
    const subscribeToQueries = (conn: DbConnection, queries: string[]) => {
      conn
        ?.subscriptionBuilder()
        .onApplied(() => {
          console.log('SDK client cache initialized.');
        })
        .subscribe(queries);
    };

    const onConnect = (
      conn: DbConnection,
      identity: Identity,
      token: string
    ) => {
      setIdentity(identity);
      setConnected(true);
      localStorage.setItem('auth_token', token);
      console.log(
        'Connected to SpacetimeDB with identity:',
        identity.toHexString()
      );
      conn.reducers.onSendMessage(() => {
        console.log('Message sent.');
      });

      subscribeToQueries(conn, ['SELECT * FROM message', 'SELECT * FROM user']);
    };

    const onDisconnect = () => {
      console.log('Disconnected from SpacetimeDB');
      setConnected(false);
    };

    const onConnectError = (_ctx: ErrorContext, err: Error) => {
      console.log('Error connecting to SpacetimeDB:', err);
    };

    setConn(
      DbConnection.builder()
        .withUri('ws://localhost:3000')
        .withModuleName('gatebuilders-simple-mmo')
        .withToken(localStorage.getItem('auth_token') || '')
        .onConnect(onConnect)
        .onDisconnect(onDisconnect)
        .onConnectError(onConnectError)
        .build()
    );
  }, []);

  const users = useUsers(conn);
  const messages = useMessages(conn);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  if (!conn || !connected || !identity) {
    return (
      <div className="App">
        <h1>Connecting...</h1>
      </div>
    );
  }

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    conn.reducers.sendMessage(data.message);
  };

  const prettyMessages = messages
    .sort((a, b) => (a.sent > b.sent ? 1 : -1))
    .map(message => ({
      senderName:
        users.get(message.sender.toHexString())?.name ||
        message.sender.toHexString().substring(0, 8),
      text: message.text,
      timestamp: message.sent.microsSinceUnixEpoch,
    }));

  const name =
    users.get(identity?.toHexString())?.name ||
    identity?.toHexString().substring(0, 8) ||
    'unknown';

  return (
    <div className="flex flex-col gap-6 items-center m-4">
      <h1 className="text-4xl">Spacetime Test! (Logged in as: {name} )</h1>

      <Registration conn={conn} />

      <div className="border-2 rounded-xl p-4 m-12">
        {prettyMessages.map((message) => {
          return <div key={message.timestamp} className="flex gap-2">
            <strong>{message.senderName}:</strong>
            <span>{message.text}</span>
          </div>;
  })}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl">Send Message</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input className="gbm-Input" {...register("message", {required: true})}></input>
          <input className="gbm-Button" type="submit" />
        </form>
      </div>
    </div>
  )
}

export default App
