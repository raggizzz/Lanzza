import { streamText } from '~/lib/.server/llm/stream-text';
import { getApiKeysFromCookie, parseCookies } from '~/lib/api/cookies';
import { MAX_TOKENS } from '~/lib/.server/llm/constants';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, PROVIDER_LIST } from '~/utils/constants';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request }: ActionFunctionArgs) {
  const { chatMessages } = await request.json<{
    chatMessages: any[];
  }>();

  // Extrair apenas o conteúdo das mensagens para análise
  const conversationHistory = chatMessages.map(msg => `${msg.sender === 'user' ? 'Usuário' : 'IA Especialista'}: ${msg.content}`).join('\n\n');

  // Prompt para gerar Business Model Canvas
  const systemPrompt = `Você é um especialista em Business Model Canvas e estratégia de negócios. Sua tarefa é analisar toda a conversa entre o usuário e a IA especialista em negócios e gerar um Business Model Canvas completo e personalizado baseado nas informações discutidas.

# HISTÓRICO DA CONVERSA COM IA ESPECIALISTA
${conversationHistory}

# INSTRUÇÕES
1. Analise cuidadosamente toda a conversa entre o usuário e a IA especialista
2. Extraia insights estratégicos, definições de negócio, validações e refinamentos discutidos
3. Gere conteúdo específico e relevante para cada um dos 9 blocos do Business Model Canvas
4. Base suas sugestões nas informações reais discutidas na conversa
5. Seja específico e prático - evite generalidades
6. Cada bloco deve ter entre 3-6 itens relevantes
7. Priorize informações que foram validadas ou refinadas durante a conversa

# FORMATO DE RESPOSTA
Retorne APENAS um JSON válido com a seguinte estrutura:

{
  "sections": [
    {
      "id": "key-partners",
      "title": "Parceiros-Chave",
      "content": ["item1", "item2", "item3"],
      "color": "from-blue-500/20 to-blue-600/20 border-blue-500/30",
      "description": "Quem são seus parceiros estratégicos?"
    },
    {
      "id": "key-activities",
      "title": "Atividades-Chave",
      "content": ["item1", "item2", "item3"],
      "color": "from-green-500/20 to-green-600/20 border-green-500/30",
      "description": "Principais atividades do seu negócio"
    },
    {
      "id": "key-resources",
      "title": "Recursos-Chave",
      "content": ["item1", "item2", "item3"],
      "color": "from-purple-500/20 to-purple-600/20 border-purple-500/30",
      "description": "Recursos essenciais para operar"
    },
    {
      "id": "value-propositions",
      "title": "Proposta de Valor",
      "content": ["item1", "item2", "item3"],
      "color": "from-orange-500/20 to-orange-600/20 border-orange-500/30",
      "description": "O que você oferece de único?"
    },
    {
      "id": "customer-relationships",
      "title": "Relacionamento com Clientes",
      "content": ["item1", "item2", "item3"],
      "color": "from-pink-500/20 to-pink-600/20 border-pink-500/30",
      "description": "Como você se relaciona com clientes?"
    },
    {
      "id": "channels",
      "title": "Canais",
      "content": ["item1", "item2", "item3"],
      "color": "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
      "description": "Como você alcança seus clientes?"
    },
    {
      "id": "customer-segments",
      "title": "Segmentos de Clientes",
      "content": ["item1", "item2", "item3"],
      "color": "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30",
      "description": "Quem são seus clientes?"
    },
    {
      "id": "cost-structure",
      "title": "Estrutura de Custos",
      "content": ["item1", "item2", "item3"],
      "color": "from-red-500/20 to-red-600/20 border-red-500/30",
      "description": "Principais custos do negócio"
    },
    {
      "id": "revenue-streams",
      "title": "Fontes de Receita",
      "content": ["item1", "item2", "item3"],
      "color": "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
      "description": "Como você ganha dinheiro?"
    }
  ]
}

# IMPORTANTE
- Retorne APENAS o JSON, sem texto adicional
- Base-se nas informações reais discutidas na conversa
- Seja específico para o negócio do usuário conforme refinado na conversa
- Mantenha a estrutura exata do JSON
- Se alguma informação não foi discutida na conversa, use insights estratégicos baseados no contexto geral do negócio`;

  try {
    // Obter configurações do modelo a partir dos cookies
    const cookieHeader = request.headers.get('cookie');
    const apiKeys = getApiKeysFromCookie(cookieHeader);

    // Preparar mensagens
    const messages = [
      {
        role: 'user' as const,
        content: 'Gere um Business Model Canvas baseado na conversa com o especialista.'
      }
    ];

    // Chamar a IA
    const result = await streamText({
      messages,
      options: {
        maxTokens: MAX_TOKENS,
        system: systemPrompt,
      },
      apiKeys,
    });

    // Coletar toda a resposta
    let fullResponse = '';
    for await (const chunk of result.textStream) {
      fullResponse += chunk;
    }

    // Tentar fazer parse do JSON
    try {
      const canvasData = JSON.parse(fullResponse);
      return Response.json(canvasData);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Resposta da IA:', fullResponse);
      
      // Retornar um canvas padrão em caso de erro
      return Response.json({
        sections: [
          {
            id: 'key-partners',
            title: 'Parceiros-Chave',
            content: ['Fornecedores principais', 'Parceiros estratégicos', 'Alianças importantes'],
            color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
            description: 'Quem são seus parceiros estratégicos?'
          },
          {
            id: 'key-activities',
            title: 'Atividades-Chave',
            content: ['Desenvolvimento do produto', 'Marketing e vendas', 'Atendimento ao cliente'],
            color: 'from-green-500/20 to-green-600/20 border-green-500/30',
            description: 'Principais atividades do seu negócio'
          },
          {
            id: 'key-resources',
            title: 'Recursos-Chave',
            content: ['Equipe especializada', 'Tecnologia', 'Capital'],
            color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
            description: 'Recursos essenciais para operar'
          },
          {
            id: 'value-propositions',
            title: 'Proposta de Valor',
            content: ['Solução inovadora', 'Economia de tempo', 'Resultados garantidos'],
            color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
            description: 'O que você oferece de único?'
          },
          {
            id: 'customer-relationships',
            title: 'Relacionamento com Clientes',
            content: ['Atendimento personalizado', 'Suporte contínuo', 'Comunidade de usuários'],
            color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
            description: 'Como você se relaciona com clientes?'
          },
          {
            id: 'channels',
            title: 'Canais',
            content: ['Website', 'Redes sociais', 'Vendas diretas'],
            color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
            description: 'Como você alcança seus clientes?'
          },
          {
            id: 'customer-segments',
            title: 'Segmentos de Clientes',
            content: ['Pequenas empresas', 'Startups', 'Empreendedores'],
            color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
            description: 'Quem são seus clientes?'
          },
          {
            id: 'cost-structure',
            title: 'Estrutura de Custos',
            content: ['Desenvolvimento', 'Marketing', 'Operações'],
            color: 'from-red-500/20 to-red-600/20 border-red-500/30',
            description: 'Principais custos do negócio'
          },
          {
            id: 'revenue-streams',
            title: 'Fontes de Receita',
            content: ['Assinatura mensal', 'Taxa de setup', 'Serviços premium'],
            color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
            description: 'Como você ganha dinheiro?'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Erro ao gerar canvas:', error);
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}