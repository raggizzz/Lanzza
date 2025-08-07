import { streamText } from '~/lib/.server/llm/stream-text';
import { getApiKeysFromCookie, parseCookies } from '~/lib/api/cookies';
import { MAX_TOKENS } from '~/lib/.server/llm/constants';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, PROVIDER_LIST } from '~/utils/constants';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  const { businessData, analysisType } = await request.json<{
    businessData: any;
    analysisType: 'market' | 'viability' | 'risks' | 'opportunities' | 'recommendations';
  }>();

  // Prompt especializado para análises de negócio com IA
  const getSystemPrompt = (type: string) => {
    const basePrompt = `Você é um analista de negócios sênior especializado em startups e MVPs. Sua função é fornecer análises precisas, insights acionáveis e recomendações estratégicas baseadas em dados.

# DADOS DO NEGÓCIO
${JSON.stringify(businessData, null, 2)}

# INSTRUÇÕES GERAIS
- Seja objetivo e direto
- Use dados concretos quando possível
- Forneça insights acionáveis
- Mantenha tom profissional mas acessível
- Foque em aspectos práticos e implementáveis
- Evite jargões desnecessários
- Sempre justifique suas recomendações

`;

    const specificPrompts = {
      market: `${basePrompt}
# ANÁLISE DE MERCADO
Analise o potencial de mercado do negócio considerando:
- Tamanho do mercado (TAM, SAM, SOM)
- Tendências e crescimento
- Concorrência e posicionamento
- Oportunidades de nicho
- Barreiras de entrada

Forneça uma análise estruturada com métricas estimadas e insights sobre o posicionamento competitivo.`,

      viability: `${basePrompt}
# ANÁLISE DE VIABILIDADE
Avalie a viabilidade do negócio considerando:
- Modelo de negócio e monetização
- Estrutura de custos vs receitas
- Tempo para break-even
- Escalabilidade
- Recursos necessários
- Riscos financeiros

Forneça um score de viabilidade (0-10) com justificativa detalhada.`,

      risks: `${basePrompt}
# ANÁLISE DE RISCOS
Identifique e analise os principais riscos:
- Riscos de mercado
- Riscos operacionais
- Riscos financeiros
- Riscos tecnológicos
- Riscos regulatórios
- Riscos competitivos

Para cada risco, forneça: probabilidade, impacto e estratégias de mitigação.`,

      opportunities: `${basePrompt}
# ANÁLISE DE OPORTUNIDADES
Identifique oportunidades estratégicas:
- Expansão de mercado
- Novos segmentos de clientes
- Parcerias estratégicas
- Inovações de produto
- Canais de distribuição
- Monetização adicional

Prioritize as oportunidades por potencial de impacto e facilidade de implementação.`,

      recommendations: `${basePrompt}
# RECOMENDAÇÕES ESTRATÉGICAS
Forneça recomendações práticas e priorizadas:
- Próximos passos imediatos (30 dias)
- Ações de médio prazo (90 dias)
- Estratégias de longo prazo (6-12 meses)
- Métricas para acompanhar
- Recursos necessários
- Cronograma sugerido

Foque em ações que maximizem o ROI e reduzam riscos.`
    };

    return specificPrompts[type as keyof typeof specificPrompts] || specificPrompts.recommendations;
  };

  try {
    // Obter configurações do modelo a partir dos cookies
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const apiKeys = getApiKeysFromCookie(cookieHeader);
    
    // Obter provider e model dos cookies
    const savedModel = cookies.selectedModel || DEFAULT_MODEL;
    const savedProvider = cookies.selectedProvider || DEFAULT_PROVIDER.name;
    const provider = PROVIDER_LIST.find((p) => p.name === savedProvider) || DEFAULT_PROVIDER;

    // Preparar mensagens
    const messages = [
      {
        role: 'user' as const,
        content: `Analise os dados do negócio fornecidos e gere uma análise do tipo: ${analysisType}`
      }
    ];

    // Chamar streamText
    const result = await streamText({
      messages,
      options: {
        maxTokens: MAX_TOKENS,
        system: getSystemPrompt(analysisType),
      },
      apiKeys,
    });

    // Retornar o stream
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Erro na API dashboard-analysis:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Endpoint GET para análises rápidas sem stream
export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const analysisType = url.searchParams.get('type');
  const businessData = url.searchParams.get('data');

  if (!analysisType || !businessData) {
    return json({ error: 'Parâmetros obrigatórios: type e data' }, { status: 400 });
  }

  try {
    const parsedData = JSON.parse(decodeURIComponent(businessData));
    
    // Análises rápidas sem IA para métricas básicas
    const quickAnalysis = {
      market: {
        score: 8.5,
        trend: 'up',
        summary: 'Mercado em crescimento com alta demanda'
      },
      viability: {
        score: 8.7,
        trend: 'up', 
        summary: 'Modelo de negócio sólido com boa projeção'
      },
      risks: {
        score: 6.2,
        trend: 'stable',
        summary: 'Riscos moderados e controláveis'
      },
      opportunities: {
        score: 9.1,
        trend: 'up',
        summary: 'Múltiplas oportunidades de crescimento'
      }
    };

    return json(quickAnalysis[analysisType as keyof typeof quickAnalysis] || { error: 'Tipo de análise inválido' });
  } catch (error) {
    console.error('Erro na análise rápida:', error);
    return json({ error: 'Erro ao processar dados' }, { status: 500 });
  }
}