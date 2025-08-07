import { motion } from "framer-motion";
import { ArrowRight, User, Home } from "lucide-react";
import { Link } from "@remix-run/react";

type MenuItem = {
  label: string;
  href: string;
};

interface SidebarNavigationProps {
  menuItems?: MenuItem[];
  color?: string;
  skew?: number;
  userName?: string;
  userEmail?: string;
}

export const SidebarNavigation = ({
  menuItems = [
    { label: "Jornada", href: "/jornada" },
    { label: "MVP Builder", href: "/mvp-builder" },
    { label: "Dashboard Final", href: "/dashboard-final" },
  ],
  color = "#ff6900",
  skew = 0,
  userName = "Usuário",
  userEmail = "usuario@exemplo.com",
}: SidebarNavigationProps) => {
  return (
    <div className="w-80 min-h-screen bg-black/40 backdrop-blur-xl border-r border-gray-700/50 p-8 flex flex-col">
      {/* Logo Section */}
      <div className="mb-12">
        <Link 
          to="/" 
          className="block transition-all duration-300 hover:scale-105"
        >
          <img 
            src="/logo-dark.png" 
            alt="LANZZA" 
            className="h-12 w-auto mb-4"
          />
        </Link>
        <div className="h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </div>

      {/* User Info Section */}
      <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{userName}</p>
            <p className="text-gray-400 text-xs">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1">
        <h3 className="text-purple-400 font-semibold mb-6 text-sm uppercase tracking-wider">Navegação</h3>
        <div className="flex flex-col gap-4">
          {/* Home Button */}
          <motion.div
            className="group relative flex items-center gap-4 cursor-pointer"
            initial="initial"
            whileHover="hover"
          >
            <motion.div
              variants={{
                initial: { x: 0, rotate: 0 },
                hover: { x: 10, rotate: 45 },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-gray-400 group-hover:text-white transition-colors"
            >
              <Home strokeWidth={2} className="size-6" />
            </motion.div>

            <Link to="/" className="no-underline">
              <motion.div
                variants={{
                  initial: { x: -20, color: "inherit" },
                  hover: { x: 0, color: "#ffffff", skewX: skew },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-semibold text-lg text-gray-300 group-hover:text-white"
              >
                Início
              </motion.div>
            </Link>
          </motion.div>

          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              className="group relative flex items-center gap-4 cursor-pointer"
              initial="initial"
              whileHover="hover"
            >
              <motion.div
                variants={{
                  initial: { x: 0, rotate: 0 },
                  hover: { x: 10, rotate: 45 },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-gray-400 group-hover:text-white transition-colors"
              >
                <ArrowRight strokeWidth={2} className="size-6" />
              </motion.div>

              <Link to={item.href} className="no-underline">
                <motion.div
                  variants={{
                    initial: { x: -20, color: "inherit" },
                    hover: { x: 0, color, skewX: skew },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="font-semibold text-lg text-gray-300 group-hover:text-white"
                >
                  {item.label}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          © 2024 LANZZA
        </p>
      </div>
    </div>
  );
};