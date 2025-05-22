import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import useMessagesStore from './store'
import { sendMessage } from './sockets/socket';

interface Inputs {
  username: string;
  message: string;
}

function App() {
  const { username, messages } = useMessagesStore();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    
    sendMessage(data.username, data.message);
  };

  return (
    <div className="flex flex-col gap-12">
      <h1>Vite + React</h1>

      <div className="border-2 rounded-xl p-4 m-12">
        {messages.map((message) => {
          return <div key={message.timestamp.getTime()} className="flex gap-2">
            <strong>{message.author}:</strong>
            <span>{message.text}</span>
          </div>;
  })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          render={({ field }) => (
            <input {...field} />
          )}
          control={control}
          name="username"
          defaultValue={username}
        />
        <input {...register("message", {required: true})}></input>
        <input type="submit" />
      </form>
    </div>
  )
}

export default App
