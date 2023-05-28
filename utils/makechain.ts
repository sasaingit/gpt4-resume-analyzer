import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

const CONDENSE_PROMPT = `Upon reviewing the provided request, could you please identify the essential characteristics of an ideal candidate for this position? 
Kindly outline each characteristic and separate each by a comma. If available in the request, include the location and price range at the end of your evaluation.
If the question  does not have any request for a talent simply say 'invalid'.

Request:
{question}
`;

const QA_PROMPT = `You are a helpful AI assistant.
Recommend a talent for the given characteristic.
Also provide the reason for your recommendation.
Output should follow the given format and add line breaks with markdown.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.


Input
List of talent information:
{context}
Required characteristics:
{question}

Output
Talent Name:
Description:
Location:
Available for:
Specialist Topics:
Interests:
Price Per Hour:
Reasons for recommendation:

`;

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
