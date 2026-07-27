import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const buildPrompt = ({ title, description, categoryName, budgetMin, budgetMax }) => `
Sos un asistente que ayuda a estimar precios de trabajos informales en
Guatemala (plomería, albañilería, electricidad, etc.) para la plataforma
WorkDispatch.

Trabajo: "${title}"
Categoría: ${categoryName || 'sin especificar'}
Descripción: "${description}"
${budgetMin || budgetMax ? `Presupuesto de referencia del cliente: Q${budgetMin || 0} - Q${budgetMax || 0}` : ''}

Respondé SOLO con un JSON, sin texto adicional ni backticks, con esta forma:
{
  "budgetMin": <número, quetzales>,
  "budgetMax": <número, quetzales>,
  "estimatedTime": "<texto corto, ej. '2 a 3 días'>",
  "suggestedMessage": "<mensaje corto en primera persona ofreciendo el trabajo, SIN mencionar montos ni cifras de dinero — el precio ya se muestra por separado>"
}
`.trim();

export const getEstimate = async (req, res) => {
    try {
        const { title, description, categoryName, budgetMin, budgetMax } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'title y description son obligatorios para el estimado'
            });
        }

        const groqResponse = await axios.post(
            GROQ_URL,
            {
                model: GROQ_MODEL,
                messages: [{ role: 'user', content: buildPrompt({ title, description, categoryName, budgetMin, budgetMax }) }],
                response_format: { type: 'json_object' },
                temperature: 0.4,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                timeout: 15000,
            }
        );

        const rawText = groqResponse.data?.choices?.[0]?.message?.content || '';
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        res.status(200).json({ success: true, data: parsed });
    } catch (error) {
        console.error('Error en /ai/estimate:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'No se pudo generar el estimado con IA',
            error: error.response?.data?.error?.message || error.message
        });
    }
};
