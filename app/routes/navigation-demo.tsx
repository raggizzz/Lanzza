import { type MetaFunction } from '@remix-run/cloudflare';
import { MenuVertical } from '~/components/ui/menu-vertical';
import NavigationMenu from '~/components/ui/navigation-menu';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [
    { title: 'Demo de Navegação - Lanzza' },
    { name: 'description', content: 'Demonstração do componente de navegação vertical' },
  ];
};

export default function NavigationDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <BackgroundRays />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Demo de Navegação
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Demonstração do componente MenuVertical integrado ao projeto Lanzza
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Menu Principal */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-8 text-center text-purple-400">
              Menu Principal
            </h2>
            <div className="flex justify-center">
              <NavigationMenu />
            </div>
          </div>

          {/* Menu Customizado */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-8 text-center text-blue-400">
              Menu Customizado
            </h2>
            <div className="flex justify-center">
              <MenuVertical
                menuItems={[
                  {
                    label: "Início",
                    href: "/",
                  },
                  {
                    label: "Autenticação",
                    href: "/auth",
                  },
                  {
                    label: "Business Canvas",
                    href: "/business-canvas",
                  },
                ]}
                color="#3b82f6"
                skew={-2}
              />
            </div>
          </div>
        </div>

        {/* Instruções de Uso */}
        <div className="mt-16 bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
            Como Usar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Importação</h3>
              <pre className="bg-gray-900/50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`import { MenuVertical } from "~/components/ui/menu-vertical";
import NavigationMenu from "~/components/ui/navigation-menu";`}</code>
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Uso Básico</h3>
              <pre className="bg-gray-900/50 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`<MenuVertical
  menuItems={[
    { label: "Home", href: "/" },
    { label: "About", href: "/about" }
  ]}
  color="#ff6900"
  skew={2}
/>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}