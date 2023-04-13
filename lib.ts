const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

type GPTOption = {
  temperature: number;
  max_tokens: number;
};

type Role = "system" | "user" | "assistant";

type Message = {
  role: Role;
  content: string;
};

type MessageOpt = {
  role?: Role;
  content: string;
};

export class Conversation {
  static history: Message[][] = [];

  messages: Message[] = [];

  constructor(
    public option: Partial<GPTOption> = {},
  ) {
  }

  async send(message: MessageOpt, option: Partial<GPTOption> = {}) {
    this.messages = [
      ...this.messages,
      {
        role: message.role ?? "user",
        content: message.content,
      },
    ];

    const request: APIRequest = {
      model: "gpt-3.5-turbo",
      messages: this.messages,
      n: 1,
      ...this.option,
      ...option,
    };
    const res = await callAPI(request);

    if (res.choices.length === 0) {
      console.error(res);
      throw new Error("No reply");
    }

    const { message: reply, finish_reason } = res.choices[0];
    if (finish_reason !== "stop") {
      console.warn("The reply is not complete:", finish_reason);
    }

    this.messages = [
      ...this.messages,
      reply,
    ];

    Conversation.history.push(this.messages);

    console.log(reply.content);
  }
}

type APIRequest = {
  model: string;
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  n: number;
  temperature?: number;
  max_tokens?: number;
};

type APIResponse = {
  id: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: "user" | "assistant" | "system";
      content: string;
    };
    finish_reason: "stop" | "length" | "content_filter";
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const callAPI = async (request: APIRequest): Promise<APIResponse> => {
  const res = await fetch(
    API_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(request),
    },
  );

  return await res.json();
};
