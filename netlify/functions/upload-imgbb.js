export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64, fileName } = JSON.parse(event.body || "{}");
    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Imagem não enviada" }),
      };
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "IMGBB_API_KEY ausente no servidor" }),
      };
    }

    console.log("🔑 Chave detectada:", apiKey.substring(0, 5) + "..."); 


    const uploadURL = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;


    const formData = new URLSearchParams();
    formData.append("image", imageBase64);
    if (fileName) formData.append("name", fileName);

    const response = await fetch(uploadURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log("🧾 Resposta ImgBB:", data);

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Erro interno:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
