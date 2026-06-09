import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      company_name, 
      risk_score, 
      sentiment, 
      buying_intent, 
      objections, 
      recommendation 
    } = await req.json()

    // Use the existing OPENROUTER_API_KEY from Supabase environment secrets
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables')
    }

    const promptText = `You are a top-performing B2B SaaS Account Executive.
Write a professional, concise, and empathetic follow-up email to the prospect at ${company_name || 'the company'}.

Context of the deal:
- Risk Score: ${risk_score || 'Unknown'}%
- Sentiment: ${sentiment || 'Neutral'}
- Buying Intent: ${buying_intent || 'Medium'}
- Objections/Risks: ${(objections || []).join(', ') || 'None specifically noted'}
- Recommended Action: ${recommendation || 'Follow up to schedule a meeting.'}

Rules:
1. Return EXACTLY a JSON object with two keys: "subject" and "email".
2. "subject" should contain a professional, catchy subject line.
3. "email" should contain the professional body of the email.
4. Keep the tone human and empathetic. Do not sound like a robot.
5. Address specific objections naturally.
6. Do NOT wrap the JSON in markdown code blocks. Just return raw JSON.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://salessaathi.com", // Adjust as necessary
        "X-Title": "Sales Saathi"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // fast default model
        messages: [
          { role: "system", content: "You are an elite sales professional writing outbound emails. Always output strictly raw JSON matching the requested schema." },
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status}`, errorText);
      throw new Error(`Failed to generate email from OpenRouter.`)
    }

    const data = await response.json()
    const rawContent = data.choices[0].message.content.trim()
    
    // Parse the JSON safely
    let parsedContent;
    try {
        parsedContent = JSON.parse(rawContent);
    } catch (parseError) {
        // Fallback parsing if LLM failed to return pure JSON
        const subjectMatch = rawContent.match(/"subject":\s*"([^"]+)"/i);
        const emailMatch = rawContent.match(/"email":\s*"([^]+)"/i);
        
        parsedContent = {
            subject: subjectMatch ? subjectMatch[1] : "Follow up regarding our recent discussion",
            email: emailMatch ? emailMatch[1].replace(/\\n/g, '\n') : rawContent
        };
    }

    return new Response(
      JSON.stringify({ 
        subject: parsedContent.subject || "Follow up regarding our recent discussion",
        email: parsedContent.email || parsedContent.body || parsedContent.content || rawContent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
