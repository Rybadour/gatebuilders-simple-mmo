import { create } from 'zustand'

interface IMessagesStore {
  username: string;
  messages: IMessage[];

  receiveMessage: (message: IMessage) => void,
}

interface IMessage {
  timestamp: Date;
  author: string;
  text: string;
}

const useMessagesStore = create<IMessagesStore>((set, get) => ({
  username: 'Salbris',
  messages: [],

  receiveMessage: (message: IMessage) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),
}));

export default useMessagesStore;