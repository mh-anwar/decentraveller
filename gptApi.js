import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function gptCompletion(messages) {
	const chatCompletion = await openai.chat.completions.create({
		messages: messages,
		model: 'gpt-4o',
	});
}

export { gptCompletion };
