import { MenuVertical } from "~/components/ui/menu-vertical";

const NavigationMenu = () => {
  return (
    <MenuVertical
      menuItems={[
        {
          label: "Jornada",
          href: "/jornada",
        },
        {
          label: "MVP Builder",
          href: "/mvp-builder",
        },
        {
          label: "Dashboard Final",
          href: "/dashboard-final",
        },
      ]}
      color="#ff6900"
      skew={2}
    />
  );
};

export default NavigationMenu;