import { co, z } from "jazz-tools";

const Message = co.map({
  text: z.string(),
});

const Chat = co.list(Message);




function createMessage(content: string){
    const message = Message.create({
        text: content
      });
}