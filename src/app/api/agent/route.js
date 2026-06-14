export async function POST(req) {
  try {
    const { history, currentPot } = await req.json();
    
    // In a real hackathon project, you would call OpenAI / Anthropic here.
    // For this demonstration, we'll return a mocked "smart" response based on inputs.
    
    let advice = "Your savings history looks steady. Keep it up!";
    if (currentPot > 100) {
      advice = "You have a significant pot size! Consider moving a portion into our ChamaMiner to generate yield on Moola Market while you wait for the cycle to end.";
    } else if (history && history.missed > 0) {
      advice = "I noticed you missed a recent payment. To maintain your Trust Score, I recommend setting up an automatic cUSD deposit for the next round.";
    } else {
      advice = "You're a highly reliable saver! Your Trust Score is growing. You qualify to start a new High-Tier circle with up to 500 cUSD weekly limits.";
    }

    return new Response(JSON.stringify({ 
      agent: "Chama AI Advisor",
      advice,
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to process AI request" }), { status: 500 });
  }
}
