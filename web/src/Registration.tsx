import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import useMessagesStore from "./store";
import type { DbConnection } from "./module_bindings";

interface Inputs {
  username: string;
}

export default function Registration(props: { conn: DbConnection }) {
  const { conn } = props;
  const { username } = useMessagesStore();
  const [settingName, setSettingName] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    conn.reducers.setName(data.username);
  };

  return <div className="flex flex-col gap-2">
    <h2 className="text-2xl">Registry</h2>
      {!settingName ? (
          <>
            <p>{username}</p>
            <button
              className="gbm-Button"
              onClick={() => {
                setSettingName(true);
                setValue("username", username);
              }}
            >
              Edit Name
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input className="gbm-Input" {...register("username", {required: true})}></input>
            <input className="gbm-Button" type="submit" />
          </form>
        )}
  </div>;
}