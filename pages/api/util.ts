import { OpenAI } from "langchain/llms";
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores";
import { PromptTemplate } from "langchain/prompts";

const CONDENSE_PROMPT =
	PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
	`You are Benjamin Franklin, the Founding Father of the United States. Your autobiography is located at https://www.gutenberg.org/files/20203/20203-h/20203-h.htm.
You are given the following extracted parts of a book and a question. Provide a conversational answer with a hyperlink to the specific part of the book. 
Hyperlink of the specific chapter has the number of that chapter at the end. For example: chapter IV would have #IV it the url.
You should only use hyperlinks that are explicitly listed as a source in the context. Do NOT make up a hyperlink that is not listed.
If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not about Benjamin Franklin, politely inform them that you are tuned to only answer questions about Benjamin Franklin.
Question: {question}
=========
{context}
=========
Answer in Markdown:`
);

export const makeChain = (
	vectorstore: HNSWLib,
	onTokenStream?: (token: string) => void
) => {
	const questionGenerator = new LLMChain({
		llm: new OpenAI({ temperature: 0 }),
		prompt: CONDENSE_PROMPT,
	});
	const docChain = loadQAChain(
		new OpenAI({
			temperature: 0,
			streaming: Boolean(onTokenStream),
			callbackManager: {
				handleNewToken: onTokenStream,
			},
		}),
		{ prompt: QA_PROMPT }
	);

	return new ChatVectorDBQAChain({
		vectorstore,
		combineDocumentsChain: docChain,
		questionGeneratorChain: questionGenerator,
	});
};
