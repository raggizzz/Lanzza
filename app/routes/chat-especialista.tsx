import { json, type MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { SidebarNavigation } from '~/components/ui/sidebar-navigation';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'Chat com IA Especialista - LANZZA' },
    { name: 'description', content: 'Converse com nosso agente de negócios para refinar sua estratégia' }
  ];
};

export const loader = () => json({});

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatEspecialista() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Carregar mensagens do localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-especialista-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        // Se houver erro, usar mensagem inicial padrão
        setMessages([{
          id: '1',
          content: 'Olá! Sou Lanzza, seu consultor estratégica. Analisei as informações que você preencheu no formulário e estou aqui para te ajudar a transformar sua ideia em um negócio real e viável.\n\nBaseado no que você compartilhou:\n• <strong>Sua ideia:</strong> Uma clinica de estetica\n• <strong>Problema que resolve:</strong> Faço gente ficar bonita\n• <strong>Público-alvo:</strong> Mulheres e homens que querem ficar bonitos\n• <strong>Modelo de monetização:</strong> transaction\n\nVou te guiar através de um processo estruturado para validar e refinar esses pilares fundamentais do seu negócio. Meu objetivo é garantir que você tenha uma base sólida antes de partir para a execução.\n\nVamos começar nossa consultoria estratégica?',
          sender: 'ai',
          timestamp: new Date()
        }]);
      }
    }
    // Nota: Se não há mensagens salvas, a inicialização será feita pela função iniciarConversaAutomatica
    // ou permanecerá vazio até que o usuário envie a primeira mensagem
  }, []);

  // Salvar mensagens no localStorage sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-especialista-messages', JSON.stringify(messages));
    }
  }, [messages]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationProgress, setConversationProgress] = useState(15);
  const [userFormData, setUserFormData] = useState<any>(null);

  // Carregar dados do formulário do localStorage e iniciar conversa automaticamente
  useEffect(() => {
    const savedFormData = localStorage.getItem('formulario-estrategico');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setUserFormData(parsedData);
        
        // Se há dados do formulário e não há mensagens salvas, iniciar conversa automaticamente
        const savedMessages = localStorage.getItem('chat-especialista-messages');
        if (!savedMessages) {
          iniciarConversaAutomatica(parsedData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error);
      }
    }
  }, []);

  // Função para iniciar conversa automaticamente com base no formulário
  const iniciarConversaAutomatica = async (formData: any) => {
    try {
      // Criar mensagem inicial personalizada baseada no formulário
      const mensagemInicial = `Olá! Sou Lanzza, seu consultor estratégico de negócios. Analisei as informações que você preencheu no formulário e estou aqui para te ajudar a transformar sua ideia em um negócio real e viável.

Baseado no que você compartilhou:
• <strong>Sua ideia:</strong> ${formData.businessIdea || 'Não especificada'}
• <strong>Problema que resolve:</strong> ${formData.problemSolving || 'Não especificado'}
• <strong>Público-alvo:</strong> ${formData.targetMarket || 'Não especificado'}
• <strong>Modelo de monetização:</strong> ${formData.businessModel || 'Não especificado'}

Vou te guiar através de um processo estruturado para validar e refinar esses pilares fundamentais do seu negócio. Meu objetivo é garantir que você tenha uma base sólida antes de partir para a execução.

Vamos começar nossa consultoria estratégica?`;

      const aiMessage: Message = {
        id: 'auto-' + Date.now().toString(),
        content: mensagemInicial,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([aiMessage]);
      setIsTyping(false);
      
    } catch (error) {
      console.error('Erro ao iniciar conversa automática:', error);
      // Fallback para mensagem padrão
      setMessages([{
        id: '1',
        content: 'Olá! Sou Lanzza, seu consultor estratégico de negócios. Vamos trabalhar juntos para transformar sua ideia em um negócio viável?',
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  };

  const suggestedQuestions = [
    "Como vou conseguir meus primeiros clientes?",
    "Qual seria o preço ideal para minha solução?",
    "Quem seriam meus principais concorrentes?",
    "Como vou medir o sucesso do meu MVP?"
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Preparar mensagens para a API
      const apiMessages = messages
        .filter(msg => msg.sender !== 'ai' || msg.id !== '1') // Remove mensagem inicial
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Adicionar a nova mensagem do usuário
      apiMessages.push({
        role: 'user',
        content: content
      });

      // Fazer chamada para a API
      const response = await fetch('/api/chat-especialista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userFormData: userFormData
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      // Criar mensagem da IA para streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Processar stream da resposta do AI SDK
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let accumulatedContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Processar chunks do AI SDK DataStream
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Extrair conteúdo de texto do formato AI SDK
              const content = line.substring(2);
              try {
                const parsed = JSON.parse(content);
                if (typeof parsed === 'string') {
                  accumulatedContent += parsed;
                }
              } catch {
                // Se não for JSON, adicionar como texto simples
                accumulatedContent += content;
              }
            }
          }
          
          // Atualizar mensagem da IA com o conteúdo acumulado
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }
      }
      
      setConversationProgress(prev => Math.min(prev + 15, 100));
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setIsTyping(false);
      
      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundRays />
      
      <div className="relative z-10 flex">
        {/* Sidebar com Menu Vertical */}
        <SidebarNavigation />
        
        {/* Conteúdo Principal */}
        <div className="flex-1 px-6 py-12 md:px-12">
          <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chat com IA Especialista
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Converse com Lanzza para refinar sua estratégia de negócios
            </p>
            
            {/* Progress */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progresso da Conversa</span>
                <span className="text-sm text-purple-400">{conversationProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${conversationProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 border-b border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Lanzza - Consultor de Negócios</h3>
                      <p className="text-sm text-gray-400">Especialista em Startups B2B</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-400">Online</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'bg-gray-800/50 border border-gray-700/50'
                        }`}
                      >
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }}
                        />
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-400">Lanzza está digitando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700/50">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                      placeholder="Digite sua resposta..."
                      className="flex-1 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Questions */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Perguntas Sugeridas
                </h3>
                <div className="space-y-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm hover:border-purple-500/50 hover:bg-purple-900/10 transition-all duration-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Próximos Passos
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Formulário Estratégico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Chat com IA Especialista</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Business Model Canvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>MVP Builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>Dashboard Final</span>
                  </div>
                </div>
                
                {conversationProgress >= 80 && (
                  <div className="mt-6">
                    <Link
                      to="/business-canvas"
                      className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Continuar para Canvas
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}