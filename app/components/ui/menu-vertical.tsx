import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@remix-run/react";

type MenuItem = {
  label: string;
  href: string;
};

interface MenuVerticalProps {
  menuItems: MenuItem[];
  color?: string;
  skew?: number;
}

export const MenuVertical = ({
  menuItems = [],
  color = "#ff6900",
  skew = 0,
}: MenuVerticalProps) => {
  return (
    <div className="flex flex-col gap-4">
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
            <ArrowRight strokeWidth={3} className="size-10" />
          </motion.div>

          <Link to={item.href} className="no-underline">
            <motion.div
              variants={{
                initial: { x: -40, color: "inherit" },
                hover: { x: 0, color, skewX: skew },
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-semibold text-4xl"
            >
              {item.label}
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};