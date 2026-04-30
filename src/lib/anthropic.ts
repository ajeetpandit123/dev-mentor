import Anthropic from '@anthropic-ai/sdk';

export async function callAnthropic(
  messages: { role: string; content: string }[],
  system?: string,
  modelOverride?: string,
  response_format?: any,
  triedModels: string[] = []
) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
  const defaultModel = (process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022').trim().replace(/^["']|["']$/g, '');
  const model = modelOverride || defaultModel;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is missing');
  }

  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  console.log(`[Anthropic SDK] Using model: ${model}`);

  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      system: system,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = (response.content[0] as any).text;

    if (response_format?.type === 'json_object') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        return JSON.parse(jsonString);
      } catch (err) {
        console.error('Failed to parse Anthropic JSON:', content);
        throw new Error('AI returned an invalid JSON format. Please try again.');
      }
    }

    return content;
  } catch (error: any) {
    // Check for 404 (Model Not Found)
    if (error.status === 404 || (error.error && error.error.type === 'not_found_error')) {
      const fallbacks = [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620',
        'claude-3-opus-20240229',
        'claude-3-haiku-20240307',
      ];

      const nextFallback = fallbacks.find(f => f !== model && !triedModels.includes(f));
      
      if (nextFallback) {
        console.warn(`[Anthropic SDK] Model ${model} not found. Trying fallback: ${nextFallback}`);
        return callAnthropic(messages, system, nextFallback, response_format, [...triedModels, model]);
      }
    }

    console.error('Anthropic SDK Error:', error);
    throw new Error(`Anthropic API Error: ${error.message || JSON.stringify(error)}`);
  }
}
