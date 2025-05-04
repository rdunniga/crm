const AI_API_URL = "https://jsonplaceholder.typicode.com";

export default async function getAiResponse(request) {
  const res = await fetch(`${AI_API_URL}/posts`);

  if (!res.ok) throw Error("Failed getting AI reponse");

  const data = await res.json();
  const index = 1 + Math.random() * (data.length - 1);
  //console.log('random', index);
  return data[Math.floor(index)].body;
}
