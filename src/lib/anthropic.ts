export async function callAnthropic(messages: { role: string, content: string }[], system?: string, response_format?: any) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, '');
  const model = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6').trim().replace(/^["']|["']$/g, '');
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is missing');
  }

  console.log(`Using Anthropic model: ${model}`);


  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4096,
      system: system,
      messages: messages,
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  if (response_format?.type === 'json_object') {
    try {
      // Claude might wrap JSON in markdown blocks, we need to extract it
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString);
    } catch (err) {
      console.error('Failed to parse Anthropic JSON:', content);
      throw new Error('AI returned an invalid JSON format. Please try again.');
    }
  }

  return content;
}
